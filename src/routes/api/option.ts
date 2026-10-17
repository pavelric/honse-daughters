import { FastifyInstance } from "fastify";
import { route } from "../route";
import { getUserOptions, setUserOptions } from "../../data/honseData";

// Settings the client keeps server-side (Gallop.GameDefine.OptionTypeSavedInServer:
// 1 TazunaTutorialSkip, 2 EnabledScenarioBreedersDressChange, 3 SaveLastRunningStyle).
// They come back to the client in load/index's option_info_array.

const routes = async (fastify: FastifyInstance) => {
    route(fastify, "/change_option", (body, viewerId) => {
        setUserOptions(viewerId, body.option_info_array ?? [])
        return { option_info_array: getUserOptions(viewerId) }
    })
}

export default routes;
