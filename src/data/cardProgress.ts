/**
 * Support card / trainee card progression and support card decks.
 *
 * Costs and caps come from master.mdb via assets/card_progress_data.json
 * (scripts/masterdb/build_card_progress_data.py). Response shapes follow the client's
 * Gallop.SupportCard* / Card* / SupportCardDeck* response classes (docs/api-catalog.md).
 * Each function returns the endpoint's `data` object, or null when the request can't be
 * honoured (card not owned, not enough materials, already at the cap).
 */
import { readFileSync } from 'fs'
import path from 'path'
import getDatabase, { Database } from './index'
import { addOrUpdateUserItem, addOrUpdateUserPiece, addUserCard, checkUserCard, getUserSupportCardById } from './honseData'
import { formatServerTimestamp } from '../utils'

const ITEM_MONEY = 59
const ITEM_SUPPORT_POINTS = 110   // the "global exp" pool support cards are levelled from
const MAX_LIMIT_BREAK = 4
const MAX_TALENT_LEVEL = 5
const MAX_HINT_LEVEL = 5

interface ItemCost { item_category: number, item_id: number, item_num: number }
interface CardProgressData {
    support_card_rarity: Record<string, number>
    support_card_exp: Record<string, number[]>
    support_card_limit: Record<string, number[]>
    limit_break_items: Record<string, number>
    cards: Record<string, { default_rarity: number, talent_group_id: number, piece_id: number }>
    talent_upgrade: Record<string, Record<string, ItemCost[]>>
    hint_upgrade: Record<string, Record<string, { items: ItemCost[], money: number }>>
    skill_rarity: Record<string, number>
    need_piece_num: Record<string, number>
}

let cache: CardProgressData | null = null
function data(): CardProgressData {
    if (!cache) cache = JSON.parse(readFileSync(path.join(process.cwd(), 'assets', 'card_progress_data.json'), 'utf-8'))
    return cache!
}

function db() {
    return getDatabase(Database.HONSE_DATA)
}

// ---------------------------------------------------------------------------
// Items / pieces
// ---------------------------------------------------------------------------

function itemCount(viewerId: number, itemId: number): number {
    const row = db().prepare('SELECT number FROM user_items WHERE viewer_id = ? AND item_id = ?').get(viewerId.toString(), itemId) as { number: number } | undefined
    return row?.number ?? 0
}

function pieceCount(viewerId: number, pieceId: number): number {
    const row = db().prepare('SELECT piece_num FROM user_pieces WHERE viewer_id = ? AND piece_id = ?').get(viewerId.toString(), pieceId) as { piece_num: number } | undefined
    return row?.piece_num ?? 0
}

/** Sums costs per item id and checks the player has all of them. */
function affordable(viewerId: number, costs: ItemCost[]): Map<number, number> | null {
    const need = new Map<number, number>()
    for (const c of costs) need.set(c.item_id, (need.get(c.item_id) ?? 0) + c.item_num)
    for (const [id, n] of need) if (itemCount(viewerId, id) < n) return null
    return need
}

function spend(viewerId: number, need: Map<number, number>) {
    for (const [id, n] of need) addOrUpdateUserItem(viewerId, id, -n)
}

function userItems(viewerId: number, ids: Iterable<number>) {
    return [...new Set(ids)].map(item_id => ({ item_id, number: itemCount(viewerId, item_id) }))
}

// ---------------------------------------------------------------------------
// Support cards
// ---------------------------------------------------------------------------

function supportRarity(supportCardId: number): number {
    return data().support_card_rarity[String(supportCardId)] ?? 1
}

/** Total exp at the level cap for this rarity and limit break count. */
export function supportCardMaxExp(supportCardId: number, limitBreakCount: number): number {
    const r = String(supportRarity(supportCardId))
    const maxLevel = data().support_card_limit[r][Math.min(MAX_LIMIT_BREAK, Math.max(0, limitBreakCount))]
    return data().support_card_exp[r][maxLevel - 1]
}

/** Level for a given total exp, using master support_card_level. */
export function supportCardLevel(supportCardId: number, exp: number, limitBreakCount: number): number {
    const r = String(supportRarity(supportCardId))
    const table = data().support_card_exp[r]
    const cap = data().support_card_limit[r][Math.min(MAX_LIMIT_BREAK, Math.max(0, limitBreakCount))]
    let level = 1
    for (let i = 0; i < table.length && i < cap; i++) if (exp >= table[i]) level = i + 1
    return level
}

function toUserSupportCard(viewerId: number, supportCardId: number) {
    const row = getUserSupportCardById(viewerId, supportCardId)
    if (!row) return null
    return {
        viewer_id: viewerId,
        support_card_id: row.support_card_id,
        exp: row.exp,
        limit_break_count: row.limit_break_count,
        favorite_flag: row.favorite_flag ?? 0,
        stock: row.stock ?? 0,
        possess_time: row.possess_time ?? '',
    }
}

/**
 * Level up with Support Points (item 110) and Monies (59). The client works out the exp and money
 * for the level it wants; the server checks the player can pay and caps exp at the current max level.
 */
export function strengthenSupportCard(viewerId: number, supportCardId: number, useGlobalExp: number, useMoney: number) {
    const row = getUserSupportCardById(viewerId, supportCardId)
    if (!row || useGlobalExp <= 0) return null
    const room = supportCardMaxExp(supportCardId, row.limit_break_count) - row.exp
    const exp = Math.min(useGlobalExp, room)
    if (exp <= 0) return null
    if (itemCount(viewerId, ITEM_SUPPORT_POINTS) < exp || itemCount(viewerId, ITEM_MONEY) < useMoney) return null

    addOrUpdateUserItem(viewerId, ITEM_SUPPORT_POINTS, -exp)
    if (useMoney > 0) addOrUpdateUserItem(viewerId, ITEM_MONEY, -useMoney)
    db().prepare('UPDATE user_support_cards SET exp = exp + ? WHERE viewer_id = ? AND support_card_id = ?').run(exp, viewerId.toString(), supportCardId)
    return {
        support_card_data: toUserSupportCard(viewerId, supportCardId),
        item_data_array: userItems(viewerId, [ITEM_MONEY, ITEM_SUPPORT_POINTS]),
    }
}

/** Limit break using duplicate copies (the card's `stock`). */
export function limitBreakSupportCard(viewerId: number, supportCardId: number, materialNum: number) {
    const row = getUserSupportCardById(viewerId, supportCardId)
    const n = Math.max(1, materialNum || 1)
    if (!row || (row.stock ?? 0) < n || row.limit_break_count + n > MAX_LIMIT_BREAK) return null
    db().prepare('UPDATE user_support_cards SET limit_break_count = limit_break_count + ?, stock = stock - ? WHERE viewer_id = ? AND support_card_id = ?')
        .run(n, n, viewerId.toString(), supportCardId)
    return { support_card_data: toUserSupportCard(viewerId, supportCardId) }
}

/**
 * Limit break using uncap crystals (144 SSR / 145 SR). `limit_break_count` is treated as the
 * target count when it's above the current one, otherwise as the number of breaks to add.
 */
export function limitBreakSupportCardWithItem(viewerId: number, supportCardId: number, itemId: number, limitBreakCount: number) {
    const row = getUserSupportCardById(viewerId, supportCardId)
    if (!row) return null
    const expected = data().limit_break_items[String(supportRarity(supportCardId))]
    if (!expected || itemId !== expected) return null
    const add = limitBreakCount > row.limit_break_count ? limitBreakCount - row.limit_break_count : Math.max(1, limitBreakCount)
    if (row.limit_break_count + add > MAX_LIMIT_BREAK || itemCount(viewerId, itemId) < add) return null
    addOrUpdateUserItem(viewerId, itemId, -add)
    db().prepare('UPDATE user_support_cards SET limit_break_count = limit_break_count + ? WHERE viewer_id = ? AND support_card_id = ?')
        .run(add, viewerId.toString(), supportCardId)
    return { support_card_data: toUserSupportCard(viewerId, supportCardId), item_data_array: userItems(viewerId, [itemId]) }
}

export function changeSupportCardLock(viewerId: number, supportCardId: number, lockFlag: number) {
    if (!getUserSupportCardById(viewerId, supportCardId)) return null
    const locked = lockFlag ? 1 : 0
    db().prepare('UPDATE user_support_cards SET favorite_flag = ? WHERE viewer_id = ? AND support_card_id = ?').run(locked, viewerId.toString(), supportCardId)
    return { support_card_id: supportCardId, is_locked: locked }
}

// ---------------------------------------------------------------------------
// Support card decks
// ---------------------------------------------------------------------------

function toUserSupportCardDeck(row: any) {
    let ids: number[] = []
    try { ids = JSON.parse(row.cards ?? '[]') } catch { /* keep empty */ }
    return { deck_id: row.deck_id, name: row.name ?? '', support_card_id_array: ids }
}

function allDecks(viewerId: number) {
    return (db().prepare('SELECT * FROM user_decks WHERE viewer_id = ? ORDER BY deck_id').all(viewerId.toString()) as any[]).map(toUserSupportCardDeck)
}

/** Saves the edited decks. Every card in a deck must be owned; a 0 marks an empty slot. */
export function changeDeckParty(viewerId: number, decks: { deck_id: number, support_card_id_array: number[] }[]) {
    if (!Array.isArray(decks)) return null
    const upsert = db().prepare(`
        INSERT INTO user_decks (viewer_id, deck_id, name, cards, possess_time, stock) VALUES (?, ?, '', ?, ?, 0)
        ON CONFLICT(viewer_id, deck_id) DO UPDATE SET cards = excluded.cards
    `)
    for (const d of decks) {
        const ids = (d.support_card_id_array ?? []).slice(0, 6)
        if (ids.some(id => id && !getUserSupportCardById(viewerId, id))) return null
        upsert.run(viewerId.toString(), d.deck_id, JSON.stringify(ids), formatServerTimestamp())
    }
    return { support_card_deck_array: allDecks(viewerId) }
}

export function changeDeckName(viewerId: number, deckId: number, name: string) {
    db().prepare(`
        INSERT INTO user_decks (viewer_id, deck_id, name, cards, possess_time, stock) VALUES (?, ?, ?, '[]', ?, 0)
        ON CONFLICT(viewer_id, deck_id) DO UPDATE SET name = excluded.name
    `).run(viewerId.toString(), deckId, String(name ?? '').slice(0, 32), formatServerTimestamp())
    const row = db().prepare('SELECT * FROM user_decks WHERE viewer_id = ? AND deck_id = ?').get(viewerId.toString(), deckId)
    return { support_card_deck: toUserSupportCardDeck(row) }
}

// ---------------------------------------------------------------------------
// Trainee cards
// ---------------------------------------------------------------------------

function cardRow(viewerId: number, cardId: number): any | null {
    return db().prepare('SELECT * FROM user_cards WHERE viewer_id = ? AND card_id = ?').get(viewerId.toString(), cardId) ?? null
}

function parseSkills(row: any): { skill_id: number, level: number }[] {
    try { return JSON.parse(row.skill_data ?? '[]') ?? [] } catch { return [] }
}

function toUserCard(row: any) {
    return {
        card_id: row.card_id,
        rarity: row.rarity,
        talent_level: row.talent_level,
        skill_data_array: parseSkills(row),
        create_time: row.create_time ?? '',
    }
}

/** Potential level (talent) up: card_talent_upgrade costs for every level crossed. */
export function strengthenCardTalent(viewerId: number, cardId: number, newTalentLevel: number) {
    const row = cardRow(viewerId, cardId)
    const card = data().cards[String(cardId)]
    if (!row || !card || newTalentLevel <= row.talent_level || newTalentLevel > MAX_TALENT_LEVEL) return null
    const table = data().talent_upgrade[String(card.talent_group_id)] ?? {}
    const costs: ItemCost[] = []
    for (let lvl = row.talent_level + 1; lvl <= newTalentLevel; lvl++) costs.push(...(table[String(lvl)] ?? []))
    costs.push({ item_category: 0, item_id: ITEM_MONEY, item_num: talentUpgradeMoneyCost(row.talent_level, newTalentLevel) })
    const need = affordable(viewerId, costs)
    if (!need) return null
    spend(viewerId, need)
    db().prepare('UPDATE user_cards SET talent_level = ? WHERE viewer_id = ? AND card_id = ?').run(newTalentLevel, viewerId.toString(), cardId)
    return { card_data: toUserCard(cardRow(viewerId, cardId)), item_data_array: userItems(viewerId, need.keys()) }
}

/** Skill hint level up: card_talent_hint_upgrade items + money for every level crossed. */
export function upgradeCardSkill(viewerId: number, cardId: number, skillId: number, newSkillLevel: number) {
    const row = cardRow(viewerId, cardId)
    if (!row || newSkillLevel > MAX_HINT_LEVEL) return null
    const skills = parseSkills(row)
    const current = skills.find(s => s.skill_id === skillId)?.level ?? 0
    if (newSkillLevel <= current) return null
    const skillRarity = Math.min(2, data().skill_rarity[String(skillId)] ?? 1)
    const table = data().hint_upgrade[String(skillRarity)] ?? {}
    const costs: ItemCost[] = []
    let money = 0
    for (let lvl = current + 1; lvl <= newSkillLevel; lvl++) {
        const step = table[String(lvl)]
        if (!step) return null
        costs.push(...step.items)
        money += step.money
    }
    costs.push({ item_category: 0, item_id: ITEM_MONEY, item_num: money })
    const need = affordable(viewerId, costs)
    if (!need) return null
    spend(viewerId, need)
    const existing = skills.find(s => s.skill_id === skillId)
    if (existing) existing.level = newSkillLevel
    else skills.push({ skill_id: skillId, level: newSkillLevel })
    db().prepare('UPDATE user_cards SET skill_data = ? WHERE viewer_id = ? AND card_id = ?').run(JSON.stringify(skills), viewerId.toString(), cardId)
    return { card_data: toUserCard(cardRow(viewerId, cardId)), item_data_array: userItems(viewerId, need.keys()) }
}

/** Rarity up (awakening) paid with the card's character pieces. */
export function upgradeCardRarity(viewerId: number, cardId: number, newRarity: number) {
    const row = cardRow(viewerId, cardId)
    const card = data().cards[String(cardId)]
    if (!row || !card || newRarity <= row.rarity || newRarity > 5) return null
    const cost = rarityUpgradePieceCost(row.rarity, newRarity)
    if (pieceCount(viewerId, card.piece_id) < cost) return null
    addOrUpdateUserPiece(viewerId, card.piece_id, -cost)
    db().prepare('UPDATE user_cards SET rarity = ? WHERE viewer_id = ? AND card_id = ?').run(newRarity, viewerId.toString(), cardId)
    return {
        card_data: toUserCard(cardRow(viewerId, cardId)),
        piece_data: [{ piece_id: card.piece_id, piece_num: pieceCount(viewerId, card.piece_id) }],
    }
}

/** Unlock a trainee from pieces (need_piece_num_data by the card's default rarity). */
export function unlockCard(viewerId: number, cardId: number) {
    const card = data().cards[String(cardId)]
    if (!card || checkUserCard(viewerId, cardId)) return null
    const cost = data().need_piece_num[String(card.default_rarity)] ?? 0
    if (pieceCount(viewerId, card.piece_id) < cost) return null
    addOrUpdateUserPiece(viewerId, card.piece_id, -cost)
    addUserCard(viewerId, cardId, card.default_rarity, 1)
    const added = cardRow(viewerId, cardId)
    return {
        reward_summary_info: {
            add_present_num: 0, add_item_list: [], add_card_list: added ? [toUserCard(added)] : [], add_card_bonus_info: null,
            add_support_card_list: [], add_support_card_num_array: [], add_chara_list: [], add_cloth_list: [], add_music_list: [],
            add_fcoin: 0, add_honor_list: [], add_piece_list: [], add_total_fan: 0, new_chara_profile_array: [], force_update_honor_id: 0,
        },
        piece_data: [{ piece_id: card.piece_id, piece_num: pieceCount(viewerId, card.piece_id) }],
    }
}

// Client constants (Gallop.GameDefine static arrays, read from the il2cpp field init data).
// GallopUtil.GetNeedPieceNum(start, target) sums PIECE_NUM_ARRAY[start .. target-1]; the talent
// money array is indexed the same way by the level being upgraded from.
const PIECE_NUM_ARRAY = [0, 50, 100, 200, 300]
const NEED_MONEY_FOR_TALENT_UPGRADE_ARRAY = [0, 20000, 100000, 150000, 200000]

export function rarityUpgradePieceCost(fromRarity: number, toRarity: number): number {
    let total = 0
    for (let r = fromRarity; r < toRarity; r++) total += PIECE_NUM_ARRAY[r] ?? 0
    return total
}

export function talentUpgradeMoneyCost(fromLevel: number, toLevel: number): number {
    let total = 0
    for (let l = fromLevel; l < toLevel; l++) total += NEED_MONEY_FOR_TALENT_UPGRADE_ARRAY[l] ?? 0
    return total
}
