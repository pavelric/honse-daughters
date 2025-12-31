import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { inspect } from "util";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { pack, unpack } from 'msgpackr';
import { verifySession } from "../../data/honseData";
import { getClientSerializedData, constructClientUserInfo } from "../../data/utils";
import { writeFileSync } from "fs";
import { join } from "path";


interface UserBody {
    viewer_id: number,
    name: string,
    sex: number,
}


const routes = async (fastify: FastifyInstance) => {
    fastify.post("/change_name", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as UserBody
        const name = body.name.trim() // basic validation
        
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

        var userinfo = constructClientUserInfo(viewerId).full // implement logic to fetch from player the userInfo object, updated with the info

        
        var response = {
            "data": {
                user_info: userinfo,
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

        console.log("Response:", inspect(response, { depth: null, colors: true }))

        reply.status(200).send(response)
    })


    fastify.post("/change_sex", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as UserBody
        const sex = body.sex 
        
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

        var userinfo = constructClientUserInfo(viewerId).full // implement logic to fetch from player the userInfo object, updated with the info of the request

        
        var response = {
            "data": {
                user_info: userinfo,
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

        console.log("Response:", inspect(response, { depth: null, colors: true }))

        reply.status(200).send(response)
    }

)}


export default routes;
