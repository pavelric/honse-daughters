import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon, formatTimestamp, getDateFromServerTime, getServerTime } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { verifySession } from "../../data/honseData";
import * as fs from 'fs';
import * as path from 'path';

// Load jukebox data
const jukeboxDataPath = path.join(__dirname, '../../../assets/jukebox_request_data.json');
let jukeboxData: any[] = [];

try {
    if (fs.existsSync(jukeboxDataPath)) {
        jukeboxData = JSON.parse(fs.readFileSync(jukeboxDataPath, 'utf-8'));
    } else {
        console.warn(`Jukebox data not found at ${jukeboxDataPath}`);
    }
} catch (e) {
    console.error("Failed to load jukebox data", e);
}

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

        // Pick random music
        let randomMusic = null;
        if (jukeboxData.length > 0) {
            const randomIndex = Math.floor(Math.random() * jukeboxData.length);
            randomMusic = jukeboxData[randomIndex];
        }
        
        var response = {
            "data": {
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


    fastify.post("/draw_random_request", async (request: FastifyRequest, reply: FastifyReply) => {
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

        // Pick random music
        let randomMusic = null;
        if (jukeboxData.length > 0) {
            const randomIndex = Math.floor(Math.random() * jukeboxData.length);
            randomMusic = jukeboxData[randomIndex];
        }

        // Calculate next request time (current server time + 10 minutes)
        const currentServerTime = getServerTime();
        const nextRequestTime = getDateFromServerTime(currentServerTime + 600); // 10 minutes = 600 seconds
        const nextRequestTimeString = formatTimestamp(nextRequestTime);

        // Random chara_id 1001-1050
        const randomCharaId = Math.floor(Math.random() * (1050 - 1001 + 1)) + 1001;
        
        var response = {
            "data": {
                add_music_array: [],
                next_random_request_time: nextRequestTimeString,
                request_history: {
                    music_id: randomMusic ? randomMusic.music_id : 0,
                    request_id: 1,
                    request_type: randomMusic ? randomMusic.request_type : 0,
                    request_value: randomMusic ? randomMusic.request_value : 0,
                    requester_id: randomCharaId,
                    requester_request_id: null
                }
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