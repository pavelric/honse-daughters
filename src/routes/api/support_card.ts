import { FastifyInstance } from "fastify";
import { route } from "../route";
import { strengthenSupportCard, limitBreakSupportCard, limitBreakSupportCardWithItem, changeSupportCardLock } from "../../data/cardProgress";

// Support cards. Shapes: Gallop.SupportCard*Request / *Response, see docs/api-catalog.md#support_card.
const routes = async (fastify: FastifyInstance) => {
    route(fastify, "/strengthen", (body, viewerId) => strengthenSupportCard(viewerId, body.support_card_id, body.use_global_exp, body.use_money))
    route(fastify, "/limit_break", (body, viewerId) => limitBreakSupportCard(viewerId, body.support_card_id, body.material_support_card_num))
    route(fastify, "/limit_break_item", (body, viewerId) => limitBreakSupportCardWithItem(viewerId, body.support_card_id, body.limit_break_item_id, body.limit_break_count))
    route(fastify, "/change_lock", (body, viewerId) => changeSupportCardLock(viewerId, body.support_card_id, body.lock_flag))
    // Event skill previews come from story data that isn't extracted yet.
    route(fastify, "/get_support_card_event_skill", () => ({ event_skill_list: [] }))
}

export default routes;
