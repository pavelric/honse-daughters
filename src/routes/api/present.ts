import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { verifySession, getUserPresents, getUserPresentCounts, claimUserPresents, countUserPresents } from "../../data/honseData";

interface PresentIndexBody {
    category_filter_type: number[],
    is_asc: boolean,
    limit: number,
    offset: number,
    time_filter_type: number,
    viewer_id: number,
}

interface PresentReceiveBody {
    viewer_id: number;
    present_id: number;
}

interface PresentReceiveAllBody {
    category_filter_type: number[],
    current_rest_present_num: number,
    is_asc: boolean,
    time_filter_type: number,
    viewer_id: number,
}

const routes = async (fastify: FastifyInstance) => {
    fastify.post("/index", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as PresentIndexBody

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

        const limit = body.limit || 100;
        const offset = body.offset || 0;
        
        const presents = getUserPresents(viewerId, limit, offset);
        const counts = getUserPresentCounts(viewerId);
        
        var response = {
            "data": {
                "no_receive_present_num": {
                    "no_time_limit_present_num": counts.no_time_limit,
                    "time_limit_present_num": counts.time_limit
                },
                "present_array": presents
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

    fastify.post("/receive", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as PresentReceiveBody

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

        const { info, count } = claimUserPresents(viewerId, [body.present_id]);
        const restCount = countUserPresents(viewerId);
        
        var response = {
            "data": {
                "no_receive_item_flg": false,
                "no_receive_support_card_count": 0,
                "receive_present_num": count,
                "rest_present_num": restCount,
                "reward_summary_info": info
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

    fastify.post("/receive_all", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as PresentReceiveAllBody

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

        const { info, count } = claimUserPresents(viewerId); // Claim all
        const restCount = countUserPresents(viewerId);
        
        var response = {
            "data": {
                "no_receive_item_flg": false,
                "no_receive_support_card_count": 0,
                "receive_present_num": count,
                "rest_present_num": restCount,
                "reward_summary_info": info
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
