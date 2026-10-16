import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon } from "../utils";
import { computeResponseSid } from "../crypto";
import { verifySession } from "../data/honseData";

export type ApiBody = RequestCommon & Record<string, any>

/**
 * Registers a game API endpoint: checks the session, runs `handler` and wraps its result in the
 * standard { data, data_headers, response_code } envelope. A handler returning null rejects the
 * request (nothing to act on, or the player can't afford it).
 */
export function route(fastify: FastifyInstance, url: string, handler: (body: ApiBody, viewerId: number) => object | null) {
    fastify.post(url, async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as ApiBody

        reply.header("content-type", "application/x-msgpack; charset=utf-8")

        const viewerId = body?.viewer_id
        if (!viewerId) return reply.status(400).send({
            "error": "Bad Request",
            "message": "Invalid request body"
        })

        const session = verifySession(viewerId.toString())
        if (!session) return reply.status(400).send({
            "error": "Bad Request",
            "message": "Invalid viewer_id"
        })

        const data = handler(body, viewerId)
        if (!data) return reply.status(400).send({
            "error": "Bad Request",
            "message": "Request can't be applied to this account"
        })

        reply.status(200).send({
            data,
            data_headers: generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId,
                notifications: {
                    unread_information_exists: 1,
                }
            }),
            response_code: 1
        })
    })
}
