import { FastifyInstance } from "fastify";
import { route } from "../route";
import { changeDeckParty, changeDeckName } from "../../data/cardProgress";

// Support card decks. Shapes: Gallop.SupportCardDeck*Request / *Response, see docs/api-catalog.md#support_card_deck.
const routes = async (fastify: FastifyInstance) => {
    route(fastify, "/change_party", (body, viewerId) => changeDeckParty(viewerId, body.support_card_deck_array))
    route(fastify, "/change_name", (body, viewerId) => changeDeckName(viewerId, body.deck_id, body.name))
}

export default routes;
