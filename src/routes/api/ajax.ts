import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const routes = async (fastify: FastifyInstance) => {
    fastify.options("/info_index", async (request: FastifyRequest, reply: FastifyReply) => {
        reply
            .header("Access-Control-Allow-Origin", "*")
            .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            .header("Access-Control-Allow-Headers", "content-type, x-requested-with, sid, viewer_id, udid, request_key")
            .status(200).send();
    });

    fastify.post("/info_index", async (request: FastifyRequest, reply: FastifyReply) => {
        reply.status(200).send({
            data_headers: {
                result_code: 1
            },
            data: {}
        });
    });
}

export default routes;
