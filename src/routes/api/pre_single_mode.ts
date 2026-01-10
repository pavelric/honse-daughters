import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { verifySession } from "../../data/honseData";
import { buildFriendSupportCardData } from "../../data/utils";
import { inspect } from "util";


const routes = async (fastify: FastifyInstance) => {
    fastify.post("/index", async (request: FastifyRequest, reply: FastifyReply) => {
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

        
        const friendData = buildFriendSupportCardData(viewerId, 10)
        var response = {
            "data": {
                event_succession_trained_chara_data: {
                    succession_trained_chara_array: [],
                    summary_user_info_array: []
                },
                friend_support_card_data: {
                    summary_user_info_array: friendData.summary_user_info_array,
                    support_card_data_array: friendData.support_card_data_array
                },
                race_add_reward_info: [],
                succession_trained_chara_data: {
                succession_trained_chara_array: [],
                    summary_user_info_array: []
                },
                support_card_ranking_state: 0
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

        console.log("Response: ", inspect(response, { depth: null, colors: true }))

        reply.status(200).send(response)
    })

    fastify.post("/friend_support_card_reload", async (request: FastifyRequest, reply: FastifyReply) => {
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
