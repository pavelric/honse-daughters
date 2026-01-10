import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { UserTpInfo } from "../../data/types";
import { verifySession } from "../../data/honseData";
import { startTrainingRun } from "../../data/honseTraining";

interface StartTrainingRequest extends RequestCommon {
    current_money: number
    current_succession_rank_point: number,
    start_chara: StartChara,
    tp_info: UserTpInfo,
    use_tp: number,
}

interface StartChara {
    boost_story_event_id: number,
    card_id: number,
    friend_support_card_info: {
      support_card_id: number,
      viewer_id: number
    },
    is_play_training_challenge: boolean,
    rental_succession_trained_chara: {
      is_circle_member: boolean,
      is_event_rental: boolean,
      trained_chara_id: number,
      viewer_id: number
    },
    scenario_id: number,
    select_deck_id: number,
    selected_difficulty_info: {
      difficulty: number,
      difficulty_id: number,
      is_boost: number
    },
    succession_trained_chara_id_1: number,
    succession_trained_chara_id_2: number,
    support_card_ids: number[]
}



const routes = async (fastify: FastifyInstance) => {
    fastify.post("/start", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as StartTrainingRequest

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
            data: startTrainingRun(body),
            response_code: 1
        }

        reply.status(200).send(response)
    })

    fastify.post("/check_event", async (request: FastifyRequest, reply: FastifyReply) => {
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

    fastify.post("/exec_command", async (request: FastifyRequest, reply: FastifyReply) => {
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
