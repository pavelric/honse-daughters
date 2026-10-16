/**
 * URA (scenario 1) career engine behind /single_mode/*.
 *
 * Response shapes follow the client's own classes (Gallop.SingleMode*Response.CommonResponse,
 * see docs/api-catalog.md). Game data comes from master.mdb via assets/ura_career_data.json
 * (scripts/masterdb/build_ura_career_data.py). Mechanics the client doesn't reveal (exact
 * training growth per level, failure formula, race outcomes, race rewards) are approximations
 * and are marked as such where they're implemented.
 *
 * Turn flow the client drives:
 *   start -> [exec_command | race_entry -> race_start -> race_end (-> continue) -> race_out]*
 *         -> (after turn 78) factor_select [-> factor_lottery] -> finish
 * plus gain_skills / change_running_style / change_short_cut / check_event at any time.
 */
import { TrainingSupportCard, TrainingStartChara, UserTpInfo } from './types'
import { RequestCommon, formatServerTimestamp } from '../utils'
import { getUserSupportCardById, getUserCards, incrementUserCharaTrainingStats, incrementSingleModePlayCount, insertTrainedChara, getUserTrainedCharas, spendTp } from './honseData'
import { toClientTrainedChara } from './utils'
import { COMMON_DEFINE } from './defaults'
import { generateRaceScenario, performanceScore, ScenarioHorse, mulberry32 } from './raceScenario'
import { readFileSync } from 'fs'
import path from 'path'
import { randomInt } from 'crypto'
import getDatabase, { Database } from './index'

// ---------------------------------------------------------------------------
// Client enums (Gallop.SingleModeDefine.*, Gallop.RaceDefine.*)
// ---------------------------------------------------------------------------

const CharaState = { Playing: 0, NoWinEnd: 1, TargetFailedEnd: 2, TrueEnd: 3, FinishComplete: 4 }
const PlayingState = { TurnStart: 1, Race: 2, RaceInGame: 3, RaceResult: 4, TurnEnd: 5, FactorSelect: 11, FactorLotteryEnd: 20 }
const CommandType = { Training: 1, Outing: 3, RaceEntry: 4, Holiday: 7, Hospital: 8 }
const ResultState = { Failure: 1, Success: 2 }
const ContinueType = { Free: 1, Clock: 2 }

// target_type values used by single_mode_training_effect / params_inc_dec_info_array
const Target = { Speed: 1, Stamina: 2, Power: 3, Guts: 4, Wiz: 5, Vital: 10, Motivation: 20, SkillPoint: 30 }

const URA_SCENARIO_ID = 1
const LAST_TURN = 78
const MAX_CONTINUES = 3
const MAX_FREE_CONTINUES = 1

// ---------------------------------------------------------------------------
// Requests (field names from Gallop.SingleMode*Request)
// ---------------------------------------------------------------------------

export interface TrainingStartRequest extends RequestCommon {
    current_money: number
    current_succession_rank_point: number
    start_chara: TrainingStartChara & { running_style?: number }
    tp_info: UserTpInfo
    use_tp: number
}

export interface ExecCommandRequest extends RequestCommon {
    command_type: number
    command_id: number
    command_group_id?: number
    select_id?: number
    current_turn?: number
    current_vital?: number
}

// ---------------------------------------------------------------------------
// Master data
// ---------------------------------------------------------------------------

interface Program {
    id: number, race_instance_id: number, month: number, half: number, race_permission: number,
    fan_set_id: number, reward_set_id: number, grade: number, entry_num: number, race_id: number,
    distance: number, ground: number, finish_time_min: number, finish_time_max: number, is_ura_final?: number
}
interface FinalRace { race_id: number, race_instance_id: number, entry_num: number, distance: number, ground: number, finish_time_min: number, finish_time_max: number }
interface Npc {
    id: number, chara_id: number, mob_id: number, race_dress_id: number,
    speed: number, stamina: number, pow: number, guts: number, wiz: number,
    proper_distance_short: number, proper_distance_mile: number, proper_distance_middle: number, proper_distance_long: number,
    proper_running_style_nige: number, proper_running_style_senko: number, proper_running_style_sashi: number, proper_running_style_oikomi: number,
    proper_ground_turf: number, proper_ground_dirt: number, motivation_min: number, motivation_max: number
}
interface RouteRace { id: number, target_type: number, turn: number, race_type: number, condition_type: number, condition_id: number, condition_value_1: number }
interface TurnInfo { year: number, month: number, half: number, training_set_id: number, rest_type: number, health_room_type: number, race_entry_type: number }
interface UraData {
    programs: Program[]
    ura_final_races: FinalRace[]
    fan_sets: Record<string, number[]>
    npc_groups: Record<string, Npc[]>
    routes: Record<string, number>
    route_ids: Record<string, number>
    route_races: Record<string, RouteRace[]>
    turns: Record<string, TurnInfo>
    training_effects: Record<string, Record<string, { target_type: number, value: number }[]>>
    ranks: { id: number, min_value: number, max_value: number }[]
    chara_grades: { id: number, win_num: number, run_num: number, need_fan_count: number }[]
    unique_factor_cards: number[]
    skill_need_points: Record<string, number>
    skill_sets: Record<string, SkillData[]>
    succession_initial_factors: { factor_type: number, value_1: number, value_2: number, add_point: number }[]
}

let uraCache: UraData | null = null
let programById: Map<number, Program> | null = null

function ura(): UraData {
    if (!uraCache) {
        uraCache = JSON.parse(readFileSync(path.join(process.cwd(), 'assets', 'ura_career_data.json'), 'utf-8')) as UraData
        programById = new Map(uraCache.programs.map(p => [p.id, p]))
    }
    return uraCache
}

function getProgram(id: number): Program | undefined {
    ura()
    return programById!.get(id)
}

function turnInfo(turn: number): TurnInfo {
    return ura().turns[String(Math.min(LAST_TURN, Math.max(1, turn)))]
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const NORMAL_TRAININGS = [101, 105, 102, 103, 106]  // speed, stamina, power, guts, wiz
const SUMMER_TRAININGS = [601, 602, 603, 604, 605]  // same order, summer camp (training_set_id 2)
// Non-training entries of the home menu. Ids/types are the ones in the original captured
// home_info payload; their command_type values match Gallop.SingleModeDefine.CommandType.
const OUTING_IDS = [301, 390]
const RACE_COMMAND_ID = 401
const REST_COMMAND_ID = 701
const HOSPITAL_COMMAND_ID = 801

const MAX_COMMAND_LEVEL = 5
const USES_PER_LEVEL_UP = 4

function trainingIdsForTurn(turn: number): number[] {
    return turnInfo(turn).training_set_id === 2 ? SUMMER_TRAININGS : NORMAL_TRAININGS
}

function baseParams(commandId: number): { target_type: number, value: number }[] {
    return (ura().training_effects[String(commandId)]?.['1'] ?? []).map(p => ({ ...p }))
}

// ---------------------------------------------------------------------------
// Run state
// ---------------------------------------------------------------------------

interface SkillData { skill_id: number, level: number }
interface RaceHistory { turn: number, program_id: number, weather: number, ground_condition: number, running_style: number, result_rank: number, frame_order: number, npc_count: number }
interface PendingRace {
    program_id: number
    race: { race_instance_id: number, distance: number, ground: number, finish_time_min: number, finish_time_max: number, grade: number, fan_set_id: number }
    random_seed: number
    weather: number
    ground_condition: number
    race_horse_data: any[]
    player_index: number
    horses: ScenarioHorse[]
    outcomes: { finish_order: number, finish_time: number }[] | null
    snapshot: string | null      // state before race_end, restored by /continue
    continue_num: number
}

interface TrainingRunState {
    viewer_id: number
    card_id: number
    chara_id: number
    rarity: number
    talent_level: number
    scenario_id: number
    route_id: number
    start_time: string

    running_style: number
    race_running_style: number
    proper_distance_short: number
    proper_distance_mile: number
    proper_distance_middle: number
    proper_distance_long: number
    proper_ground_turf: number
    proper_ground_dirt: number
    proper_running_style_nige: number
    proper_running_style_senko: number
    proper_running_style_sashi: number
    proper_running_style_oikomi: number
    succession_trained_chara_id_1: number
    succession_trained_chara_id_2: number

    turn: number
    state: number
    playing_state: number
    short_cut_state: number
    vital: number
    max_vital: number
    motivation: number
    fans: number
    wins: number
    runs: number
    chara_grade: number
    skill_point: number
    skill_array: SkillData[]

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
    default_max: { speed: number, stamina: number, power: number, guts: number, wiz: number }

    support_card_array: TrainingSupportCard[]
    friendship: Record<number, number>                 // support card position -> 0..100 bond
    partners: Record<number, number[]>                 // training command id -> support card positions present this turn

    race_history: RaceHistory[]
    race_result_list: any[]
    available_continue_num: number
    available_free_continue_num: number

    _command_usage_count: Record<string, number>
    _goals: RouteRace[]
    _race: PendingRace | null
    _factor_lotteries: { lottery_id: number, factor_info_array: { factor_id: number, level: number }[] }[]
    _select_lottery_id: number
}

// ---------------------------------------------------------------------------
// Public entry points (one per endpoint). Each returns the endpoint's `data` object.
// ---------------------------------------------------------------------------

export function startTrainingRun(req: TrainingStartRequest) {
    // the cost comes from common_define, which load/index also sends the client
    const tpInfo = spendTp(req.viewer_id, COMMON_DEFINE.single_mode_trainer_point_use_value)
    if (!tpInfo) return null
    const state = buildInitialState(req)
    persistTrainingState(state)
    return {
        single_mode_start_common: {
            chara_info: toCharaInfo(state),
            race_condition_array: [],
            home_info: toHomeInfo(state),
            unchecked_event_array: [],
            tp_info: tpInfo,
            user_item_array: [],
            add_trained_chara_array: [],
            reserved_race_array: emptyReservedRaceDecks(),
            mission_list: [],
            story_event_mission_list: [],
            story_event_chara_bonus_list: [],
            race_random_program_array: [],
        },
        ura_data_set: uraDataSet(state),
    }
}

export function loadTrainingRun(viewerId: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    const race = state._race
    return {
        single_mode_load_common: {
            chara_info: toCharaInfo(state),
            race_condition_array: [],
            unchecked_event_array: [],
            home_info: toHomeInfo(state),
            race_history: state.race_history,
            win_saddle_id_array: [],
            effected_factor_array: [],
            race_start_info: race ? raceStartInfo(race) : null,
            race_scenario: race?.outcomes ? buildScenario(race).race_scenario : '',
            race_reward_info: race?.outcomes && state.playing_state === PlayingState.RaceResult ? raceRewardInfo(state, race) : null,
            add_trophy_info: null,
            trophy_reward_info: null,
            prev_chara_grade: state.chara_grade,
            race_add_reward_info: [],
            reserved_race_array: emptyReservedRaceDecks(),
            mission_list: [],
            story_event_mission_list: [],
            start_dress_info: null,
            story_event_chara_bonus_list: [],
            resume_factor_select: state.playing_state === PlayingState.FactorSelect ? factorSelectCommon(state) : null,
            race_random_program_array: [],
        },
        ura_data_set: uraDataSet(state),
    }
}

/**
 * load/index's single_mode_chara_light (Gallop.SingleModeCharaLight): its presence is how the
 * client knows a career is in progress and offers to resume it (then calls single_mode/load).
 */
export function trainingCharaLight(viewerId: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    return {
        single_mode_chara_id: 1,
        card_id: state.card_id,
        chara_grade: state.chara_grade,
        speed: state.speed, stamina: state.stamina, power: state.power, wiz: state.wiz, guts: state.guts,
        vital: state.vital, max_vital: state.max_vital, motivation: state.motivation, fans: state.fans,
        rarity: state.rarity,
        race_program_id: state._race?.program_id ?? 0,
        reserve_race_turn: 0,
        reserve_race_program_id: 0,
        race_running_style: state.race_running_style,
        talent_level: state.talent_level,
        proper_distance_short: state.proper_distance_short, proper_distance_mile: state.proper_distance_mile,
        proper_distance_middle: state.proper_distance_middle, proper_distance_long: state.proper_distance_long,
        proper_running_style_nige: state.proper_running_style_nige, proper_running_style_senko: state.proper_running_style_senko,
        proper_running_style_sashi: state.proper_running_style_sashi, proper_running_style_oikomi: state.proper_running_style_oikomi,
        proper_ground_turf: state.proper_ground_turf, proper_ground_dirt: state.proper_ground_dirt,
        turn: state.turn,
        skill_point: state.skill_point,
        short_cut_state: state.short_cut_state,
        state: state.state,
        playing_state: state.playing_state,
        scenario_id: state.scenario_id,
        route_id: state.route_id,
        succession_trained_chara_id_1: state.succession_trained_chara_id_1,
        succession_trained_chara_id_2: state.succession_trained_chara_id_2,
        route_race_id_array: state._goals.map(g => g.id),
        difficulty_id: 0,
        difficulty: 0,
        training_challenge_id: 0,
    }
}

export function execTrainingCommand(req: ExecCommandRequest) {
    const state = loadTrainingState(req.viewer_id)
    if (!state) return null

    const result = runCommand(state, req.command_type, req.command_id)
    if (result.advance) advanceTurn(state)
    persistTrainingState(state)

    return {
        chara_info: toCharaInfo(state),
        race_condition_array: [],
        not_up_parameter_info: null,
        not_down_parameter_info: null,
        home_info: toHomeInfo(state),
        command_result: { command_id: req.command_id, sub_id: result.sub_id, result_state: result.result_state },
        unchecked_event_array: [],
        ura_data_set: uraDataSet(state),
    }
}

/**
 * Story events are not implemented: the real ones need single_mode_story_data content and
 * their choice effects. Returning no events lets the turn continue; a fabricated story_id
 * would make the client try to load a story asset that doesn't exist.
 */
export function checkTrainingEvent(viewerId: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    return {
        chara_info: toCharaInfo(state),
        not_up_parameter_info: null,
        not_down_parameter_info: null,
        home_info: toHomeInfo(state),
        unchecked_event_array: [],
        event_effected_factor_array: [],
        race_condition_array: [],
        race_start_info: state._race ? raceStartInfo(state._race) : null,
        race_running_style: state.race_running_style,
        ura_data_set: uraDataSet(state),
    }
}

export function raceEntry(viewerId: number, programId: number) {
    const state = loadTrainingState(viewerId)
    if (!state || state.state !== CharaState.Playing) return null
    if (!isGoalTurn(state) && !turnInfo(state.turn).race_entry_type) return null   // pre-debut / finals gap turns
    const race = buildPendingRace(state, programId)
    if (!race) return null
    state._race = race
    state.playing_state = PlayingState.Race
    persistTrainingState(state)
    return {
        chara_info: toCharaInfo(state),
        home_info: toHomeInfo(state),
        race_start_info: raceStartInfo(race),
        unchecked_event_array: [],
        ura_data_set: uraDataSet(state),
    }
}

export function raceStart(viewerId: number) {
    const state = loadTrainingState(viewerId)
    if (!state?._race) return null
    const race = state._race
    // the running style may have changed since race_entry (change_running_style)
    race.race_horse_data[race.player_index].running_style = state.race_running_style
    race.horses[race.player_index] = playerScenarioHorse(state, race.race)
    const scenario = buildScenario(race)
    race.outcomes = scenario.outcomes
    state.playing_state = PlayingState.RaceInGame
    persistTrainingState(state)
    return { race_start_info: raceStartInfo(race), race_scenario: scenario.race_scenario }
}

export function raceEnd(viewerId: number) {
    const state = loadTrainingState(viewerId)
    if (!state?._race) return null
    const race = state._race
    if (!race.outcomes) race.outcomes = buildScenario(race).outcomes   // race_start skipped (shortened race)

    if (state.playing_state !== PlayingState.RaceResult) {
        race.snapshot = JSON.stringify({ ...state, _race: null })
        applyRaceResult(state, race)
        state.playing_state = PlayingState.RaceResult
    }
    persistTrainingState(state)

    return {
        race_reward_info: raceRewardInfo(state, race),
        chara_info: toCharaInfo(state),
        home_info: toHomeInfo(state),
        add_music: null,
        race_history: state.race_history,
        win_saddle_id_array: [],
        race_condition_array: [],
        add_trophy_info: null,
        trophy_reward_info: null,
        reward_summary_info: emptyRewardSummary(),
        race_add_reward_info: [],
        ura_data_set: uraDataSet(state),
    }
}

/** Retry a lost goal race with an alarm clock (continue_type 2) or the free retry (1). */
export function raceContinue(viewerId: number, continueType: number) {
    const state = loadTrainingState(viewerId)
    if (!state?._race?.snapshot) return null
    const race = state._race
    const restored = JSON.parse(state._race.snapshot) as TrainingRunState
    if (continueType === ContinueType.Free && state.available_free_continue_num > 0) {
        restored.available_free_continue_num = state.available_free_continue_num - 1
    } else if (state.available_continue_num > 0) {
        restored.available_continue_num = state.available_continue_num - 1
    } else {
        return null
    }
    race.continue_num += 1
    race.random_seed = randomInt(1, 2 ** 31 - 1)
    race.outcomes = null
    race.snapshot = null
    restored._race = race
    restored.playing_state = PlayingState.Race
    persistTrainingState(restored)
    return {
        chara_info: toCharaInfo(restored),
        home_info: toHomeInfo(restored),
        race_start_info: raceStartInfo(race),
        unchecked_event_array: [],
        user_item: null,
        ura_data_set: uraDataSet(restored),
    }
}

export function raceOut(viewerId: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    if (state._race) {
        state._race = null
        if (state.state === CharaState.Playing) advanceTurn(state)
        else state.playing_state = PlayingState.TurnEnd   // goal missed, career over: client goes to the result flow
    }
    persistTrainingState(state)
    return {
        chara_info: toCharaInfo(state),
        home_info: toHomeInfo(state),
        unchecked_event_array: [],
        ura_data_set: uraDataSet(state),
    }
}

export function gainSkills(viewerId: number, skills: SkillData[]) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    learnSkills(state, skills)
    persistTrainingState(state)
    return { chara_info: toCharaInfo(state), home_info: toHomeInfo(state), ura_data_set: uraDataSet(state) }
}

export function changeRunningStyle(viewerId: number, runningStyle: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    if (runningStyle >= 1 && runningStyle <= 4) {
        state.race_running_style = runningStyle
        if (state._race) state._race.race_horse_data[state._race.player_index].running_style = runningStyle
    }
    persistTrainingState(state)
    return {}
}

export function changeShortCut(viewerId: number, shortCutState: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    state.short_cut_state = shortCutState
    persistTrainingState(state)
    return { chara_info: toCharaInfo(state), unchecked_event_array: [], ura_data_set: uraDataSet(state) }
}

export function raceAnalyze(viewerId: number, programId: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    const race = state._race?.program_id === programId ? state._race : buildPendingRace(state, programId)
    return { race_horse_data_array: race?.race_horse_data ?? [] }
}

/** End of career: learn any last skills, then offer the inheritance-factor roll. */
export function factorSelect(viewerId: number, skillIds: number[]) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    learnSkills(state, (skillIds ?? []).map(id => ({ skill_id: id, level: 1 })))
    if (state._factor_lotteries.length === 0) {
        state._factor_lotteries.push({ lottery_id: 1, factor_info_array: rollFactors(state) })
        state._select_lottery_id = 1
    }
    state.playing_state = PlayingState.FactorSelect
    persistTrainingState(state)
    return { single_mode_factor_select_common: factorSelectCommon(state) }
}

export function factorLottery(viewerId: number, tpInfo: UserTpInfo | undefined) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    const id = state._factor_lotteries.length + 1
    state._factor_lotteries.push({ lottery_id: id, factor_info_array: rollFactors(state) })
    state._select_lottery_id = id
    persistTrainingState(state)
    const c = factorSelectCommon(state)
    return {
        single_mode_factor_lottery_common: {
            tp_info: tpInfo ?? { current_tp: 100, max_tp: 100, max_recovery_time: 0 },
            lottery_remain_num: c.lottery_remain_num,
            lottery_count: c.lottery_count,
            select_lottery_id: c.select_lottery_id,
            factor_select_info_array: c.factor_select_info_array,
        },
    }
}

export function finishTrainingRun(viewerId: number, isForceDelete: boolean, factorLotteryId: number) {
    const state = loadTrainingState(viewerId)
    if (!state) return null
    const db = getDatabase(Database.HONSE_DATA)

    if (isForceDelete) {
        db.prepare('DELETE FROM training_runs WHERE viewer_id = ?').run(viewerId)
        return { single_mode_finish_common: finishCommon(state, null) }
    }

    const lottery = state._factor_lotteries.find(l => l.lottery_id === factorLotteryId)
        ?? state._factor_lotteries.find(l => l.lottery_id === state._select_lottery_id)
    const factors = lottery?.factor_info_array ?? rollFactors(state)
    const { rank_score, rank } = rankOf(state)
    const trainedCharaId = insertTrainedChara(state.viewer_id, {
        card_id: state.card_id,
        rank, rank_score,
        speed: state.speed, stamina: state.stamina, power: state.power, guts: state.guts, wiz: state.wiz,
        rarity: state.rarity,
        talent_level: state.talent_level,
        chara_grade: state.chara_grade,
        running_style: state.race_running_style,
        scenario_id: state.scenario_id,
        route_id: state.route_id,
        wins: state.wins,
        fans: state.fans,
        skill_array: state.skill_array,
        race_result_list: state.race_result_list,
        factor_info_array: factors,
        factor_id_array: factors.map(f => f.factor_id),
        support_card_list: state.support_card_array.map(c => ({ position: c.position, support_card_id: c.support_card_id, exp: c.exp, limit_break_count: c.limit_break_count })),
        proper_distance_short: state.proper_distance_short,
        proper_distance_mile: state.proper_distance_mile,
        proper_distance_middle: state.proper_distance_middle,
        proper_distance_long: state.proper_distance_long,
        proper_ground_turf: state.proper_ground_turf,
        proper_ground_dirt: state.proper_ground_dirt,
        proper_running_style_nige: state.proper_running_style_nige,
        proper_running_style_senko: state.proper_running_style_senko,
        proper_running_style_sashi: state.proper_running_style_sashi,
        proper_running_style_oikomi: state.proper_running_style_oikomi,
        succession_trained_chara_id_1: state.succession_trained_chara_id_1,
        succession_trained_chara_id_2: state.succession_trained_chara_id_2,
    })
    incrementUserCharaTrainingStats(state.viewer_id, state.chara_id, state.fans)
    incrementSingleModePlayCount(state.viewer_id)
    db.prepare('DELETE FROM training_runs WHERE viewer_id = ?').run(viewerId)

    state.state = CharaState.FinishComplete
    const row = getUserTrainedCharas(viewerId).find((t: any) => t.trained_chara_id === trainedCharaId)
    return { single_mode_finish_common: finishCommon(state, row ? toClientTrainedChara(row, viewerId) : null, trainedCharaId) }
}

// ---------------------------------------------------------------------------
// State construction
// ---------------------------------------------------------------------------

function buildInitialState(req: TrainingStartRequest): TrainingRunState {
    const cardId = req.start_chara.card_id
    const userCard = getUserCardInfo(req.viewer_id, cardId)
    const rarity = userCard?.rarity ?? 1
    const card = getCardRarityData(cardId, rarity)
    const charaId = Math.floor(cardId / 100)
    const supportCards = buildSupportCardArray(req)
    const raceSetId = ura().routes[String(charaId)]
    const goals = (raceSetId !== undefined ? ura().route_races[String(raceSetId)] : undefined) ?? []

    const styleApt = [card.proper_running_style_nige, card.proper_running_style_senko, card.proper_running_style_sashi, card.proper_running_style_oikomi]
    const bestStyle = styleApt.indexOf(Math.max(...styleApt)) + 1
    const runningStyle = req.start_chara.running_style && req.start_chara.running_style >= 1 ? req.start_chara.running_style : bestStyle

    const state: TrainingRunState = {
        viewer_id: req.viewer_id,
        card_id: cardId,
        chara_id: charaId,
        rarity,
        talent_level: userCard?.talent_level ?? 1,
        scenario_id: req.start_chara.scenario_id || URA_SCENARIO_ID,
        route_id: ura().route_ids[String(charaId)] ?? 0,
        start_time: formatServerTimestamp(),

        running_style: runningStyle,
        race_running_style: runningStyle,
        proper_distance_short: card.proper_distance_short,
        proper_distance_mile: card.proper_distance_mile,
        proper_distance_middle: card.proper_distance_middle,
        proper_distance_long: card.proper_distance_long,
        proper_ground_turf: card.proper_ground_turf,
        proper_ground_dirt: card.proper_ground_dirt,
        proper_running_style_nige: card.proper_running_style_nige,
        proper_running_style_senko: card.proper_running_style_senko,
        proper_running_style_sashi: card.proper_running_style_sashi,
        proper_running_style_oikomi: card.proper_running_style_oikomi,
        succession_trained_chara_id_1: req.start_chara.succession_trained_chara_id_1 ?? 0,
        succession_trained_chara_id_2: req.start_chara.succession_trained_chara_id_2 ?? 0,

        turn: 1,
        state: CharaState.Playing,
        playing_state: PlayingState.TurnStart,
        short_cut_state: 0,
        vital: 100,
        max_vital: 100,
        motivation: 3,
        fans: 1,
        wins: 0,
        runs: 0,
        chara_grade: 1,
        skill_point: 120,   // approximation of the career starting skill points
        // the card's unique skill; the client's inspiration screen looks it up here and stalls without it
        skill_array: startingSkills(card.skill_set),

        speed: card.speed,
        stamina: card.stamina,
        power: card.pow,
        guts: card.guts,
        wiz: card.wiz,
        max_speed: card.max_speed,
        max_stamina: card.max_stamina,
        max_power: card.max_pow,
        max_guts: card.max_guts,
        max_wiz: card.max_wiz,
        default_max: { speed: card.max_speed, stamina: card.max_stamina, power: card.max_pow, guts: card.max_guts, wiz: card.max_wiz },

        support_card_array: supportCards,
        friendship: Object.fromEntries(supportCards.map(c => [c.position, initialFriendship(c)])),
        partners: {},

        race_history: [],
        race_result_list: [],
        available_continue_num: MAX_CONTINUES,
        available_free_continue_num: MAX_FREE_CONTINUES,

        _command_usage_count: {},
        _goals: goals,
        _race: null,
        _factor_lotteries: [],
        _select_lottery_id: 0,
    }
    placePartners(state)
    applyStartSuccession(state, req.viewer_id)
    return state
}

function startingSkills(skillSet: number | undefined): SkillData[] {
    return (skillSet ? ura().skill_sets[String(skillSet)] ?? [] : []).map(s => ({ ...s }))
}

const BLUE_STATS = ['speed', 'stamina', 'power', 'guts', 'wiz'] as const
const PINK_APTITUDES: Record<number, keyof TrainingRunState> = {
    11: 'proper_ground_turf', 12: 'proper_ground_dirt',
    21: 'proper_running_style_nige', 22: 'proper_running_style_senko', 23: 'proper_running_style_sashi', 24: 'proper_running_style_oikomi',
    31: 'proper_distance_short', 32: 'proper_distance_mile', 33: 'proper_distance_middle', 34: 'proper_distance_long',
}

/**
 * Career-start inheritance, mirroring the client's WorkDataUtil.CalcSuccessionBonusParameter
 * (it shows these gains on the inspiration screen and expects chara_info to include them).
 * Factors of both parents and their parents (not further back) count. Blue: each factor adds the
 * succession_initial_factor points for its stars to the stat (value_2 0) and its cap (value_2 1).
 * Pink: stars are summed per aptitude and the total's range gives the aptitude levels gained.
 */
function applyStartSuccession(state: TrainingRunState, viewerId: number) {
    const parentIds = [state.succession_trained_chara_id_1, state.succession_trained_chara_id_2].filter(Boolean)
    if (!parentIds.length) return
    const owned = getUserTrainedCharas(viewerId)
    const factorIds: number[] = []
    for (const id of parentIds) {
        const tc = owned.find((t: any) => t.trained_chara_id === id)
        if (!tc) continue   // rental parents live on another account
        factorIds.push(...parseJson<number[]>(tc.factor_id_array, []))
        // the parent's own parents sit at position_id 10 and 20 (11/12/21/22 are a generation further)
        for (const gp of parseJson<any[]>(tc.succession_chara_array, [])) {
            if (gp.position_id % 10 === 0) factorIds.push(...(gp.factor_id_array ?? []))
        }
    }

    const initial = ura().succession_initial_factors
    const pinkStars: Record<number, number> = {}
    for (const factorId of factorIds) {
        const group = Math.floor(factorId / 100), stars = factorId % 100
        if (group >= 1 && group <= 5) {
            const stat = BLUE_STATS[group - 1]
            const maxKey = `max_${stat}` as const
            for (const row of initial.filter(r => r.factor_type === 1 && r.value_1 === stars)) {
                if (row.value_2 === 1) state[maxKey] += row.add_point
                else state[stat] += row.add_point
            }
        } else if (PINK_APTITUDES[group]) {
            pinkStars[group] = (pinkStars[group] ?? 0) + stars
        }
    }
    for (const stat of BLUE_STATS) state[stat] = Math.min(state[stat], state[`max_${stat}` as const])
    for (const [group, total] of Object.entries(pinkStars)) {
        const row = initial.find(r => r.factor_type === 2 && total >= r.value_1 && total <= r.value_2)
        const key = PINK_APTITUDES[Number(group)]
        if (row) (state as any)[key] = Math.min(8, (state[key] as number) + row.add_point)
    }
}

function parseJson<T>(value: unknown, fallback: T): T {
    if (typeof value !== 'string') return (value as T) ?? fallback
    try { return JSON.parse(value) as T } catch { return fallback }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function runCommand(state: TrainingRunState, commandType: number, commandId: number): { advance: boolean, sub_id: number, result_state: number } {
    if (isGoalTurn(state) || state.state !== CharaState.Playing || state._race) {
        return { advance: false, sub_id: 0, result_state: ResultState.Failure }
    }
    const trainings = trainingIdsForTurn(state.turn)
    if (trainings.includes(commandId)) {
        return { advance: true, sub_id: 1, result_state: runTraining(state, commandId) }
    }
    if (commandType === CommandType.Outing || OUTING_IDS.includes(commandId)) {
        // summer camp has no rest/outing split: its outing is the 304 "summer rest" effect
        const effectId = turnInfo(state.turn).training_set_id === 2 ? 304 : 301
        applyParams(state, baseParams(effectId))
        return { advance: true, sub_id: 1, result_state: ResultState.Success }
    }
    if (commandType === CommandType.Holiday || commandId === REST_COMMAND_ID) {
        // Rest: +70 / +50 / +30 vital (sub results 1-3). The odds are an approximation.
        const roll = randomInt(0, 100)
        const sub = roll < 60 ? 1 : roll < 90 ? 2 : 3
        state.vital = clamp(state.vital + [0, 70, 50, 30][sub], 0, state.max_vital)
        return { advance: true, sub_id: sub, result_state: ResultState.Success }
    }
    if (commandType === CommandType.Hospital || commandId === HOSPITAL_COMMAND_ID) {
        state.vital = clamp(state.vital + 20, 0, state.max_vital)
        return { advance: true, sub_id: 1, result_state: ResultState.Success }
    }
    return { advance: false, sub_id: 0, result_state: ResultState.Failure }   // unknown command: ack without changing anything
}

function runTraining(state: TrainingRunState, commandId: number): number {
    const level = commandLevel(state, commandId)
    const bonuses = aggregateSupportBonuses(state, commandId)
    const failed = randomInt(0, 100) < computeFailureRate(level, state.vital, state.max_vital, bonuses.failureProtectionPct)

    for (const p of trainingParams(state, commandId, bonuses)) {
        if (p.target_type === Target.Vital) {
            state.vital = clamp(state.vital + Math.round(p.value * (failed ? 1.4 : 1)), 0, state.max_vital)
        } else if (p.target_type === Target.SkillPoint) {
            state.skill_point += Math.max(0, Math.round(p.value * (failed ? 0.25 : 1)))
        } else if (!failed) {
            applyStatGain(state, p.target_type, Math.round(p.value * (1 + randomInt(-8, 9) / 100)))
        }
    }

    if (failed && randomInt(0, 100) < 50) state.motivation = clamp(state.motivation - 1, 1, 5)
    if (!failed) {
        for (const pos of state.partners[commandId] ?? []) {
            state.friendship[pos] = clamp((state.friendship[pos] ?? 0) + 7, 0, 100)
        }
    }

    if (!SUMMER_TRAININGS.includes(commandId)) {
        state._command_usage_count[String(commandId)] = (state._command_usage_count[String(commandId)] ?? 0) + 1
    }
    return failed ? ResultState.Failure : ResultState.Success
}

/** The params a training would give right now, as shown on the home screen and applied on success. */
function trainingParams(state: TrainingRunState, commandId: number, bonuses = aggregateSupportBonuses(state, commandId)) {
    const level = commandLevel(state, commandId)
    // Growth per level isn't in master.mdb; +1 per level on each stat it raises is an approximation.
    return baseParams(commandId).map(p => {
        if (p.target_type === Target.Vital) {
            return { target_type: p.target_type, value: p.value < 0 ? Math.round(p.value * (1 - bonuses.energyCostReductionPct / 100)) : p.value }
        }
        if (p.target_type === Target.SkillPoint) {
            return { target_type: p.target_type, value: Math.round(p.value * (1 + bonuses.skillPointBonusPct / 100)) }
        }
        const statPct = (bonuses.statBonusPct[p.target_type] ?? 0) + bonuses.trainingEffectivenessPct + bonuses.friendshipPct
        const moodPct = [0, -20, -10, 0, 10, 20][state.motivation]
        const value = (p.value + (level - 1)) * (1 + statPct / 100) * (1 + moodPct / 100) * (1 + 0.05 * bonuses.partnerCount)
        return { target_type: p.target_type, value: Math.round(value) }
    })
}

function commandLevel(state: TrainingRunState, commandId: number): number {
    if (SUMMER_TRAININGS.includes(commandId)) return MAX_COMMAND_LEVEL
    const uses = state._command_usage_count[String(commandId)] ?? 0
    return Math.min(MAX_COMMAND_LEVEL, 1 + Math.floor(uses / USES_PER_LEVEL_UP))
}

function applyParams(state: TrainingRunState, params: { target_type: number, value: number }[]) {
    for (const p of params) {
        if (p.target_type === Target.Vital) state.vital = clamp(state.vital + p.value, 0, state.max_vital)
        else if (p.target_type === Target.Motivation) state.motivation = clamp(state.motivation + p.value, 1, 5)
        else if (p.target_type === Target.SkillPoint) state.skill_point += p.value
        else applyStatGain(state, p.target_type, p.value)
    }
}

function applyStatGain(state: TrainingRunState, targetType: number, gain: number) {
    switch (targetType) {
        case Target.Speed: state.speed = clamp(state.speed + gain, 1, state.max_speed); break
        case Target.Stamina: state.stamina = clamp(state.stamina + gain, 1, state.max_stamina); break
        case Target.Power: state.power = clamp(state.power + gain, 1, state.max_power); break
        case Target.Guts: state.guts = clamp(state.guts + gain, 1, state.max_guts); break
        case Target.Wiz: state.wiz = clamp(state.wiz + gain, 1, state.max_wiz); break
    }
}

function advanceTurn(state: TrainingRunState) {
    state.turn += 1
    state.playing_state = PlayingState.TurnStart
    if (state.turn > LAST_TURN) {
        state.turn = LAST_TURN
        state.state = CharaState.TrueEnd
        state.playing_state = PlayingState.TurnEnd
        return
    }
    placePartners(state)
}

/** Each support card shows up at one training per turn (or sits the turn out). */
function placePartners(state: TrainingRunState) {
    const trainings = trainingIdsForTurn(state.turn)
    const partners: Record<number, number[]> = {}
    for (const id of trainings) partners[id] = []
    for (const card of state.support_card_array) {
        if (randomInt(0, 100) < 15) continue
        const id = trainings[randomInt(0, trainings.length)]
        partners[id].push(card.position)
    }
    state.partners = partners
}

function isGoalTurn(state: TrainingRunState): boolean {
    return state._goals.some(g => g.turn === state.turn)
}

// ---------------------------------------------------------------------------
// Support cards
// ---------------------------------------------------------------------------

type SupportEffectsEntry = { id: number, type: number, init: number } & Record<string, number>
let supportEffectsCache: SupportEffectsEntry[] | null = null

const STAT_TARGET_TO_EFFECT_TYPE: Record<number, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 }
const EFFECT_TYPE = { FRIENDSHIP_BONUS: 1, MOOD_EFFECT: 2, TRAINING_EFFECTIVENESS: 8, INITIAL_FRIENDSHIP: 14, FAILURE_PROTECTION: 27, ENERGY_COST_REDUCTION: 28, SKILL_POINT_BONUS: 30 }
const FRIENDSHIP_TRAINING_THRESHOLD = 80

interface AggregatedBonuses {
    statBonusPct: Record<number, number>
    trainingEffectivenessPct: number
    friendshipPct: number
    skillPointBonusPct: number
    failureProtectionPct: number
    energyCostReductionPct: number
    partnerCount: number
}

/** Bonuses from the support cards present at this training this turn. */
function aggregateSupportBonuses(state: TrainingRunState, commandId: number): AggregatedBonuses {
    const result: AggregatedBonuses = { statBonusPct: {}, trainingEffectivenessPct: 0, friendshipPct: 0, skillPointBonusPct: 0, failureProtectionPct: 0, energyCostReductionPct: 0, partnerCount: 0 }
    const present = state.partners[commandId] ?? []
    const statTargets = baseParams(commandId).map(p => p.target_type).filter(t => t >= 1 && t <= 5)
    for (const card of state.support_card_array) {
        if (!present.includes(card.position)) continue
        result.partnerCount++
        const level = calcSupportCardLevel(card.exp, card.limit_break_count)
        for (const t of statTargets) {
            result.statBonusPct[t] = (result.statBonusPct[t] ?? 0) + getSupportEffectValue(card.support_card_id, STAT_TARGET_TO_EFFECT_TYPE[t], level)
        }
        result.trainingEffectivenessPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.TRAINING_EFFECTIVENESS, level)
        if ((state.friendship[card.position] ?? 0) >= FRIENDSHIP_TRAINING_THRESHOLD) {
            result.friendshipPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.FRIENDSHIP_BONUS, level)
        }
        result.skillPointBonusPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.SKILL_POINT_BONUS, level)
        result.failureProtectionPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.FAILURE_PROTECTION, level)
        result.energyCostReductionPct += getSupportEffectValue(card.support_card_id, EFFECT_TYPE.ENERGY_COST_REDUCTION, level)
    }
    return result
}

function initialFriendship(card: TrainingSupportCard): number {
    return clamp(getSupportEffectValue(card.support_card_id, EFFECT_TYPE.INITIAL_FRIENDSHIP, calcSupportCardLevel(card.exp, card.limit_break_count)), 0, 100)
}

function computeFailureRate(level: number, vital: number, maxVital: number, failureProtectionPct: number): number {
    // Approximation: no failures above ~half energy, rising steeply as energy runs out.
    const ratio = maxVital > 0 ? vital / maxVital : 0
    let rate = ratio >= 0.5 ? 0 : Math.round((0.5 - ratio) * 2 * 100 * (1 + (level - 1) * 0.04))
    rate = rate * (1 - failureProtectionPct / 100)
    return clamp(Math.round(rate), 0, 99)
}

function loadSupportEffects(): SupportEffectsEntry[] {
    if (!supportEffectsCache) {
        supportEffectsCache = JSON.parse(readFileSync(path.join(process.cwd(), 'assets', 'support_cards_effect_table_data.json'), 'utf-8'))
    }
    return supportEffectsCache!
}

// Effect values are defined at level milestones (5/10/.../50); -1 means "unchanged since the
// previous milestone". Walk the milestones up to `level`, falling back to `init`.
function getSupportEffectValue(supportCardId: number, effectType: number, level: number): number {
    const entry = loadSupportEffects().find(e => e.id === supportCardId && e.type === effectType)
    if (!entry) return 0
    let value = entry.init ?? 0
    for (const m of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]) {
        if (m > level) break
        const v = entry[`limit_lv${m}`]
        if (typeof v === 'number' && v !== -1) value = v
    }
    return value
}

function calcSupportCardLevel(exp: number, limitBreakCount: number): number {
    const maxLevel = 30 + Math.max(0, limitBreakCount) * 5
    return Math.max(1, Math.min(maxLevel, Math.floor(exp / 100) + 1))
}

function buildSupportCardArray(req: TrainingStartRequest): TrainingSupportCard[] {
    const arr: TrainingSupportCard[] = []
    const ids = req.start_chara.support_card_ids || []
    for (let i = 0; i < Math.min(5, ids.length); i++) {
        const row = getUserSupportCardById(req.viewer_id, ids[i])
        arr.push({ exp: row?.exp ?? 0, limit_break_count: row?.limit_break_count ?? 0, owner_viewer_id: req.viewer_id, position: i + 1, support_card_id: ids[i] })
    }
    const friend = req.start_chara.friend_support_card_info
    if (friend && friend.support_card_id) {
        const row = getUserSupportCardById(friend.viewer_id, friend.support_card_id)
        arr.push({ exp: row?.exp ?? 0, limit_break_count: row?.limit_break_count ?? 0, owner_viewer_id: friend.viewer_id, position: 6, support_card_id: friend.support_card_id })
    }
    return arr
}

// ---------------------------------------------------------------------------
// Races
// ---------------------------------------------------------------------------

function buildPendingRace(state: TrainingRunState, programId: number): PendingRace | null {
    const program = getProgram(programId)
    if (!program) return null
    let race: PendingRace['race'] = {
        race_instance_id: program.race_instance_id, distance: program.distance, ground: program.ground,
        finish_time_min: program.finish_time_min, finish_time_max: program.finish_time_max,
        grade: program.grade, fan_set_id: program.fan_set_id,
    }
    if (program.is_ura_final) {
        const f = pickUraFinalRace(state, program.id)
        race = { ...race, race_instance_id: f.race_instance_id, distance: f.distance, ground: f.ground, finish_time_min: f.finish_time_min, finish_time_max: f.finish_time_max }
    }

    const seed = randomInt(1, 2 ** 31 - 1)
    const rng = mulberry32(seed)
    const npcs = pickNpcs(state, program, clamp(program.entry_num || 18, 2, 18) - 1, rng)
    const fieldSize = npcs.length + 1
    const playerGate = Math.floor(rng() * fieldSize)

    const entrants: { data: any, horse: ScenarioHorse }[] = []
    let n = 0
    for (let gate = 0; gate < fieldSize; gate++) {
        if (gate === playerGate) {
            entrants.push({ data: playerRaceHorseData(state, gate + 1), horse: playerScenarioHorse(state, race) })
        } else {
            const npc = npcs[n++]
            const motivation = npc.motivation_min + Math.floor(rng() * (npc.motivation_max - npc.motivation_min + 1))
            entrants.push({ data: npcRaceHorseData(npc, gate + 1, motivation), horse: npcScenarioHorse(npc, race, motivation) })
        }
    }

    // popularity: favourite = strongest on paper
    const strength = entrants.map(e => performanceScore(e.horse, race.distance))
    const byStrength = strength.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s)
    byStrength.forEach((x, rank) => { entrants[x.i].data.popularity = rank + 1 })

    return {
        program_id: programId,
        race,
        random_seed: seed,
        weather: 1 + Math.floor(rng() * 2),          // sunny / cloudy
        ground_condition: 1,                          // good
        race_horse_data: entrants.map(e => e.data),
        player_index: playerGate,
        horses: entrants.map(e => e.horse),
        outcomes: null,
        snapshot: null,
        continue_num: 0,
    }
}

/** URA Finals stage 10001-10003: run it at the distance category and ground the horse is best at. */
function pickUraFinalRace(state: TrainingRunState, stageId: number): FinalRace {
    const pool = ura().ura_final_races
    const ground = state.proper_ground_dirt > state.proper_ground_turf ? 2 : 1
    const apts = [state.proper_distance_short, state.proper_distance_mile, state.proper_distance_middle, state.proper_distance_long]
    const cat = apts.indexOf(Math.max(...apts))
    const inCat = (d: number) => [d <= 1400, d > 1400 && d <= 1800, d > 1800 && d <= 2400, d > 2400][cat]
    const candidates = pool.filter(r => r.ground === ground && inCat(r.distance))
    const list = candidates.length ? candidates : pool
    return list[(stageId - 10001 + list.length) % list.length]
}

function pickNpcs(state: TrainingRunState, program: Program, count: number, rng: () => number): Npc[] {
    const pool = (ura().npc_groups['0'] ?? []).filter(n => n.chara_id !== state.chara_id)
    // Field strength (stat total) grows over the career and with race grade: ~500 at the debut,
    // ~640 early classic year, ~860 for the classic G1s, ~1550 late senior year, ~1650-1850 in
    // the URA Finals. Tuned so a reasonably trained horse can clear its goals; not taken from
    // the real game.
    const gradeBonus: Record<number, number> = { 100: 100, 200: 50, 1000: 150 }
    const target = 150 + state.turn * 18 + (gradeBonus[program.grade] ?? 0)
    // single_mode_npc is the named-rival roster at roughly classic/senior strength (almost nothing
    // below a 1000 stat total), so pick rivals at random and scale each one's stats to the target
    // (+-10%), keeping its stat shape and aptitudes.
    const total = (n: Npc) => n.speed + n.stamina + n.pow + n.guts + n.wiz
    const picked: Npc[] = []
    const usedCharas = new Set<number>()
    for (let tries = 0; picked.length < count && tries < count * 20 && pool.length; tries++) {
        const n = pool[Math.floor(rng() * pool.length)]
        if (n.chara_id && usedCharas.has(n.chara_id)) continue
        usedCharas.add(n.chara_id)
        const scale = target * (0.9 + rng() * 0.2) / Math.max(1, total(n))
        picked.push({
            ...n,
            speed: Math.max(50, Math.round(n.speed * scale)), stamina: Math.max(50, Math.round(n.stamina * scale)),
            pow: Math.max(50, Math.round(n.pow * scale)), guts: Math.max(50, Math.round(n.guts * scale)), wiz: Math.max(50, Math.round(n.wiz * scale)),
        })
    }
    return picked
}

function playerRaceHorseData(state: TrainingRunState, frameOrder: number) {
    return {
        viewer_id: state.viewer_id, owner_viewer_id: state.viewer_id, trainer_name: '', owner_trainer_name: '',
        single_mode_chara_id: 1, trained_chara_id: 0, nickname_id: 0,
        card_id: state.card_id, chara_id: state.chara_id, rarity: state.rarity, talent_level: state.talent_level,
        frame_order: frameOrder, skill_array: state.skill_array,
        stamina: state.stamina, speed: state.speed, pow: state.power, guts: state.guts, wiz: state.wiz,
        running_style: state.race_running_style, race_dress_id: state.card_id, chara_color_type: 0, npc_type: 0,
        final_grade: 0, popularity: 0, popularity_mark_rank_array: [],
        proper_distance_short: state.proper_distance_short, proper_distance_mile: state.proper_distance_mile,
        proper_distance_middle: state.proper_distance_middle, proper_distance_long: state.proper_distance_long,
        proper_running_style_nige: state.proper_running_style_nige, proper_running_style_senko: state.proper_running_style_senko,
        proper_running_style_sashi: state.proper_running_style_sashi, proper_running_style_oikomi: state.proper_running_style_oikomi,
        proper_ground_turf: state.proper_ground_turf, proper_ground_dirt: state.proper_ground_dirt,
        motivation: state.motivation, mob_id: 0, win_saddle_id_array: [], race_result_array: [],
        team_id: 0, team_member_id: 0, item_id_array: [], motivation_change_flag: 0, frame_order_change_flag: 0,
        team_rank: 0, single_mode_win_count: state.wins, fan_count: state.fans,
    }
}

function npcRaceHorseData(npc: Npc, frameOrder: number, motivation: number) {
    const styles = [npc.proper_running_style_nige, npc.proper_running_style_senko, npc.proper_running_style_sashi, npc.proper_running_style_oikomi]
    return {
        viewer_id: 0, owner_viewer_id: 0, trainer_name: '', owner_trainer_name: '',
        single_mode_chara_id: 0, trained_chara_id: 0, nickname_id: 0,
        card_id: npc.chara_id ? npc.chara_id * 100 + 1 : 0, chara_id: npc.chara_id, rarity: 1, talent_level: 1,
        frame_order: frameOrder, skill_array: [],
        stamina: npc.stamina, speed: npc.speed, pow: npc.pow, guts: npc.guts, wiz: npc.wiz,
        running_style: styles.indexOf(Math.max(...styles)) + 1, race_dress_id: npc.race_dress_id, chara_color_type: 0, npc_type: 1,
        final_grade: 0, popularity: 0, popularity_mark_rank_array: [],
        proper_distance_short: npc.proper_distance_short, proper_distance_mile: npc.proper_distance_mile,
        proper_distance_middle: npc.proper_distance_middle, proper_distance_long: npc.proper_distance_long,
        proper_running_style_nige: npc.proper_running_style_nige, proper_running_style_senko: npc.proper_running_style_senko,
        proper_running_style_sashi: npc.proper_running_style_sashi, proper_running_style_oikomi: npc.proper_running_style_oikomi,
        proper_ground_turf: npc.proper_ground_turf, proper_ground_dirt: npc.proper_ground_dirt,
        motivation, mob_id: npc.mob_id, win_saddle_id_array: [], race_result_array: [],
        team_id: 0, team_member_id: 0, item_id_array: [], motivation_change_flag: 0, frame_order_change_flag: 0,
        team_rank: 0, single_mode_win_count: 0, fan_count: 0,
    }
}

function distanceAptitude(src: { proper_distance_short: number, proper_distance_mile: number, proper_distance_middle: number, proper_distance_long: number }, distance: number) {
    if (distance <= 1400) return src.proper_distance_short
    if (distance <= 1800) return src.proper_distance_mile
    if (distance <= 2400) return src.proper_distance_middle
    return src.proper_distance_long
}

function styleAptitude(src: any, style: number): number {
    return [0, src.proper_running_style_nige, src.proper_running_style_senko, src.proper_running_style_sashi, src.proper_running_style_oikomi][style] ?? 1
}

function playerScenarioHorse(state: TrainingRunState, race: PendingRace['race']): ScenarioHorse {
    return {
        speed: state.speed, stamina: state.stamina, pow: state.power, guts: state.guts, wiz: state.wiz,
        running_style: state.race_running_style,
        distance_aptitude: distanceAptitude(state, race.distance),
        ground_aptitude: race.ground === 2 ? state.proper_ground_dirt : state.proper_ground_turf,
        style_aptitude: styleAptitude(state, state.race_running_style),
        motivation: state.motivation,
    }
}

function npcScenarioHorse(npc: Npc, race: PendingRace['race'], motivation: number): ScenarioHorse {
    const styles = [npc.proper_running_style_nige, npc.proper_running_style_senko, npc.proper_running_style_sashi, npc.proper_running_style_oikomi]
    const style = styles.indexOf(Math.max(...styles)) + 1
    return {
        speed: npc.speed, stamina: npc.stamina, pow: npc.pow, guts: npc.guts, wiz: npc.wiz,
        running_style: style,
        distance_aptitude: distanceAptitude(npc, race.distance),
        ground_aptitude: race.ground === 2 ? npc.proper_ground_dirt : npc.proper_ground_turf,
        style_aptitude: styles[style - 1],
        motivation,
    }
}

function buildScenario(race: PendingRace) {
    return generateRaceScenario(race.race, race.horses, race.random_seed)
}

function raceStartInfo(race: PendingRace) {
    return {
        program_id: race.program_id,
        random_seed: race.random_seed,
        weather: race.weather,
        ground_condition: race.ground_condition,
        race_horse_data: race.race_horse_data,
        continue_num: race.continue_num,
        is_force_running_style: 0,
    }
}

// Race rewards: fans come from single_mode_fan_count; the stat and skill point bonus is an
// approximation (the real per-grade table isn't in master.mdb).
const RACE_STAT_BONUS: Record<number, number> = { 100: 10, 200: 8, 300: 8, 400: 5, 700: 5, 800: 3, 900: 3, 1000: 10 }
const RACE_SKILL_POINTS: Record<number, number> = { 100: 45, 200: 40, 300: 35, 400: 30, 700: 30, 800: 25, 900: 25, 1000: 45 }

function playerRank(race: PendingRace): number {
    return (race.outcomes?.[race.player_index].finish_order ?? 0) + 1
}

function applyRaceResult(state: TrainingRunState, race: PendingRace) {
    const rank = playerRank(race)
    const fans = ura().fan_sets[String(race.race.fan_set_id)]?.[rank - 1] ?? 0
    state.fans += fans
    state.runs += 1
    if (rank === 1) state.wins += 1

    const factor = rank === 1 ? 1 : rank <= 3 ? 0.6 : rank <= 5 ? 0.4 : 0.2
    const stat = Math.round((RACE_STAT_BONUS[race.race.grade] ?? 3) * factor)
    for (const t of [Target.Speed, Target.Stamina, Target.Power, Target.Guts, Target.Wiz]) applyStatGain(state, t, stat)
    state.skill_point += Math.round((RACE_SKILL_POINTS[race.race.grade] ?? 25) * factor)
    state.vital = clamp(state.vital - 15, 0, state.max_vital)
    state.chara_grade = computeCharaGrade(state)

    const frameOrder = race.race_horse_data[race.player_index].frame_order
    state.race_history.push({
        turn: state.turn, program_id: race.program_id, weather: race.weather, ground_condition: race.ground_condition,
        running_style: state.race_running_style, result_rank: rank, frame_order: frameOrder, npc_count: race.race_horse_data.length - 1,
    })
    state.race_result_list.push({
        turn: state.turn, program_id: race.program_id, weather: race.weather, ground_condition: race.ground_condition,
        running_style: state.race_running_style, result_rank: rank,
    })

    const goal = state._goals.find(g => g.turn === state.turn)
    if (goal && goal.condition_value_1 > 0 && rank > goal.condition_value_1) {
        state.state = CharaState.TargetFailedEnd
    }
}

function raceRewardInfo(state: TrainingRunState, race: PendingRace) {
    const rank = playerRank(race)
    return {
        result_rank: rank,
        result_time: Math.round((race.outcomes?.[race.player_index].finish_time ?? 0) * 10000),
        race_reward: [],
        race_reward_bonus: [],
        race_reward_plus_bonus: [],
        race_reward_bonus_win: [],
        race_reward_limit: [],
        gained_fans: ura().fan_sets[String(race.race.fan_set_id)]?.[rank - 1] ?? 0,
        campaign_id_array: [],
    }
}

function computeCharaGrade(state: TrainingRunState): number {
    let grade = 1
    for (const g of ura().chara_grades) {
        if (state.wins >= g.win_num && state.runs >= g.run_num && state.fans >= g.need_fan_count) grade = Math.max(grade, g.id)
    }
    return grade
}

// ---------------------------------------------------------------------------
// Skills, rank, factors
// ---------------------------------------------------------------------------

function learnSkills(state: TrainingRunState, skills: SkillData[]) {
    for (const s of skills ?? []) {
        if (!s?.skill_id) continue
        const cost = ura().skill_need_points[String(s.skill_id)] ?? 150
        if (state.skill_point < cost) continue
        const existing = state.skill_array.find(k => k.skill_id === s.skill_id)
        if (existing) {
            existing.level = Math.max(existing.level, s.level || existing.level + 1)
        } else {
            state.skill_array.push({ skill_id: s.skill_id, level: s.level || 1 })
        }
        state.skill_point -= cost
    }
}

/** Approximate rank score: stat total plus a little per learned skill, mapped through single_mode_rank. */
function rankOf(state: TrainingRunState): { rank_score: number, rank: number } {
    const rank_score = Math.round((state.speed + state.stamina + state.power + state.guts + state.wiz) * 1.6 + state.skill_array.length * 170)
    const r = ura().ranks.find(x => rank_score >= x.min_value && rank_score <= x.max_value)
    return { rank_score, rank: r?.id ?? 1 }
}

/**
 * One blue (stat) factor, one pink (aptitude) factor and, when the card has one, its red
 * (unique) factor. Ids follow succession_factor: stat*100+stars, aptitude_group*100+stars,
 * card_id*100+stars.
 */
function rollFactors(state: TrainingRunState): { factor_id: number, level: number }[] {
    const stars = () => { const r = randomInt(0, 100); return r < 50 ? 1 : r < 85 ? 2 : 3 }
    const factors: { factor_id: number, level: number }[] = []

    const stats = [state.speed, state.stamina, state.power, state.guts, state.wiz]
    const statIdx = randomInt(0, 100) < 70 ? stats.indexOf(Math.max(...stats)) : randomInt(0, 5)
    factors.push({ factor_id: (statIdx + 1) * 100 + stars(), level: 1 })

    const apt: [number, number][] = [
        [11, state.proper_ground_turf], [12, state.proper_ground_dirt],
        [21, state.proper_running_style_nige], [22, state.proper_running_style_senko], [23, state.proper_running_style_sashi], [24, state.proper_running_style_oikomi],
        [31, state.proper_distance_short], [32, state.proper_distance_mile], [33, state.proper_distance_middle], [34, state.proper_distance_long],
    ]
    const good = apt.filter(([, v]) => v >= 7)
    const pick = (good.length ? good : apt)[randomInt(0, (good.length ? good : apt).length)]
    factors.push({ factor_id: pick[0] * 100 + stars(), level: 1 })

    if (ura().unique_factor_cards.includes(state.card_id)) {
        factors.push({ factor_id: state.card_id * 100 + stars(), level: 1 })
    }
    return factors
}

function factorSelectCommon(state: TrainingRunState) {
    const { rank_score, rank } = rankOf(state)
    return {
        rank_score,
        rank,
        lottery_remain_num: 0,
        lottery_count: Math.max(0, state._factor_lotteries.length - 1),
        select_lottery_id: state._select_lottery_id,
        factor_select_info_array: state._factor_lotteries,
    }
}

function finishCommon(state: TrainingRunState, trainedChara: any | null, trainedCharaId = 0) {
    return {
        trained_chara: trainedChara ? [trainedChara] : [],
        directory_card_array: [],
        directory_ranking: 0,
        trained_chara_id: trainedCharaId,
        directory_card_num: 0,
        chara_info: toCharaInfo(state),
        love_point_info: { chara_id: state.chara_id, love_point_before: 0, love_point_after: 0, love_point_pool_before: 0, love_point_pool_after: 0 },
        reward_item_info: emptyRewardSummary(),
        support_card_data_array: [],
        limited_shop_info: null,
        update_user_chara_info: null,
        release_item_flag: 0,
        circle_point: 0,
        new_chara_profile_array: [],
        campaign_id_array: [],
        scenario_record_array: [],
        scenario_record_reward_array: [],
        story_event_info: null,
        difficulty_data_set: null,
        transfer_event_info: null,
        training_challenge_result: null,
        fan_raid_info: null,
        campaign_walking_gauge_info: null,
        map_event_gauge_info: null,
        collect_raid_info: null,
        factor_research_data_set: null,
    }
}

// ---------------------------------------------------------------------------
// Client payload shaping
// ---------------------------------------------------------------------------

function toCharaInfo(state: TrainingRunState) {
    return {
        single_mode_chara_id: 1,
        card_id: state.card_id,
        chara_grade: state.chara_grade,
        speed: state.speed,
        stamina: state.stamina,
        power: state.power,
        wiz: state.wiz,
        guts: state.guts,
        vital: state.vital,
        max_speed: state.max_speed,
        max_stamina: state.max_stamina,
        max_power: state.max_power,
        max_wiz: state.max_wiz,
        max_guts: state.max_guts,
        default_max_speed: state.default_max.speed,
        default_max_stamina: state.default_max.stamina,
        default_max_power: state.default_max.power,
        default_max_wiz: state.default_max.wiz,
        default_max_guts: state.default_max.guts,
        max_vital: state.max_vital,
        motivation: state.motivation,
        fans: state.fans,
        rarity: state.rarity,
        race_program_id: state._race?.program_id ?? 0,
        reserve_race_program_id: 0,
        race_running_style: state.race_running_style,
        is_short_race: 0,
        talent_level: state.talent_level,
        skill_array: state.skill_array,
        disable_skill_id_array: [],
        skill_tips_array: [],
        support_card_array: state.support_card_array.map(c => ({
            position: c.position, support_card_id: c.support_card_id, limit_break_count: c.limit_break_count, exp: c.exp,
            training_partner_state: 0, owner_viewer_id: c.owner_viewer_id, rental_type: 0,
        })),
        succession_trained_chara_id_1: state.succession_trained_chara_id_1,
        succession_trained_chara_id_2: state.succession_trained_chara_id_2,
        proper_distance_short: state.proper_distance_short,
        proper_distance_mile: state.proper_distance_mile,
        proper_distance_middle: state.proper_distance_middle,
        proper_distance_long: state.proper_distance_long,
        proper_running_style_nige: state.proper_running_style_nige,
        proper_running_style_senko: state.proper_running_style_senko,
        proper_running_style_sashi: state.proper_running_style_sashi,
        proper_running_style_oikomi: state.proper_running_style_oikomi,
        proper_ground_turf: state.proper_ground_turf,
        proper_ground_dirt: state.proper_ground_dirt,
        turn: state.turn,
        skill_point: state.skill_point,
        short_cut_state: state.short_cut_state,
        state: state.state,
        playing_state: state.playing_state,
        scenario_id: state.scenario_id,
        route_id: state.route_id,
        start_time: state.start_time,
        evaluation_info_array: state.support_card_array.map(c => ({
            target_id: c.position, evaluation: state.friendship[c.position] ?? 0, is_outing: 0, story_step: 0, is_appear: 1, group_outing_info_array: [],
        })),
        training_level_info_array: [...NORMAL_TRAININGS, ...SUMMER_TRAININGS].map(id => ({ command_id: id, level: commandLevel(state, id) })),
        nickname_id_array: [],
        chara_effect_id_array: [],
        route_race_id_array: state._goals.map(g => g.id),
        guest_outing_info_array: [],
        skill_upgrade_info_array: [],
    }
}

function toHomeInfo(state: TrainingRunState) {
    const info = turnInfo(state.turn)
    const goalTurn = isGoalTurn(state)
    const trainings = trainingIdsForTurn(state.turn)
    const disabled = new Set<number>()
    if (goalTurn) {
        for (const id of [...trainings, ...OUTING_IDS, REST_COMMAND_ID, HOSPITAL_COMMAND_ID]) disabled.add(id)
    }
    if (!info.race_entry_type) disabled.add(RACE_COMMAND_ID)
    if (!info.rest_type) disabled.add(REST_COMMAND_ID)
    if (!info.health_room_type) disabled.add(HOSPITAL_COMMAND_ID)
    disabled.add(HOSPITAL_COMMAND_ID)   // no bad conditions are ever applied, so the infirmary has nothing to treat

    const trainingInfos = trainings.map(id => {
        const bonuses = aggregateSupportBonuses(state, id)
        return {
            command_type: CommandType.Training,
            command_id: id,
            is_enable: disabled.has(id) ? 0 : 1,
            training_partner_array: state.partners[id] ?? [],
            tips_event_partner_array: [],
            params_inc_dec_info_array: trainingParams(state, id, bonuses),
            failure_rate: computeFailureRate(commandLevel(state, id), state.vital, state.max_vital, bonuses.failureProtectionPct),
        }
    })
    const other = [
        ...OUTING_IDS.map(id => ({ command_type: CommandType.Outing, command_id: id })),
        { command_type: CommandType.RaceEntry, command_id: RACE_COMMAND_ID },
        { command_type: CommandType.Holiday, command_id: REST_COMMAND_ID },
        { command_type: CommandType.Hospital, command_id: HOSPITAL_COMMAND_ID },
    ].map(c => ({
        ...c,
        is_enable: disabled.has(c.command_id) ? 0 : 1,
        training_partner_array: [],
        tips_event_partner_array: [],
        params_inc_dec_info_array: [],
        failure_rate: 0,
    }))

    return {
        command_info_array: [...trainingInfos, ...other],
        race_entry_restriction: goalTurn ? 1 : 0,
        disable_command_id_array: [...disabled],
        available_continue_num: state.available_continue_num,
        available_free_continue_num: state.available_free_continue_num,
        free_continue_num: state.available_free_continue_num,
        free_continue_time: 0,
        shortened_race_state: 0,
    }
}

/** URA's scenario block (Gallop.SingleModeUraDataSet). URA has no extra per-command mechanic. */
function uraDataSet(state: TrainingRunState) {
    return {
        command_info_array: trainingIdsForTurn(state.turn).map(id => ({ command_type: CommandType.Training, command_id: id, versus_event_partner_id: 0 })),
        evaluation_info_array: [],
        versus_level: 0,
    }
}

function emptyReservedRaceDecks() {
    return Array.from({ length: 9 }, (_, i) => ({ deck_num: i, deck_name: '', race_array: [] }))
}

function emptyRewardSummary() {
    return {
        add_present_num: 0, add_item_list: [], add_card_list: [], add_card_bonus_info: null, add_support_card_list: [],
        add_support_card_num_array: [], add_chara_list: [], add_cloth_list: [], add_music_list: [], add_fcoin: 0,
        add_honor_list: [], add_piece_list: [], add_total_fan: 0, new_chara_profile_array: [], force_update_honor_id: 0,
    }
}

// ---------------------------------------------------------------------------
// Persistence & reference data
// ---------------------------------------------------------------------------

function persistTrainingState(state: TrainingRunState) {
    const db = getDatabase(Database.HONSE_DATA)
    db.prepare(`
        INSERT INTO training_runs (viewer_id, card_id, scenario_id, start_time, last_update_time, run_state)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(viewer_id) DO UPDATE SET
            card_id=excluded.card_id,
            scenario_id=excluded.scenario_id,
            last_update_time=excluded.last_update_time,
            run_state=excluded.run_state
    `).run(state.viewer_id, state.card_id, state.scenario_id, state.start_time, formatServerTimestamp(), JSON.stringify(state))
}

function loadTrainingState(viewerId: number): TrainingRunState | null {
    const db = getDatabase(Database.HONSE_DATA)
    const row = db.prepare('SELECT run_state FROM training_runs WHERE viewer_id = ?').get(viewerId) as { run_state: string } | undefined
    if (!row) return null
    try {
        const state = JSON.parse(row.run_state) as TrainingRunState
        // runs saved by the earlier engine lack the race/finish fields; treat them as gone
        if (!state._goals) return null
        // runs saved before route_id held the single_mode_route id
        state.route_id = ura().route_ids[String(state.chara_id)] ?? 0
        // runs started before the unique skill was seeded
        if (!state.skill_array.length) state.skill_array = startingSkills(getCardRarityData(state.card_id, state.rarity).skill_set)
        return state
    } catch {
        return null
    }
}

let umaRarityCache: any[] | null = null

function getCardRarityData(cardId: number, rarity: number) {
    if (!umaRarityCache) umaRarityCache = JSON.parse(readFileSync(path.join(process.cwd(), 'assets', 'umas_rarity_data.json'), 'utf-8'))
    const rows = umaRarityCache!.filter(e => e.card_id === cardId)
    const row = rows.find(e => e.rarity === rarity) ?? rows.sort((a, b) => b.rarity - a.rarity)[0]
    return row ?? {
        speed: 90, stamina: 90, pow: 90, guts: 90, wiz: 90,
        max_speed: 1200, max_stamina: 1200, max_pow: 1200, max_guts: 1200, max_wiz: 1200,
        proper_distance_short: 4, proper_distance_mile: 5, proper_distance_middle: 7, proper_distance_long: 5,
        proper_running_style_nige: 3, proper_running_style_senko: 7, proper_running_style_sashi: 6, proper_running_style_oikomi: 3,
        proper_ground_turf: 7, proper_ground_dirt: 1,
    }
}

function getUserCardInfo(viewerId: number, cardId: number) {
    const cards = getUserCards(viewerId)
    return (Array.isArray(cards) ? cards.find((c: any) => c.card_id === cardId) : undefined) || null
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}
