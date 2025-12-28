import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateViewerId } from "../../utils";
import { generateDataHeaders } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { pack, unpack } from 'msgpackr';


interface PreSignupBody {
    nonce: string,
    attest: boolean
    country_list: CountryInfo[]
    enable_steam_account: boolean //false
}

interface CountryInfo {
    country: string,
    country_type: number,
}

interface SignupBody {
    auth_key: string,
}


const routes = async (fastify: FastifyInstance) => {
    fastify.post("/get_pre_download_resource_version", (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        console.log("Request Body:", body)

        //console.log(`${request.protocol}://${request.hostname}/dl/vertical/resources`)

        var response = {
            data: {
                "resource_version": "10003850" // hardcode something different from the game's current resource version to test the resource download via the server's CDN
            },
            data_headers: generateDataHeaders({
                //sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                server_list: {
                    "resource_server": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_cf": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_ingame": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_login": `assets-umamusume-en.akamaized.net/dl/vertical/`
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
                "country_list": [
                    { country: "France", country_type: 1 },
                    { country: "United Kingdom", country_type: 1 },
                    { country: "United States", country_type: 1 }
                ]
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                server_list: {
                    "resource_server": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_cf": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_ingame": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_login": `assets-umamusume-en.akamaized.net/dl/vertical/`
                }
            }),
            response_code: 1
        }
        
        console.log("Response: ", response)

        reply.status(200).send(response)
    })

    fastify.post("/signup", (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body

        reply.header("content-type", "application/x-msgpack; charset=utf-8")
        console.log("Request Body:", body)

        var response = {
            "data": {
                "auth_key": "az21254da545da81d5ad5484da515ad8a11e8d"
            },
            "data_headers": generateDataHeaders({
                sid: request.umaHeader?.sid ? computeResponseSid(request.umaHeader.sid) : undefined,
                server_list: {
                    "resource_server": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_cf": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_ingame": `assets-umamusume-en.akamaized.net/dl/vertical/`,
                    "resource_server_login": `assets-umamusume-en.akamaized.net/dl/vertical/`
                }
            }),
            response_code: 1
        }
        
        console.log("Response: ", response)

        reply.status(200).send(response)
    })




}


export default routes;