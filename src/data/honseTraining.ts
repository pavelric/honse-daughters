import { TrainingCharaInfo, TrainingHomeInfo, TrainingSupportCard, TrainingCommandLevelInfo, TrainingCommandInfo, TrainingReservedRaceDeck, TrainingUncheckedEvent, TrainingStartChara, TrainingEvaluationInfo, TrainedCharaRaceResult, UserTpInfo } from './types'
import { RequestCommon, getServerTime, formatServerTimestamp } from '../utils'
import { getUserSupportCardById, getUserCards, addUserSupportCardExp, incrementUserCharaTrainingStats, incrementSingleModePlayCount, insertTrainedChara } from './honseData'
import { readFileSync } from 'fs'
import path from 'path'
import { randomInt } from 'crypto'
import getDatabase, { Database } from './index'

export interface TrainingStartRequest extends RequestCommon {
    current_money: number
    current_succession_rank_point: number
    start_chara: TrainingStartChara
    tp_info: UserTpInfo
    use_tp: number
}

export interface ExecCommandRequest extends RequestCommon {
    command_id: number
}

/**
 * Persisted, mutable state for an in-progress freeform training run.
 * This is the source of truth: everything sent to the client (chara_info/home_info/etc.)
 * is derived from this on every request rather than trusting client-echoed values.
 *
 * Fields prefixed with `_` are server-internal bookkeeping and are stripped before
 * a response is sent to the client (see `stripInternal`).
 */
interface TrainingRunState {
    viewer_id: number
    card_id: number
    chara_id: number
    rarity: number
    talent_level: number
    scenario_id: number
    route_id: number
    running_style: number
    proper_distance_long: number
    proper_distance_middle: number
    proper_distance_mile: number
    proper_distance_short: number
    proper_ground_dirt: number
    proper_ground_turf: number
    proper_running_style_nige: number
    proper_running_style_oikomi: number
    proper_running_style_sashi: number
    proper_running_style_senko: number
    succession_trained_chara_id_1: number
    succession_trained_chara_id_2: number
    start_time: string

    turn: number
    vital: number
    max_vital: number
    motivation: number // 1 (worst) - 5 (best), mirrors the client's motivation scale
    fans: number
    wins: number
    skill_point: number

    speed: number
    stamina: number
    power: number
    guts: number
    wiz: number
    max_speed: number
    max_stamina: number
    max_power: number
    max_guts: number
    max_wiz: number

    support_card_array: TrainingSupportCard[]
    evaluation_info_array: TrainingEvaluationInfo[]
    training_level_info_array: TrainingCommandLevelInfo[]

    race_result_list: TrainedCharaRaceResult[]

    _command_usage_count: Record<string, number>
    _remaining_race_schedule: ScheduledRace[]
    _all_route_race_ids: number[]
    _pending_events: TrainingUncheckedEvent[]
    _finished: boolean
}

interface ScheduledRace {
    id: number // the row id/key from umas_route_race_data.json, used as route_race_id
    turn: number
    program_id: number
    race_name: string
    condition_type: number
    condition_value_1: number
}

// Base (level-1) definition of every training command. `base_params` mirrors the values
// that were already reverse-engineered into the static home_info payload; this file now
// scales them by command level and support-card bonuses instead of returning them as-is.
//
// command_type/effect for 301/390/401/701/801 are inferred from "a training sim always has
// Rest/Recreation/Infirmary/race-related menu entries", NOT from a confirmed capture — treat
// their exact IDs and vital numbers as placeholders until verified against real traffic.
interface BaseCommandDef {
    command_id: number
    command_type: number
    is_enable_default: number
    training_partner_array: number[]
    base_params: { target_type: number, value: number }[]
    is_trainable_stat: boolean
}

const BASE_COMMANDS: BaseCommandDef[] = [
    { command_id: 101, command_type: 1, is_enable_default: 1, training_partner_array: [], is_trainable_stat: true, base_params: [
        { target_type: 1, value: 12 }, { target_type: 3, value: 5 }, { target_type: 30, value: 2 }, { target_type: 10, value: -21 }
    ] },
    { command_id: 105, command_type: 1, is_enable_default: 1, training_partner_array: [], is_trainable_stat: true, base_params: [
        { target_type: 2, value: 9 }, { target_type: 4, value: 4 }, { target_type: 30, value: 2 }, { target_type: 10, value: -19 }
    ] },
    { command_id: 102, command_type: 1, is_enable_default: 1, training_partner_array: [1, 2], is_trainable_stat: true, base_params: [
        { target_type: 2, value: 5 }, { target_type: 3, value: 8 }, { target_type: 30, value: 2 }, { target_type: 10, value: -20 }
    ] },
    { command_id: 103, command_type: 1, is_enable_default: 1, training_partner_array: [5, 6], is_trainable_stat: true, base_params: [
        { target_type: 1, value: 6 }, { target_type: 3, value: 6 }, { target_type: 4, value: 11 }, { target_type: 30, value: 2 }, { target_type: 10, value: -22 }
    ] },
    { command_id: 106, command_type: 1, is_enable_default: 1, training_partner_array: [], is_trainable_stat: true, base_params: [
        { target_type: 1, value: 2 }, { target_type: 5, value: 9 }, { target_type: 30, value: 4 }, { target_type: 10, value: 5 }
    ] },
    // Rest: recover vital, no stat change, never fails.
    { command_id: 301, command_type: 3, is_enable_default: 1, training_partner_array: [], is_trainable_stat: false, base_params: [
        { target_type: 10, value: 30 }
    ] },
    // Recreation/outing: smaller vital recovery, chance to raise motivation.
    { command_id: 390, command_type: 3, is_enable_default: 1, training_partner_array: [], is_trainable_stat: false, base_params: [
        { target_type: 10, value: 20 }
    ] },
    { command_id: 401, command_type: 4, is_enable_default: 0, training_partner_array: [], is_trainable_stat: false, base_params: [] },
    { command_id: 701, command_type: 7, is_enable_default: 1, training_partner_array: [], is_trainable_stat: false, base_params: [] },
    { command_id: 801, command_type: 8, is_enable_default: 0, training_partner_array: [], is_trainable_stat: false, base_params: [] },
]

// Stat target_type (1-5) -> support card effect table `type` for that stat's training bonus (3-7).
const STAT_TARGET_TO_EFFECT_TYPE: Record<number, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 }
const EFFECT_TYPE = {
    FRIENDSHIP_BONUS: 1,
    MOOD_EFFECT: 2,
    TRAINING_EFFECTIVENESS: 8,
    SKILL_POINT_BONUS: 30,
    FAILURE_PROTECTION: 27,
    ENERGY_COST_REDUCTION: 28,
}
// A support card not explicitly listed as "present" for a command still passively helps,
// just less than one who is - there's no per-turn appearance roll implemented here.
const ABSENT_PRESENCE_FACTOR = 0.5

const MAX_COMMAND_LEVEL = 5
const USES_PER_LEVEL_UP = 4
const FALLBACK_MAX_TURN = 78

export function startTrainingRun(req: TrainingStartRequest) {
    const state = buildInitialState(req)
    persistTrainingState(state)
    return toClientPayload(state)
}

export function execTrainingCommand(req: ExecCommandRequest): { payload: any, finished: boolean } {
    const state = loadTrainingState(req.viewer_id)
    if (!state) return { payload: null, finished: true }

    const commandDef = BASE_COMMANDS.find(c => c.command_id === req.command_id)
    if (!commandDef) {
        // Unknown command: no-op besides acking, rather than corrupting state.
        return { payload: toClientPayload(state), finished: state._finished }
    }

    if (commandDef.is_trainable_stat) {
        runStatTrainingCommand(state, commandDef)
    } else {
        runActionCommand(state, commandDef)
    }

    maybeQueueEvent(state)

    state.turn += 1
    resolveScheduledRaceIfDue(state)

    if (!state._finished && state.turn >= FALLBACK_MAX_TURN) {
        state._finished = true
    }

    if (state._finished) {
        finishTrainingRun(state)
    } else {
        persistTrainingState(state)
    }

    return { payload: toClientPayload(state), finished: state._finished }
}

export function checkTrainingEvent(viewerId: number): any {
    const state = loadTrainingState(viewerId)
    if (!state || state._pending_events.length === 0) {
        return { unchecked_event_array: [] }
    }
    const event = state._pending_events.shift()
    persistTrainingState(state)
    return { unchecked_event_array: event ? [event] : [] }
}

export function loadTrainingRun(viewerId: number): any | null {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    return toClientPayload(state)
}

// ---------------------------------------------------------------------------
// State construction
// ---------------------------------------------------------------------------

function buildInitialState(req: TrainingStartRequest): TrainingRunState {
    const stats = getUmaStats(req.start_chara.card_id)
    const userCard = getUserCardInfo(req.viewer_id, req.start_chara.card_id)
    const rarity = userCard?.rarity ?? 1
    const talent = userCard?.talent_level ?? 1
    const charaId = Math.floor(req.start_chara.card_id / 100)

    const supportCardArray = buildSupportCardArray(req)
    const routeSel = selectRouteForScenario(req.start_chara.scenario_id)

    const trainingLevels: TrainingCommandLevelInfo[] = [
        ...BASE_COMMANDS.filter(c => c.is_trainable_stat).map(c => ({ command_id: c.command_id, level: 1 })),
        // Non-training level trackers observed in the original captured payload; left untouched,
        // their real purpose (hint levels? unrelated UI element?) isn't confirmed.
        { command_id: 601, level: 5 }, { command_id: 602, level: 5 }, { command_id: 603, level: 5 },
        { command_id: 604, level: 5 }, { command_id: 605, level: 5 },
    ]

    const now = getServerTime()
    const maxTp = req.tp_info?.max_tp ?? 100
    const useTp = req.use_tp ? 30 : 0
    void now
    void useTp
    void maxTp

    const state: TrainingRunState = {
        viewer_id: req.viewer_id,
        card_id: req.start_chara.card_id,
        chara_id: charaId,
        rarity,
        talent_level: talent,
        scenario_id: req.start_chara.scenario_id,
        route_id: routeSel.routeId,
        running_style: 2,
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
        succession_trained_chara_id_1: req.start_chara.succession_trained_chara_id_1,
        succession_trained_chara_id_2: req.start_chara.succession_trained_chara_id_2,
        start_time: formatServerTimestamp(),

        turn: 1,
        vital: 100,
        max_vital: 100,
        motivation: 3,
        fans: 1,
        wins: 0,
        skill_point: 0,

        speed: stats.speed,
        stamina: stats.stamina,
        power: stats.power,
        guts: stats.guts,
        wiz: stats.wiz,
        max_speed: stats.default_max_speed,
        max_stamina: stats.default_max_stamina,
        max_power: stats.default_max_power,
        max_guts: stats.default_max_guts,
        max_wiz: stats.default_max_wiz,

        support_card_array: supportCardArray,
        evaluation_info_array: computeEvaluationInfo(supportCardArray),
        training_level_info_array: trainingLevels,

        race_result_list: [],

        _command_usage_count: {},
        _remaining_race_schedule: routeSel.schedule,
        _all_route_race_ids: routeSel.ids,
        _pending_events: [],
        _finished: false,
    }

    return state
}

// ---------------------------------------------------------------------------
// Command execution
// ---------------------------------------------------------------------------

function runStatTrainingCommand(state: TrainingRunState, commandDef: BaseCommandDef) {
    const usageKey = String(commandDef.command_id)
    const usesSoFar = state._command_usage_count[usageKey] ?? 0
    const level = Math.min(MAX_COMMAND_LEVEL, 1 + Math.floor(usesSoFar / USES_PER_LEVEL_UP))

    const bonuses = aggregateSupportBonuses(state, commandDef)
    const failureRate = computeFailureRate(level, state.vital, state.max_vital, bonuses.failureProtectionPct)
    const failed = randomInt(0, 100) < failureRate

    const levelGainScale = 1 + (level - 1) * 0.15
    const levelCostScale = 1 + (level - 1) * 0.08

    for (const param of commandDef.base_params) {
        if (param.target_type === 10) {
            // Vital cost. Negative for training grounds; reduced by energy cost reduction bonuses.
            const reducedCost = param.value * (1 - bonuses.energyCostReductionPct / 100)
            const cost = reducedCost * levelCostScale * (failed ? 1.4 : 1)
            state.vital = clamp(state.vital + Math.round(cost), 0, state.max_vital)
            continue
        }
        if (param.target_type === 30) {
            // Skill points: still trickle in on a failed attempt, just reduced.
            const bonusPct = bonuses.skillPointBonusPct
            const gain = param.value * levelGainScale * (1 + bonusPct / 100) * (failed ? 0.25 : 1)
            state.skill_point += Math.max(0, Math.round(gain))
            continue
        }
        if (failed) continue // no stat gain on a failed attempt
        const statBonusPct = bonuses.statBonusPct[param.target_type] ?? 0
        const variance = 1 + (randomInt(-12, 13) / 100)
        const gain = Math.round(param.value * levelGainScale * (1 + statBonusPct / 100 + bonuses.trainingEffectivenessPct / 100) * variance)
        applyStatGain(state, param.target_type, gain)
    }

    if (!failed && randomInt(0, 100) < 10) {
        state.motivation = clamp(state.motivation + 1, 1, 5)
    } else if (failed && randomInt(0, 100) < 50) {
        state.motivation = clamp(state.motivation - 1, 1, 5)
    }

    grantFriendshipForCommand(state, commandDef, bonuses.friendshipFractionByPosition)

    state._command_usage_count[usageKey] = usesSoFar + 1
    const newLevel = Math.min(MAX_COMMAND_LEVEL, 1 + Math.floor(state._command_usage_count[usageKey] / USES_PER_LEVEL_UP))
    const levelEntry = state.training_level_info_array.find(l => l.command_id === commandDef.command_id)
    if (levelEntry) levelEntry.level = newLevel
}

function runActionCommand(state: TrainingRunState, commandDef: BaseCommandDef) {
    for (const param of commandDef.base_params) {
        if (param.target_type === 10) {
            state.vital = clamp(state.vital + param.value, 0, state.max_vital)
        }
    }
    if (commandDef.command_id === 390 && randomInt(0, 100) < 40) {
        state.motivation = clamp(state.motivation + 1, 1, 5)
    }
}

function applyStatGain(state: TrainingRunState, targetType: number, gain: number) {
    switch (targetType) {
        case 1: state.speed = clamp(state.speed + gain, 0, state.max_speed); break
        case 2: state.stamina = clamp(state.stamina + gain, 0, state.max_stamina); break
        case 3: state.power = clamp(state.power + gain, 0, state.max_power); break
        case 4: state.guts = clamp(state.guts + gain, 0, state.max_guts); break
        case 5: state.wiz = clamp(state.wiz + gain, 0, state.max_wiz); break
    }
}

interface AggregatedBonuses {
    statBonusPct: Record<number, number>
    trainingEffectivenessPct: number
    skillPointBonusPct: number
    failureProtectionPct: number
    energyCostReductionPct: number
    friendshipFractionByPosition: Record<number, number> // 0..1, how "present" each support card was
}

function aggregateSupportBonuses(state: TrainingRunState, commandDef: BaseCommandDef): AggregatedBonuses {
    const result: AggregatedBonuses = {
        statBonusPct: {},
        trainingEffectivenessPct: 0,
        skillPointBonusPct: 0,
        failureProtectionPct: 0,
        energyCostReductionPct: 0,
        friendshipFractionByPosition: {},
    }
    const relevantStatTargets = new Set(commandDef.base_params.filter(p => p.target_type >= 1 && p.target_type <= 5).map(p => p.target_type))

    for (const card of state.support_card_array) {
        const level = calcSupportCardLevel(card.exp, card.limit_break_count)
        const isPresent = commandDef.training_partner_array.includes(card.position)
        const presence = isPresent ? 1 : ABSENT_PRESENCE_FACTOR
        result.friendshipFractionByPosition[card.position] = presence

        for (const targetType of relevantStatTargets) {
            const effectType = STAT_TARGET_TO_EFFECT_TYPE[targetType]
            const value = getSupportEffectValue(card.support_card_id, effectType, level) * presence
            result.statBonusPct[targetType] = (result.statBonusPct[targetType] ?? 0) + value
        }

        result.trainingEffectivenessPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.TRAINING_EFFECTIVENESS, level) * presence
        result.skillPointBonusPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.SKILL_POINT_BONUS, level) * presence
        result.failureProtectionPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.FAILURE_PROTECTION, level) * presence
        result.energyCostReductionPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.ENERGY_COST_REDUCTION, level) * presence
    }

    return result
}

function grantFriendshipForCommand(state: TrainingRunState, commandDef: BaseCommandDef, presenceByPosition: Record<number, number>) {
    for (const card of state.support_card_array) {
        const presence = presenceByPosition[card.position] ?? ABSENT_PRESENCE_FACTOR
        const gain = Math.round(6 * presence)
        if (gain <= 0) continue
        card.exp += gain
        addUserSupportCardExp(state.viewer_id, card.support_card_id, gain)
    }
    state.evaluation_info_array = computeEvaluationInfo(state.support_card_array)
}

function computeFailureRate(level: number, vital: number, maxVital: number, failureProtectionPct: number): number {
    let base = Math.max(2, 20 - (level - 1) * 4)
    const vitalRatio = maxVital > 0 ? vital / maxVital : 0
    if (vitalRatio < 0.15) base += 30
    else if (vitalRatio < 0.3) base += 15
    base = base * (1 - failureProtectionPct / 100)
    return clamp(Math.round(base), 0, 90)
}

// ---------------------------------------------------------------------------
// Race schedule
// ---------------------------------------------------------------------------

function resolveScheduledRaceIfDue(state: TrainingRunState) {
    const idx = state._remaining_race_schedule.findIndex(r => r.turn === state.turn)
    if (idx === -1) return

    const race = state._remaining_race_schedule[idx]
    state._remaining_race_schedule.splice(idx, 1)

    // Simplified placeholder result: there is no real race simulation engine yet (opponent
    // rosters, skills, pacing), so the outcome is derived from total stats vs. a rough
    // expected-field-strength curve rather than an actual simulated race.
    const totalStat = state.speed + state.stamina + state.power + state.guts + state.wiz
    const expectedFieldStrength = 300 + race.turn * 5
    const performance = totalStat - expectedFieldStrength + randomInt(-80, 81)
    const rank = clamp(Math.round(10 - performance / 40), 1, 18)
    const won = rank === 1

    state.fans += won ? 500 : Math.max(5, 50 - rank * 2)
    if (won) state.wins += 1

    const result: TrainedCharaRaceResult = {
        ground_condition: 1, // unconfirmed default ("good"?), no weather/track-condition simulation
        popularity: clamp(rank + randomInt(-2, 3), 1, 18),
        prize_money: won ? 5_000_000 : 0,
        program_id: race.program_id,
        result_rank: rank,
        result_time: 0, // not simulated
        running_style: state.running_style,
        turn: state.turn,
        weather: 1, // unconfirmed default
    }
    state.race_result_list.push(result)

    if (state._remaining_race_schedule.length === 0) {
        state._finished = true
    }
}

// ---------------------------------------------------------------------------
// Random support-card hangout "events" - synthetic placeholders, not real game story content.
// ---------------------------------------------------------------------------

function maybeQueueEvent(state: TrainingRunState) {
    if (state._finished) return
    if (randomInt(0, 100) >= 20) return
    if (state.support_card_array.length === 0) return

    const card = state.support_card_array[randomInt(0, state.support_card_array.length)]
    const event: TrainingUncheckedEvent = {
        chara_id: state.chara_id,
        event_contents_info: {
            choice_array: [{ receive_item_id: 0, select_index: 1, target_race_id: 0 }],
            show_clear: 0,
            show_clear_sort_id: 0,
            support_card_id: card.support_card_id,
        },
        event_id: state.turn,
        minigame_result: null,
        play_timing: 1,
        // Synthetic id - not a real Cygames story id, just structurally shaped placeholder content.
        story_id: 900000000 + state.card_id * 100 + state.turn,
        succession_event_info: null,
    }
    state._pending_events.push(event)
}

// ---------------------------------------------------------------------------
// Finalization
// ---------------------------------------------------------------------------

function finishTrainingRun(state: TrainingRunState) {
    const rankScore = state.speed + state.stamina + state.power + state.guts + state.wiz
    const rank = rankScore > 1300 ? 1 : rankScore > 1000 ? 2 : rankScore > 700 ? 3 : 4

    insertTrainedChara(state.viewer_id, {
        card_id: state.card_id,
        rank,
        rank_score: rankScore,
        speed: state.speed,
        stamina: state.stamina,
        power: state.power,
        guts: state.guts,
        wiz: state.wiz,
        rarity: state.rarity,
        running_style: state.running_style,
        scenario_id: state.scenario_id,
        route_id: state.route_id,
        wins: state.wins,
        race_result_list: state.race_result_list,
        fans: state.fans,
        proper_distance_long: state.proper_distance_long,
        proper_distance_middle: state.proper_distance_middle,
        proper_distance_mile: state.proper_distance_mile,
        proper_distance_short: state.proper_distance_short,
        proper_ground_dirt: state.proper_ground_dirt,
        proper_ground_turf: state.proper_ground_turf,
        proper_running_style_nige: state.proper_running_style_nige,
        proper_running_style_oikomi: state.proper_running_style_oikomi,
        proper_running_style_sashi: state.proper_running_style_sashi,
        proper_running_style_senko: state.proper_running_style_senko,
        succession_trained_chara_id_1: state.succession_trained_chara_id_1,
        succession_trained_chara_id_2: state.succession_trained_chara_id_2,
        talent_level: state.talent_level,
        support_card_list: state.support_card_array,
    })

    incrementUserCharaTrainingStats(state.viewer_id, state.chara_id, state.fans)
    incrementSingleModePlayCount(state.viewer_id)

    const db = getDatabase(Database.HONSE_DATA)
    db.prepare('DELETE FROM training_runs WHERE viewer_id = ?').run(state.viewer_id)
}

// ---------------------------------------------------------------------------
// Client payload shaping
// ---------------------------------------------------------------------------

function toClientPayload(state: TrainingRunState) {
    return {
        add_trained_chara_array: [],
        chara_info: toClientCharaInfo(state),
        home_info: toClientHomeInfo(state),
        mission_list: [],
        race_condition_array: [],
        reserved_race_array: buildReservedRaceArray(),
        story_event_chara_bonus_list: [],
        story_event_mission_list: [],
        tp_info: { current_tp: 100, max_recovery_time: 0, max_tp: 100 },
        unchecked_event_array: state._pending_events.slice(0, 1),
        user_item_array: [],
        // Not part of the (guessed) client schema - purely so our own /load and any debugging
        // tooling can tell a run is over without re-deriving it from turn/schedule state.
        is_career_finished: state._finished,
    }
}

function toClientCharaInfo(state: TrainingRunState): TrainingCharaInfo {
    return {
        card_id: state.card_id,
        chara_effect_id_array: [],
        chara_grade: 1,
        default_max_guts: state.max_guts,
        default_max_power: state.max_power,
        default_max_speed: state.max_speed,
        default_max_stamina: state.max_stamina,
        default_max_wiz: state.max_wiz,
        disable_skill_id_array: [],
        evaluation_info_array: state.evaluation_info_array,
        fans: state.fans,
        guest_outing_info_array: [],
        guts: state.guts,
        is_short_race: 0,
        max_guts: state.max_guts,
        max_power: state.max_power,
        max_speed: state.max_speed,
        max_stamina: state.max_stamina,
        max_vital: state.max_vital,
        max_wiz: state.max_wiz,
        motivation: state.motivation,
        nickname_id_array: [],
        playing_state: 1,
        power: state.power,
        proper_distance_long: state.proper_distance_long,
        proper_distance_middle: state.proper_distance_middle,
        proper_distance_mile: state.proper_distance_mile,
        proper_distance_short: state.proper_distance_short,
        proper_ground_dirt: state.proper_ground_dirt,
        proper_ground_turf: state.proper_ground_turf,
        proper_running_style_nige: state.proper_running_style_nige,
        proper_running_style_oikomi: state.proper_running_style_oikomi,
        proper_running_style_sashi: state.proper_running_style_sashi,
        proper_running_style_senko: state.proper_running_style_senko,
        race_program_id: 0,
        race_running_style: 2,
        rarity: state.rarity,
        reserve_race_program_id: 0,
        route_id: state.route_id,
        route_race_id_array: state._all_route_race_ids,
        scenario_id: state.scenario_id,
        short_cut_state: 0,
        single_mode_chara_id: 1,
        skill_array: [],
        skill_point: state.skill_point,
        skill_tips_array: [],
        speed: state.speed,
        stamina: state.stamina,
        start_time: state.start_time,
        state: state._finished ? 2 : 0,
        succession_trained_chara_id_1: state.succession_trained_chara_id_1,
        succession_trained_chara_id_2: state.succession_trained_chara_id_2,
        support_card_array: state.support_card_array,
        talent_level: state.talent_level,
        training_level_info_array: state.training_level_info_array,
        turn: state.turn,
        vital: state.vital,
        wiz: state.wiz,
    }
}

function toClientHomeInfo(state: TrainingRunState): TrainingHomeInfo {
    const commandInfoArray: TrainingCommandInfo[] = BASE_COMMANDS.map(def => {
        if (!def.is_trainable_stat) {
            return {
                command_id: def.command_id,
                command_type: def.command_type,
                failure_rate: 0,
                is_enable: def.is_enable_default,
                level: 0,
                params_inc_dec_info_array: def.base_params,
                tips_event_partner_array: [],
                training_partner_array: def.training_partner_array,
            }
        }

        const usesSoFar = state._command_usage_count[String(def.command_id)] ?? 0
        const level = Math.min(MAX_COMMAND_LEVEL, 1 + Math.floor(usesSoFar / USES_PER_LEVEL_UP))
        const bonuses = aggregateSupportBonuses(state, def)
        const failureRate = computeFailureRate(level, state.vital, state.max_vital, bonuses.failureProtectionPct)
        const levelGainScale = 1 + (level - 1) * 0.15
        const levelCostScale = 1 + (level - 1) * 0.08

        const scaledParams = def.base_params.map(p => {
            if (p.target_type === 10) return { target_type: 10, value: Math.round(p.value * (1 - bonuses.energyCostReductionPct / 100) * levelCostScale) }
            if (p.target_type === 30) return { target_type: 30, value: Math.round(p.value * levelGainScale * (1 + bonuses.skillPointBonusPct / 100)) }
            const statBonusPct = bonuses.statBonusPct[p.target_type] ?? 0
            return { target_type: p.target_type, value: Math.round(p.value * levelGainScale * (1 + statBonusPct / 100 + bonuses.trainingEffectivenessPct / 100)) }
        })

        return {
            command_id: def.command_id,
            command_type: def.command_type,
            failure_rate: failureRate,
            is_enable: def.is_enable_default,
            level,
            params_inc_dec_info_array: scaledParams,
            tips_event_partner_array: [],
            training_partner_array: def.training_partner_array,
        }
    })

    return {
        available_continue_num: 3,
        available_free_continue_num: 1,
        command_info_array: commandInfoArray,
        disable_command_id_array: [],
        free_continue_num: 1,
        free_continue_time: 0,
        race_entry_restriction: 1,
        shortened_race_state: 0,
    }
}

function buildReservedRaceArray(): TrainingReservedRaceDeck[] {
    const arr: TrainingReservedRaceDeck[] = []
    for (let i = 0; i < 9; i++) arr.push({ deck_name: '', deck_num: i, race_array: [] })
    return arr
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function persistTrainingState(state: TrainingRunState) {
    const db = getDatabase(Database.HONSE_DATA)
    const now = formatServerTimestamp()
    db.prepare(`
        INSERT INTO training_runs (viewer_id, card_id, scenario_id, start_time, last_update_time, run_state)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(viewer_id) DO UPDATE SET
            card_id=excluded.card_id,
            scenario_id=excluded.scenario_id,
            last_update_time=excluded.last_update_time,
            run_state=excluded.run_state
    `).run(state.viewer_id, state.card_id, state.scenario_id, state.start_time, now, JSON.stringify(state))
}

function loadTrainingState(viewerId: number): TrainingRunState | null {
    const db = getDatabase(Database.HONSE_DATA)
    const row = db.prepare('SELECT run_state FROM training_runs WHERE viewer_id = ?').get(viewerId) as { run_state: string } | undefined
    if (!row) return null
    try {
        return JSON.parse(row.run_state) as TrainingRunState
    } catch {
        return null
    }
}

// ---------------------------------------------------------------------------
// Reference data (uma stats, support effects, route/race calendar)
// ---------------------------------------------------------------------------

type SupportEffectsEntry = { id: number, type: number, type_name: string, init: number } & Record<string, number>
type UmaRarityEntry = any

let supportEffectsCache: SupportEffectsEntry[] | null = null
let umaRarityCache: UmaRarityEntry[] | null = null

function loadSupportEffects(): SupportEffectsEntry[] {
    if (supportEffectsCache) return supportEffectsCache
    const p = path.join(process.cwd(), 'assets', 'support_cards_effect_table_data.json')
    const raw = readFileSync(p, 'utf-8')
    supportEffectsCache = JSON.parse(raw)
    return supportEffectsCache!
}

function loadUmaRarityData(): UmaRarityEntry[] {
    if (umaRarityCache) return umaRarityCache
    const p = path.join(process.cwd(), 'assets', 'umas_rarity_data.json')
    const raw = readFileSync(p, 'utf-8')
    umaRarityCache = JSON.parse(raw)
    return umaRarityCache!
}

// Effect values are defined at level milestones (5/10/15/.../50); -1 means "unchanged since
// the previous milestone". This walks the milestones up to `level` and returns the last
// defined value, falling back to `init` (the level-1 baseline) if none apply yet.
function getSupportEffectValue(supportCardId: number, effectType: number, level: number): number {
    const entries = loadSupportEffects()
    const entry = entries.find(e => e.id === supportCardId && e.type === effectType)
    if (!entry) return 0

    const milestones = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    let value = entry.init ?? 0
    for (const m of milestones) {
        if (m > level) break
        const v = entry[`limit_lv${m}`]
        if (typeof v === 'number' && v !== -1) value = v
    }
    return value
}

function calcSupportCardLevel(exp: number, limitBreakCount: number): number {
    const maxLevel = 30 + Math.max(0, limitBreakCount) * 5
    const perLevelExp = 100
    const level = Math.min(maxLevel, Math.floor(exp / perLevelExp) + 1)
    return Math.max(1, level)
}

function computeEvaluationInfo(supportCards: TrainingSupportCard[]): TrainingEvaluationInfo[] {
    const evals = supportCards.map((sc, i) => {
        const lvl = calcSupportCardLevel(sc.exp, sc.limit_break_count)
        const gauge = getSupportEffectValue(sc.support_card_id, 14 /* Initial Friendship Gauge, reused as a friendship-progress proxy */, lvl)
        return { evaluation: Math.max(0, Math.floor(gauge) + Math.floor(sc.exp / 10)), is_appear: 1, target_id: i + 1 }
    })
    const arr = [
        ...evals,
        { evaluation: 0, is_appear: 0, target_id: 101 },
        { evaluation: 0, is_appear: 0, target_id: 102 },
        { evaluation: 0, is_appear: 0, target_id: 103 },
        { evaluation: 0, is_appear: 0, target_id: 106 },
    ]
    return arr.map(e => ({
        evaluation: e.evaluation,
        group_outing_info_array: [],
        is_appear: e.is_appear,
        is_outing: 0,
        story_step: 0,
        target_id: e.target_id,
        training_partner_id: e.target_id,
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
        wiz: entry?.initial_wiz ?? 92,
    }
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
            support_card_id: id,
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
            support_card_id: id,
        })
    }
    return arr
}

type RouteRaceEntry = { id: number, route_id: number, turn: number, program_id: number, race_name: string, condition_type: number, condition_value_1: number }
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
            entries.push({
                id, route_id: rid, turn: t,
                program_id: Number(rec?.program_id ?? 0),
                race_name: String(rec?.race_name ?? ''),
                condition_type: Number(rec?.condition_type ?? 0),
                condition_value_1: Number(rec?.condition_value_1 ?? 0),
            })
        }
    }
    routeRaceCache = entries
    return routeRaceCache
}

function selectRouteForScenario(scenarioId: number): { routeId: number, ids: number[], schedule: ScheduledRace[] } {
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
        const fallbackIds = [181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192]
        return {
            routeId: 17, ids: fallbackIds,
            schedule: fallbackIds.map((id, i) => ({ id, turn: 12 + i * 6, program_id: id, race_name: '', condition_type: 0, condition_value_1: 0 })),
        }
    }
    return {
        routeId: chosen,
        ids,
        schedule: arr.map(e => ({ id: e.id, turn: e.turn, program_id: e.program_id, race_name: e.race_name, condition_type: e.condition_type, condition_value_1: e.condition_value_1 })),
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}
