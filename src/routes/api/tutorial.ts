import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { inspect } from "util";
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { pack, unpack } from 'msgpackr';
import { verifySession, updateTutorialStep, getUserTrainedCharas, updatePlayerSingleModeFinish } from "../../data/honseData";
import { getClientSerializedData } from "../../data/utils";
import { writeFileSync } from "fs";
import { join } from "path";


interface TutorialBody {
    viewer_id: number,
    step: number,
}


const routes = async (fastify: FastifyInstance) => {
    fastify.post("/update_step", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as TutorialBody

        var currentStep = body.step
        

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

        updateTutorialStep(viewerId, currentStep);

        var response = {
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId
            }),
            response_code: 1
        }

        console.log("Response:", inspect(response, { depth: null, colors: true })) // simple debug, but these response have nothing.

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        reply.status(200).send(response)
    })


    fastify.post("/single_mode_finish", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as RequestCommon
        

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

        const data = updatePlayerSingleModeFinish(viewerId);

        var response = {
            "data": data,
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId
            }),
            response_code: 1
        }

        console.log("Response:", inspect(response, { depth: null, colors: true })) // simple debug, but these response have nothing.

        /*const d = new Date()
        const ts = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`
        const filename = `tutorialsinglemodefinish_response_${ts}.json`
        const filepath = join(process.cwd(), filename)
        writeFileSync(filepath, JSON.stringify(response, null, 2), 'utf-8')*/

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        reply.status(200).send(response)
    })

    fastify.post("/team_edit", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as RequestCommon
        

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
                after_rank: 1,
                before_rank: 1,
                reward_info_array: []
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId
            }),
            response_code: 1
        }

        console.log("Response:", inspect(response, { depth: null, colors: true })) // simple debug, but these response have nothing.

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        reply.status(200).send(response)
    })

    fastify.post("/skip", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as RequestCommon
        

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

        updateTutorialStep(viewerId, 1000);

        var response = {
            "data": {
                step: 1000,
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId
            }),
            response_code: 1
        }

        console.log("Response:", inspect(response, { depth: null, colors: true })) // simple debug, but these response have nothing.

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        reply.status(200).send(response)
    })


}


export default routes;
