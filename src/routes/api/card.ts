import { FastifyInstance } from "fastify";
import { route } from "../route";
import { RELEASED_CARD_ARRAY } from "../../data/defaults";
import { strengthenCardTalent, upgradeCardSkill, upgradeCardRarity, unlockCard } from "../../data/cardProgress";

// Trainee (uma) cards. Shapes: Gallop.Card*Request / *Response, see docs/api-catalog.md#card.
const routes = async (fastify: FastifyInstance) => {
    route(fastify, "/get_release_card_array", () => ({ release_card_array: RELEASED_CARD_ARRAY }))
    route(fastify, "/talent_strengthen", (body, viewerId) => strengthenCardTalent(viewerId, body.card_id, body.new_talent_level))
    route(fastify, "/skill_upgrade", (body, viewerId) => upgradeCardSkill(viewerId, body.card_id, body.skill_id, body.new_skill_level))
    route(fastify, "/rarity_upgrade", (body, viewerId) => upgradeCardRarity(viewerId, body.card_id, body.new_rarity))
    route(fastify, "/unlock", (body, viewerId) => unlockCard(viewerId, body.card_id))
    // Event skill previews come from story data that isn't extracted yet.
    route(fastify, "/get_card_event_skill", () => ({ event_skill_list: [] }))
}

export default routes;
