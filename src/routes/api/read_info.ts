import { FastifyInstance } from "fastify";
import { route } from "../route";
import { addReadInfo, getReadInfo, READ_INFO_KINDS } from "../../data/honseData";

// The client reports what it has seen (home stories, new episode notices, tutorial guides, home
// banners, ...) as add_<kind>_data_array, and replaces its local already-read lists with the
// <kind>_data_array returned here and by load/index. Anything not persisted pops up again.

const routes = async (fastify: FastifyInstance) => {
    route(fastify, "/index", (body, viewerId) => {
        for (const kind of READ_INFO_KINDS) {
            const added: { id: number }[] = body[`add_${kind}_data_array`] ?? []
            if (added.length) addReadInfo(viewerId, kind, added.map(d => d.id))
        }
        const read = getReadInfo(viewerId)
        return {
            ...Object.fromEntries(READ_INFO_KINDS.map(kind => [`${kind}_data_array`, read[kind]])),
            talk_gallery_data_array: [],
        }
    })
}

export default routes;
