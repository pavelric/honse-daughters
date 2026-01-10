import { TrainingCharaInfo, TrainingHomeInfo, TrainingSupportCard, TrainingCommandLevelInfo, TrainingReservedRaceDeck, TrainingUncheckedEvent, TrainingStartChara, UserTpInfo } from './types'
import { RequestCommon, getServerTime, formatServerTimestamp } from '../utils'
import { getUserSupportCardById, getUserCards } from './honseData'
import { readFileSync } from 'fs'
import path from 'path'
import getDatabase, { Database } from './index'

export interface TrainingStartRequest extends RequestCommon {
    current_money: number
    current_succession_rank_point: number
    start_chara: TrainingStartChara
    tp_info: UserTpInfo
    use_tp: number
}

export function startTrainingRun(req: TrainingStartRequest) {
    const supportCardArray = buildSupportCardArray(req)

    const trainingLevels: TrainingCommandLevelInfo[] = [
        { command_id: 101, level: 1 },
        { command_id: 102, level: 1 },
        { command_id: 103, level: 1 },
        { command_id: 105, level: 1 },
        { command_id: 106, level: 1 },
        { command_id: 601, level: 5 },
        { command_id: 602, level: 5 },
        { command_id: 603, level: 5 },
        { command_id: 604, level: 5 },
        { command_id: 605, level: 5 }
    ]

    const evaluationInfo = computeEvaluationInfo(req, supportCardArray)

    const charaInfo = buildCharaInfo(req, evaluationInfo, supportCardArray, trainingLevels)

    const homeInfo: TrainingHomeInfo = {
        available_continue_num: 3,
        available_free_continue_num: 1,
        command_info_array: [
            {
                command_id: 101,
                command_type: 1,
                failure_rate: 0,
                is_enable: 1,
                level: 1,
                params_inc_dec_info_array: [
                    { target_type: 1, value: 12 },
                    { target_type: 3, value: 5 },
                    { target_type: 30, value: 2 },
                    { target_type: 10, value: -21 }
                ],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 105,
                command_type: 1,
                failure_rate: 0,
                is_enable: 1,
                level: 1,
                params_inc_dec_info_array: [
                    { target_type: 2, value: 9 },
                    { target_type: 4, value: 4 },
                    { target_type: 30, value: 2 },
                    { target_type: 10, value: -19 }
                ],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 102,
                command_type: 1,
                failure_rate: 0,
                is_enable: 1,
                level: 1,
                params_inc_dec_info_array: [
                    { target_type: 2, value: 5 },
                    { target_type: 3, value: 8 },
                    { target_type: 30, value: 2 },
                    { target_type: 10, value: -20 }
                ],
                tips_event_partner_array: [],
                training_partner_array: [1, 2]
            },
            {
                command_id: 103,
                command_type: 1,
                failure_rate: 0,
                is_enable: 1,
                level: 1,
                params_inc_dec_info_array: [
                    { target_type: 1, value: 6 },
                    { target_type: 3, value: 6 },
                    { target_type: 4, value: 11 },
                    { target_type: 30, value: 2 },
                    { target_type: 10, value: -22 }
                ],
                tips_event_partner_array: [],
                training_partner_array: [5, 6]
            },
            {
                command_id: 106,
                command_type: 1,
                failure_rate: 0,
                is_enable: 1,
                level: 1,
                params_inc_dec_info_array: [ // values have to be determined with the training's logic
                    { target_type: 1, value: 2 },
                    { target_type: 5, value: 9 },
                    { target_type: 30, value: 4 },
                    { target_type: 10, value: 5 }
                ],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 301,
                command_type: 3,
                failure_rate: 0,
                is_enable: 1,
                level: 0,
                params_inc_dec_info_array: [],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 390,
                command_type: 3,
                failure_rate: 0,
                is_enable: 1,
                level: 0,
                params_inc_dec_info_array: [],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 401,
                command_type: 4,
                failure_rate: 0,
                is_enable: 0,
                level: 0,
                params_inc_dec_info_array: [],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 701,
                command_type: 7,
                failure_rate: 0,
                is_enable: 1,
                level: 0,
                params_inc_dec_info_array: [],
                tips_event_partner_array: [],
                training_partner_array: []
            },
            {
                command_id: 801,
                command_type: 8,
                failure_rate: 0,
                is_enable: 0,
                level: 0,
                params_inc_dec_info_array: [],
                tips_event_partner_array: [],
                training_partner_array: []
            }
        ],
        disable_command_id_array: [],
        free_continue_num: 1,
        free_continue_time: 0,
        race_entry_restriction: 1,
        shortened_race_state: 0
    }

    const reservedRaceArray: TrainingReservedRaceDeck[] = []
    for (let i = 0; i < 9; i++) {
        reservedRaceArray.push({
            deck_name: '',
            deck_num: i,
            race_array: []
        })
    }

    const now = getServerTime()
    const maxTp = req.tp_info?.max_tp ?? 100
    const useTp = req.use_tp ? 30 : 0
    const currentTp = Math.max(0, (req.tp_info?.current_tp ?? maxTp) - useTp)
    const shortage = Math.max(0, maxTp - currentTp)
    const maxRecoveryTime = shortage > 0 ? now + shortage * 600 : 0
    const tpInfo: UserTpInfo = {
        current_tp: currentTp,
        max_recovery_time: maxRecoveryTime,
        max_tp: maxTp
    }

    const uncheckedEvents: TrainingUncheckedEvent = {
        chara_id: 1032,
        event_contents_info: {
            choice_array: [
                {
                    receive_item_id: 0,
                    select_index: 1,
                    target_race_id: 0
                }
            ],
            show_clear: 0,
            show_clear_sort_id: 0,
            support_card_id: 0
        },
        event_id: 3000,
        minigame_result: null,
        play_timing: 1,
        story_id: 501032100,
        succession_event_info: null
    }

    const payload = {
        add_trained_chara_array: [],
        chara_info: charaInfo,
        home_info: homeInfo,
        mission_list: [],
        race_condition_array: [],
        reserved_race_array: reservedRaceArray,
        story_event_chara_bonus_list: [],
        story_event_mission_list: [],
        tp_info: tpInfo,
        unchecked_event_array: [uncheckedEvents],
        user_item_array: []
    }
    persistTrainingRun(req.viewer_id, req.start_chara.card_id, req.start_chara.scenario_id, payload)
    return payload
}

type SupportEffectsEntry = any
type UmaRarityEntry = any

let supportEffectsCache: SupportEffectsEntry[] | null = null
let umaRarityCache: UmaRarityEntry[] | null = null

function loadSupportEffects(): SupportEffectsEntry[] | any {
    if (supportEffectsCache) return supportEffectsCache
    const p = path.join(process.cwd(), 'assets', 'support_cards_effect_table_data.json')
    const raw = readFileSync(p, 'utf-8')
    supportEffectsCache = JSON.parse(raw)
    return supportEffectsCache
}

function loadUmaRarityData(): UmaRarityEntry[] | any {
    if (umaRarityCache) return umaRarityCache
    const p = path.join(process.cwd(), 'assets', 'umas_rarity_data.json')
    const raw = readFileSync(p, 'utf-8')
    umaRarityCache = JSON.parse(raw)
    return umaRarityCache
}

function calcSupportCardLevel(exp: number, limitBreakCount: number): number {
    const maxLevel = 30 + Math.max(0, limitBreakCount) * 5
    const perLevelExp = 100
    const level = Math.min(maxLevel, Math.floor(exp / perLevelExp) + 1)
    return Math.max(1, level)
}

function getInitialFriendshipGauge(supportCardId: number, level: number): number {
    const entries = loadSupportEffects()
    let data: any = null
    if (Array.isArray(entries)) {
        data = entries.find((e: any) => e && (e.id === supportCardId || e.support_card_id === supportCardId))
    }
    if (!data) return 0
    const effects: any[] = data.effects || data.effect_array || []
    const init = effects.find((ef: any) => ef && (ef.type === 14 || ef.effect_type === 14))
    if (!init) return 0
    const values = init.values || init.value_by_level || init.level_values || []
    if (Array.isArray(values) && values.length > 0) {
        const idx = Math.max(0, Math.min(values.length - 1, level - 1))
        const v = values[idx]
        return typeof v === 'number' ? v : 0
    }
    const base = init.value ?? init.base_value ?? 0
    const perLv = init.per_level ?? 0
    return base + perLv * Math.max(0, level - 1)
}

function buildSupportCardArray(req: TrainingStartRequest): TrainingSupportCard[] {
    const arr: TrainingSupportCard[] = []
    const baseIds = req.start_chara.support_card_ids || []
    for (let i = 0; i < Math.min(5, baseIds.length); i++) {
        const id = baseIds[i]
        const row = getUserSupportCardById(req.viewer_id, id)
        arr.push({
            exp: row?.exp ?? 0,
            limit_break_count: row?.limit_break_count ?? 0,
            owner_viewer_id: req.viewer_id,
            position: i + 1,
            support_card_id: id
        })
    }
    const friend = req.start_chara.friend_support_card_info
    if (friend && friend.support_card_id) {
        const id = friend.support_card_id
        const row = getUserSupportCardById(friend.viewer_id, id)
        arr.push({
            exp: row?.exp ?? 0,
            limit_break_count: row?.limit_break_count ?? 0,
            owner_viewer_id: friend.viewer_id,
            position: 6,
            support_card_id: id
        })
    }
    return arr
}

function computeEvaluationInfo(req: TrainingStartRequest, supportCards: TrainingSupportCard[]) {
    const evals: { evaluation: number, is_appear: number, target_id: number }[] = []
    for (let i = 0; i < supportCards.length; i++) {
        const sc = supportCards[i]
        const lvl = calcSupportCardLevel(sc.exp, sc.limit_break_count)
        const gauge = getInitialFriendshipGauge(sc.support_card_id, lvl)
        evals.push({ evaluation: Math.max(0, Math.floor(gauge)), is_appear: 1, target_id: i + 1 })
    }
    const arr = [
        ...evals,
        { evaluation: 0, is_appear: 0, target_id: 101 },
        { evaluation: 0, is_appear: 0, target_id: 102 },
        { evaluation: 0, is_appear: 0, target_id: 103 },
        { evaluation: 0, is_appear: 0, target_id: 106 }
    ]
    return arr.map(e => ({
        evaluation: e.evaluation,
        group_outing_info_array: [],
        is_appear: e.is_appear,
        is_outing: 0,
        story_step: 0,
        target_id: e.target_id,
        training_partner_id: e.target_id
    }))
}

function getUserCardInfo(viewerId: number, cardId: number) {
    const cards = getUserCards(viewerId)
    const row = Array.isArray(cards) ? cards.find((c: any) => c.card_id === cardId) : undefined
    return row || null
}

function getUmaStats(cardId: number) {
    const data = loadUmaRarityData()
    let entry: any = null
    if (Array.isArray(data)) {
        entry = data.find((e: any) => e && (e.card_id === cardId || e.id === cardId))
    }
    return {
        default_max_guts: entry?.default_max_guts ?? 1200,
        default_max_power: entry?.default_max_power ?? 1200,
        default_max_speed: entry?.default_max_speed ?? 1200,
        default_max_stamina: entry?.default_max_stamina ?? 1200,
        default_max_wiz: entry?.default_max_wiz ?? 1200,
        speed: entry?.initial_speed ?? 92,
        stamina: entry?.initial_stamina ?? 81,
        power: entry?.initial_power ?? 86,
        guts: entry?.initial_guts ?? 79,
        wiz: entry?.initial_wiz ?? 92
    }
}

type RouteRaceEntry = { id: number, route_id: number, turn: number }
let routeRaceCache: RouteRaceEntry[] | null = null

function loadRouteRaceData(): RouteRaceEntry[] {
    if (routeRaceCache) return routeRaceCache
    const p = path.join(process.cwd(), 'assets', 'umas_route_race_data.json')
    const raw = readFileSync(p, 'utf-8')
    const obj = JSON.parse(raw)
    const entries: RouteRaceEntry[] = []
    for (const k of Object.keys(obj)) {
        const rec = obj[k]
        const id = Number(k)
        const rid = Number(rec?.route_id ?? 0)
        const t = Number(rec?.turn ?? 0)
        if (!Number.isNaN(id) && !Number.isNaN(rid)) {
            entries.push({ id, route_id: rid, turn: t })
        }
    }
    routeRaceCache = entries
    return routeRaceCache
}

function selectRouteForScenario(scenarioId: number): { routeId: number, ids: number[] } {
    const entries = loadRouteRaceData()
    const groups = new Map<number, RouteRaceEntry[]>()
    for (const e of entries) {
        const g = groups.get(e.route_id)
        if (g) g.push(e); else groups.set(e.route_id, [e])
    }
    const preferred: Record<number, number> = { 1: 17 }
    let chosen = preferred[scenarioId]
    if (chosen === undefined || !groups.has(chosen)) {
        let bestId = 0
        let bestLen = -1
        for (const [rid, arr] of groups.entries()) {
            if (arr.length > bestLen) {
                bestLen = arr.length
                bestId = rid
            }
        }
        chosen = bestId || 17
    }
    const arr = groups.get(chosen) || []
    arr.sort((a, b) => (a.turn - b.turn) || (a.id - b.id))
    const ids = arr.map(e => e.id)
    if (ids.length === 0) {
        return { routeId: 17, ids: [181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192] }
    }
    return { routeId: chosen, ids }
}

function buildCharaInfo(req: TrainingStartRequest, evaluationInfo: any[], supportCardArray: TrainingSupportCard[], trainingLevels: TrainingCommandLevelInfo[]): TrainingCharaInfo {
    const stats = getUmaStats(req.start_chara.card_id)
    const userCard = getUserCardInfo(req.viewer_id, req.start_chara.card_id)
    const rarity = userCard?.rarity ?? 1
    const talent = userCard?.talent_level ?? 1
    const routeSel = selectRouteForScenario(req.start_chara.scenario_id)
    return {
        card_id: req.start_chara.card_id,
        chara_effect_id_array: [],
        chara_grade: 1,
        default_max_guts: stats.default_max_guts,
        default_max_power: stats.default_max_power,
        default_max_speed: stats.default_max_speed,
        default_max_stamina: stats.default_max_stamina,
        default_max_wiz: stats.default_max_wiz,
        disable_skill_id_array: [],
        evaluation_info_array: evaluationInfo,
        fans: 1,
        guest_outing_info_array: [],
        guts: stats.guts,
        is_short_race: 0,
        max_guts: stats.default_max_guts,
        max_power: stats.default_max_power,
        max_speed: stats.default_max_speed,
        max_stamina: stats.default_max_stamina,
        max_vital: 100,
        max_wiz: stats.default_max_wiz,
        motivation: 3,
        nickname_id_array: [],
        playing_state: 1,
        power: stats.power,
        proper_distance_long: 7,
        proper_distance_middle: 7,
        proper_distance_mile: 5,
        proper_distance_short: 2,
        proper_ground_dirt: 1,
        proper_ground_turf: 7,
        proper_running_style_nige: 3,
        proper_running_style_oikomi: 2,
        proper_running_style_sashi: 6,
        proper_running_style_senko: 7,
        race_program_id: 0,
        race_running_style: 2,
        rarity: rarity,
        reserve_race_program_id: 0,
        route_id: routeSel.routeId,
        route_race_id_array: routeSel.ids,
        scenario_id: req.start_chara.scenario_id,
        short_cut_state: 0,
        single_mode_chara_id: 1,
        skill_array: [],
        skill_point: 0,
        skill_tips_array: [],
        speed: stats.speed,
        stamina: stats.stamina,
        start_time: formatServerTimestamp(),
        state: 0,
        succession_trained_chara_id_1: req.start_chara.succession_trained_chara_id_1,
        succession_trained_chara_id_2: req.start_chara.succession_trained_chara_id_2,
        support_card_array: supportCardArray,
        talent_level: talent,
        training_level_info_array: trainingLevels,
        turn: 1,
        vital: 100,
        wiz: stats.wiz
    }
}

function persistTrainingRun(viewerId: number, cardId: number, scenarioId: number, payload: any) {
    const db = getDatabase(Database.HONSE_DATA)
    const now = formatServerTimestamp()
    db.prepare(`
        INSERT INTO training_runs (viewer_id, card_id, scenario_id, start_time, last_update_time, run_state)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(viewer_id) DO UPDATE SET
            card_id=excluded.card_id,
            scenario_id=excluded.scenario_id,
            start_time=excluded.start_time,
            last_update_time=excluded.last_update_time,
            run_state=excluded.run_state
    `).run(viewerId, cardId, scenarioId, now, now, JSON.stringify(payload))
}
