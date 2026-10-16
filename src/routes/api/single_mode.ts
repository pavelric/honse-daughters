import { FastifyInstance } from "fastify";
import { route } from "../route";
import {
    TrainingStartRequest, ExecCommandRequest,
    startTrainingRun, loadTrainingRun, execTrainingCommand, checkTrainingEvent,
    raceEntry, raceStart, raceEnd, raceContinue, raceOut, raceAnalyze,
    gainSkills, changeRunningStyle, changeShortCut,
    factorSelect, factorLottery, finishTrainingRun,
} from "../../data/honseTraining";

// URA career (scenario 1). Request fields and response `data` shapes follow the client's
// Gallop.SingleMode*Request / *Response classes; see docs/api-catalog.md#single_mode.

const routes = async (fastify: FastifyInstance) => {
    route(fastify, "/start", (body) => startTrainingRun(body as TrainingStartRequest))
    route(fastify, "/load", (_, viewerId) => loadTrainingRun(viewerId))
    route(fastify, "/exec_command", (body) => execTrainingCommand(body as ExecCommandRequest))
    route(fastify, "/check_event", (_, viewerId) => checkTrainingEvent(viewerId))

    route(fastify, "/race_entry", (body, viewerId) => raceEntry(viewerId, body.program_id))
    route(fastify, "/race_start", (_, viewerId) => raceStart(viewerId))
    route(fastify, "/race_end", (_, viewerId) => raceEnd(viewerId))
    route(fastify, "/continue", (body, viewerId) => raceContinue(viewerId, body.continue_type))
    route(fastify, "/race_out", (_, viewerId) => raceOut(viewerId))
    route(fastify, "/race_analyze", (body, viewerId) => raceAnalyze(viewerId, body.program_id))

    route(fastify, "/gain_skills", (body, viewerId) => gainSkills(viewerId, body.gain_skill_info_array))
    route(fastify, "/change_running_style", (body, viewerId) => changeRunningStyle(viewerId, body.running_style))
    route(fastify, "/change_short_cut", (body, viewerId) => changeShortCut(viewerId, body.short_cut_state))
    // Story events aren't implemented, so there is never a choice whose reward to preview.
    route(fastify, "/get_choice_reward", () => ({ choice_reward_array: [] }))

    route(fastify, "/factor_select", (body, viewerId) => factorSelect(viewerId, body.skill_id_array))
    route(fastify, "/factor_lottery", (body, viewerId) => factorLottery(viewerId, body.tp_info))
    route(fastify, "/finish", (body, viewerId) => finishTrainingRun(viewerId, !!body.is_force_delete, body.factor_lottery_id))
}

export default routes;
