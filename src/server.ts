import Fastify, { FastifyRequest } from 'fastify';
import { ContentTypeParserDoneFunction } from "fastify/types/content-type-parser";
import fastifyStatic from "@fastify/static";
import { pack, unpack } from 'msgpackr';
import path from "path";



const fastify = Fastify({
  logger: true // debugging
});

// serializers
fastify.addHook('onSend', (_, reply, payload, done) => {
    try {
        switch (reply.getHeader('content-type')) {
            case "application/x-msgpack": {
                done(null, pack(payload).toString('base64'))
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
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, jsonParser)

fastify.addContentTypeParser('application/x-msgpack', { parseAs: 'buffer' }, (req, body, done) => {
  try {
    const decoded = unpack(body as Buffer);
    done(null, decoded);
  } catch (err) {
    done(err as Error, undefined);
  }
});
}

// APIs
const apiPrefix = "/umamusume"
/*



*/