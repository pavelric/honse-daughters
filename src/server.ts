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
import toolApiPlugin from "./routes/api/tool";


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
fastify.register(toolApiPlugin, { prefix: `${apiPrefix}/tool` })



// static CDN
const cdnDir = process.env.CDN_DIR || ".cdn"
const androidCdnDir = path.join(cdnDir, "en-android-meta");

fastify.register(fastifyStatic, {
    root: path.isAbsolute(cdnDir) ? androidCdnDir : path.join(__dirname, "..", androidCdnDir),
    prefix: "/assets/dl/vertical", // mimicking EN for now
    decorateReply: false
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