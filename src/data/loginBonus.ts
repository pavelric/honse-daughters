/**
 * Login bonuses: on the first load/index of a game day, every active bonus advances by one day
 * and its rewards for that day go to the present box. load/index lists only the bonuses claimed
 * by that load, which is what makes the client play their stamp screens (once per day).
 *
 * Bonus types (login_bonus_data.type):
 *   1 normal    - loops over its count_num days forever
 *   2 beginner  - count_num days, then done
 *   3 campaign  - a one-off day (count_num 1)
 *   4 stepped   - bonuses sharing a group_id, claimed one step after the other
 */
import { readFileSync } from 'fs'
import path from 'path'
import { getServerTime } from '../utils'
import { addUserPresent, getUserLoginBonusProgress, setUserLoginBonusProgress } from './honseData'

interface LoginBonus {
    id: number
    type: number
    count_num: number
    disp_order: number
    group_id: number
    step: number
    start_date: string
    end_date: string
    rewards: Record<string, [number, number, number][]>   // day -> [item_category, item_id, item_num]
}

const enum BonusType { Normal = 1, Beginner = 2, Campaign = 3, Stepped = 4 }

// Master periods turn over at 15:00 UTC, so that is when a new game day starts.
const DAILY_RESET_UTC_HOUR = 15

let bonuses: LoginBonus[] | null = null
function loginBonuses(): LoginBonus[] {
    bonuses ??= JSON.parse(readFileSync(path.join(process.cwd(), 'assets', 'login_bonus_data.json'), 'utf-8'))
    return bonuses!
}

/** Master date ("2026/10/15 15:00:00", UTC) to unix seconds. */
function masterTime(s: string): number {
    const [date, time] = s.split(' ')
    const [y, m, d] = date.split('/').map(Number)
    const [hh, mm, ss] = time.split(':').map(Number)
    return Date.UTC(y, m - 1, d, hh, mm, ss) / 1000
}

function gameDay(time: number): number {
    return Math.floor((time - DAILY_RESET_UTC_HOUR * 3600) / 86400)
}

/** Claims today's day of every active login bonus; returns load/index's login_bonus_list. */
export function claimLoginBonuses(viewerId: number): { login_bonus_id: number, total_count: number }[] {
    const now = getServerTime()
    const today = gameDay(now)
    const progress = new Map(getUserLoginBonusProgress(viewerId).map(p => [p.login_bonus_id, p]))
    const countOf = (b: LoginBonus) => progress.get(b.id)?.total_count ?? 0
    const active = loginBonuses()
        .filter(b => masterTime(b.start_date) <= now && now <= masterTime(b.end_date))
        .sort((a, b) => a.disp_order - b.disp_order)
    const groupClaimedToday = new Set(active
        .filter(b => b.type === BonusType.Stepped && progress.get(b.id)?.last_claim_day === today)
        .map(b => b.group_id))

    const claimed: { login_bonus_id: number, total_count: number }[] = []
    for (const b of active) {
        if (progress.get(b.id)?.last_claim_day === today) continue
        const count = countOf(b)
        if (b.type !== BonusType.Normal && count >= b.count_num) continue
        if (b.type === BonusType.Stepped) {
            // one stamp per group per day, and only once the earlier steps are complete
            if (groupClaimedToday.has(b.group_id)) continue
            if (active.some(o => o.type === BonusType.Stepped && o.group_id === b.group_id && o.step < b.step && countOf(o) < o.count_num)) continue
            groupClaimedToday.add(b.group_id)
        }

        const day = b.type === BonusType.Normal ? count % b.count_num + 1 : count + 1
        setUserLoginBonusProgress(viewerId, b.id, day, today)
        for (const [category, itemId, num] of b.rewards[String(day)] ?? []) {
            addUserPresent(viewerId, itemId, num, category, 'Login bonus')
        }
        claimed.push({ login_bonus_id: b.id, total_count: day })
    }
    return claimed
}
