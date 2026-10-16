import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { verifySession, getUserTrainedCharas } from "../../data/honseData";
import { toClientTrainedChara } from "../../data/utils";

const routes = async (fastify: FastifyInstance) => {
    // Gallop.TrainedCharaLoadRequest: the player's finished career horses (veteran list,
    // parent selection before a career).
    fastify.post("/load", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as RequestCommon

        reply.header("content-type", "application/x-msgpack; charset=utf-8")

        let viewerId = body.viewer_id
        if (!viewerId) return reply.status(400).send({
            "error": "Bad Request",
            "message": "Invalid request body"
        })

        const session = verifySession(viewerId.toString())
        if (!session) return reply.status(400).send({
            "error": "Bad Request",
            "message": "Invalid viewer_id"
        })

        var response = {
            "data": {
                trained_chara_array: getUserTrainedCharas(viewerId).map((tc: any) => toClientTrainedChara(tc, viewerId)),
                trained_chara_favorite_array: [],
                room_match_entry_chara_id_array: []
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId,
                notifications: {
                    unread_information_exists: 1,
                }
            }),
            response_code: 1
        }

        reply.status(200).send(response)
    })
}

export default routes;
