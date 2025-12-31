import Fastify, { FastifyRequest } from 'fastify';
import { ContentTypeParserDoneFunction } from "fastify/types/content-type-parser";
import fastifyStatic from "@fastify/static";
import { pack, unpack } from 'msgpackr';
import path from "path";
import { decryptRequest, encryptResponse, UmaHeader } from './crypto';

declare module 'fastify' {
    interface FastifyRequest {
        umaHeader?: UmaHeader;
    }
}

// routes
import ajaxApiPlugin from "./routes/api/ajax";
import cardApiPlugin from "./routes/api/card";
import gachaApiPlugin from "./routes/api/gacha";
import indexApiPlugin from "./routes/api/index";
import jukeboxApiPlugin from "./routes/api/jukebox";
import missionApiPlugin from "./routes/api/mission";
import noteApiPlugin from "./routes/api/note";
import paymentApiPlugin from "./routes/api/payment";
import preSingleModeApiPlugin from "./routes/api/pre_single_mode";
import presentApiPlugin from "./routes/api/present";
import readInfoApiPlugin from "./routes/api/read_info";
import singleModeApiPlugin from "./routes/api/single_mode";
import supportCardDeckApiPlugin from "./routes/api/support_card_deck";
import supportCardApiPlugin from "./routes/api/support_card";
import teamStadiumApiPlugin from "./routes/api/team_stadium";
import toolApiPlugin from "./routes/api/tool";
import tutorialApiPlugin from "./routes/api/tutorial";
import userApiPlugin from "./routes/api/user";
import webDbPlugin from "./routes/web/db";
import webApiDbPlugin from "./routes/web_api/db";



const fastify = Fastify({
  logger: true // debugging
});

// serializers
fastify.addHook('onSend', (request, reply, payload, done) => {
    try {
        switch (reply.getHeader('content-type')) {
            case "application/x-msgpack; charset=utf-8": {
                if (request.umaHeader?.udid && request.umaHeader?.requestKey) {
                    const encrypted = encryptResponse(payload, request.umaHeader.udid, request.umaHeader.requestKey);
                    done(null, encrypted);
                } else {
                    done(null, pack(payload).toString('base64'))
                }
                break;
            }
            default:
                done(null, payload)
        }
    } catch (error) {
        done(null, payload)
    }

})

// content-type parsers
function jsonParser(_: FastifyRequest, body: string, done: ContentTypeParserDoneFunction) {
    try {
        var json = JSON.parse(body)
        done(null, json)
    } catch (err) {
        done(null, undefined)
    }
}

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, jsonParser)

fastify.addContentTypeParser('application/x-msgpack', { parseAs: 'string' }, (req, body, done) => {
  try {
    const decrypted = decryptRequest(body as string);
    req.umaHeader = decrypted.header;
    done(null, decrypted.content);
  } catch (err) {
    done(err as Error, undefined);
  }
});

// APIs
const apiPrefix = "/umamusume"
fastify.register(ajaxApiPlugin, { prefix: `${apiPrefix}/ajax` })
fastify.register(cardApiPlugin, { prefix: `${apiPrefix}/card` })
fastify.register(gachaApiPlugin, { prefix: `${apiPrefix}/gacha` })
fastify.register(indexApiPlugin, { prefix: `${apiPrefix}/load` })
fastify.register(jukeboxApiPlugin, { prefix: `${apiPrefix}/jukebox` })
fastify.register(missionApiPlugin, { prefix: `${apiPrefix}/mission` })
fastify.register(noteApiPlugin, { prefix: `${apiPrefix}/note` })
fastify.register(paymentApiPlugin, { prefix: `${apiPrefix}/payment` })
fastify.register(preSingleModeApiPlugin, { prefix: `${apiPrefix}/pre_single_mode` })
fastify.register(presentApiPlugin, { prefix: `${apiPrefix}/present` })
fastify.register(readInfoApiPlugin, { prefix: `${apiPrefix}/read_info` })
fastify.register(singleModeApiPlugin, { prefix: `${apiPrefix}/single_mode` })
fastify.register(supportCardDeckApiPlugin, { prefix: `${apiPrefix}/support_card_deck` })
fastify.register(supportCardApiPlugin, { prefix: `${apiPrefix}/support_card` })
fastify.register(teamStadiumApiPlugin, { prefix: `${apiPrefix}/team_stadium` })
fastify.register(toolApiPlugin, { prefix: `${apiPrefix}/tool` })
fastify.register(tutorialApiPlugin, { prefix: `${apiPrefix}/tutorial` })
fastify.register(userApiPlugin, { prefix: `${apiPrefix}/user` })
fastify.register(webApiDbPlugin, { prefix: "/web_api" })
fastify.register(webDbPlugin, { prefix: "/web" })



// static CDN
const cdnDir = process.env.CDN_DIR || ".cdn"
const androidCdnDir = path.join(cdnDir, "en-android-meta");

// Log static file requests for debugging
fastify.addHook('onRequest', (req, reply, done) => {
    if (req.url.startsWith('/assets/dl/vertical')) {
        console.log(`[Static] Request: ${req.url}`);
        console.log(`[Static] Range: ${req.headers.range}`);
    }
    done();
});

fastify.register(fastifyStatic, {
    root: path.isAbsolute(cdnDir) ? androidCdnDir : path.join(__dirname, "..", androidCdnDir),
    prefix: "/assets/dl/vertical",
    decorateReply: false,
    cacheControl: true,
    etag: true,
    lastModified: true,
    maxAge: 604800,
    acceptRanges: true,
    setHeaders: (res, filePath, stat) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'range, content-type, origin, accept');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Expose-Headers', 'content-length, content-range, accept-ranges');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Connection', 'keep-alive');
    }
})

fastify.options('/assets/dl/vertical/*', async (req, reply) => {
    reply
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Headers', 'range, content-type, origin, accept')
        .header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
        .send();
})

// listener
const listenHost = process.env.LISTEN_HOST ?? "localhost"

const envListenPort = process.env.LISTEN_PORT === undefined ? 8000 : Number.parseInt(process.env.LISTEN_PORT)
const listenPort = isNaN(envListenPort) ? 8000 : envListenPort
fastify.listen({ port: listenPort, host: listenHost }, (err, address) => {
    if (err) {
        console.error(err)
        fastify.log.error(err)
        process.exit(1)
    }
    console.log(`HonseDaughters is listening on http://${listenHost}:${listenPort}`)
})
