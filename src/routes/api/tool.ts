import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { RESOURCE_VERSION, resourceServerFor } from '../../config';
import { generateDataHeaders, RequestCommon } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { pack, unpack } from 'msgpackr';
import { createAccount, createSession, ensurePlayerExists, getAccountByUdid, getAccountByViewerId, verifySession } from "../../data/honseData";


interface CountryInfo {
    country: string,
    country_type: number,
}


const routes = async (fastify: FastifyInstance) => {
    fastify.post("/get_pre_download_resource_version", (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        console.log("Request Body:", body)

        //console.log(`${request.protocol}://${request.hostname}/dl/vertical/resources`)

        var response = {
            data: {
                "resource_version": RESOURCE_VERSION
            },
            data_headers: generateDataHeaders({
                //sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                server_list: {
                    "resource_server": resourceServerFor(request.host),
                    "resource_server_cf": resourceServerFor(request.host),
                    "resource_server_ingame": resourceServerFor(request.host),
                    "resource_server_login": resourceServerFor(request.host)
                }
            }),
            response_code: 1
        }
        console.log("Response: ", response)
        
        reply.status(200).send(response)
    })


    fastify.post("/pre_signup", (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        console.log("Request Body:", body)

        var response = {
            "data": {
                "attest": false,
                "nonce": "",
                "country_list": [ //CountryInfo[]
                    { country: "Europe", country_type: 1 },
                    { country: "America", country_type: 1 },
                    { country: "Asia", country_type: 1 }
                ]
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                server_list: {
                    "resource_server": resourceServerFor(request.host),
                    "resource_server_cf": resourceServerFor(request.host),
                    "resource_server_ingame": resourceServerFor(request.host),
                    "resource_server_login": resourceServerFor(request.host)
                }
            }),
            response_code: 1
        }
        
        console.log("Response: ", response)

        reply.status(200).send(response)
    })

    fastify.post("/signup", (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body

        const udid = request.umaHeader?.udid
        if (!udid) return reply.status(400).send({ 
            "error": "Bad Request",
            "message": "UDID is required"
        })
        
        let account = getAccountByUdid(udid);
        if (!account) {
            account = createAccount(udid);
        } else {
            ensurePlayerExists(account);
        }
        
        const session = createSession(account);

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        console.log("Request Body:", body)

        var response = {
            "data": {
                "auth_key": session.auth_key,
                "viewer_id": account.viewer_id
            },
            "data_headers": generateDataHeaders({
                viewer_id: account.viewer_id,
                server_list: {
                    "resource_server": resourceServerFor(request.host),
                    "resource_server_cf": resourceServerFor(request.host),
                    "resource_server_ingame": resourceServerFor(request.host),
                    "resource_server_login": resourceServerFor(request.host)
                }
            }),
            response_code: 1
        }
        
        console.log("Response: ", response)

        reply.status(200).send(response)
    })

    fastify.post("/start_session", (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as RequestCommon

        // Use viewer_id instead of udid
        const viewerId = body.viewer_id
        if (!viewerId) return reply.status(400).send({ 
            "error": "Bad Request",
            "message": "viewer_id is required"
        })

        // Check if account exists
        const account = getAccountByViewerId(viewerId.toString());
        if (!account) {
             return reply.status(404).send({ 
                "error": "Not Found",
                "message": "Account not found"
            })
        }
        
        // Verify existing session or create new one
        let session = verifySession(viewerId.toString());
        if (!session) {
            session = createSession(account);
        }

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        console.log("Request Body:", body)

        var response = {
            "data": {
                "attest": false,
                "is_tutorial": true,
                "nonce": "",
                "resource_version": RESOURCE_VERSION,
                "terms_updated": false,
                "auth_key": session.auth_key // oops?
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                viewer_id: viewerId,
                server_list: {
                    "resource_server": resourceServerFor(request.host),
                    "resource_server_cf": resourceServerFor(request.host),
                    "resource_server_ingame": resourceServerFor(request.host),
                    "resource_server_login": resourceServerFor(request.host)
                }
            }),
            response_code: 1
        }
        
        console.log("Response: ", response)

        reply.status(200).send(response)
    })

}


export default routes;
