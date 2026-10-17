import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { verifySession, getUserTrainedCharas } from "../../data/honseData";
import { toClientTrainedChara } from "../../data/utils";
import { route } from "../route";

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

    // Inspiration tab of a horse's details: who used it as a parent, and when.
    // The client's field really is spelled "hisotry_type".
    route(fastify, "/get_succession_history_array", (body) => {
        const horse = getUserTrainedCharas(body.target_viewer_id)
            .find((tc: any) => tc.trained_chara_id === body.target_trained_chara_id)
        const history: any[] = horse ? JSON.parse(horse.succession_history_array || '[]') : []
        return {
            succession_history_array: history.map((h, i) => ({
                id: h.id ?? i + 1,
                viewer_id: h.viewer_id ?? body.target_viewer_id,
                trained_chara_id: h.trained_chara_id ?? body.target_trained_chara_id,
                hisotry_type: h.hisotry_type ?? h.history_type ?? 1,
                succession_card_id: h.succession_card_id ?? 0,
                date: h.date ?? 0,
                user_name: h.user_name ?? "",
                circle_name: h.circle_name ?? "",
            })),
        }
    })
}

export default routes;
