import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { inspect } from "util";
import { generateDataHeaders } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { pack, unpack } from 'msgpackr';
import { verifySession } from "../../data/honseData";
import { getClientSerializedData } from "../../data/utils";
import { claimLoginBonuses } from "../../data/loginBonus";
import { writeFileSync } from "fs";
import { join } from "path";



interface IndexBody {
    adid: string,
    graphics_device_name: string,
    device_id: number,
    keychain: number,
    viewer_id: number,
    platform_os_version: string
}



const routes = async (fastify: FastifyInstance) => {
    fastify.post("/index", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as IndexBody
        
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

        // retrieve player data
        const playerClientData = getClientSerializedData(viewerId)
        if (!playerClientData) return reply.status(500).send({
            "error": "Internal Server Error",
            "message": "Failed to retrieve player data"
        })
        // Claimed here rather than in getClientSerializedData: it grants presents, once per game day.
        const loginBonusList = 'login_bonus_list' in playerClientData ? claimLoginBonuses(viewerId) : []
        if ('login_bonus_list' in playerClientData) playerClientData.login_bonus_list = loginBonusList
        var response = {
            "data": playerClientData,
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId,
                notifications: {
                    add_present_num: loginBonusList.length,
                    room_match_race_result_num: 0,
                    unread_information_exists: 1,
                }
            }),
            response_code: 1
        }

        console.log("Response:", inspect(response, { depth: null, colors: true }))
        
        /*const d = new Date()
        const ts = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`
        const filename = `loadsession_response_${ts}.json`
        const filepath = join(process.cwd(), filename)
        writeFileSync(filepath, JSON.stringify(response, null, 2), 'utf-8')*/

        reply.status(200).send(response)
    }




)}


export default routes;
