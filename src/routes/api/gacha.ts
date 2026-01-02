import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { generateDataHeaders, RequestCommon, formatServerTimestamp } from "../../utils";
import { computeResponseSid } from "../../crypto";
import { verifySession, getPlayer, updateUserCoin, checkUserCard, addUserCard, addOrUpdateUserChara, addOrUpdateUserCharaProfile, addOrUpdateUserPiece, checkUserSupportCard, addOrUpdateUserSupportCard, getUserPieces } from "../../data/honseData";
import * as fs from 'fs';
import * as path from 'path';
import { inspect } from "util";

interface GachaInfo {
    id: number,
    is_campaign_draw_enable_multi: number,
    is_campaign_draw_enable_single: number,
    is_daily_draw_end: number,
    prize_selected_card_id: number,
    prize_selected_card_type: number,
    remain_stock_num_multi: number,
    remain_stock_num_single: number,
    web_text: string
}

interface GachaExecBody {
    current_num: number, // carats (free - I think, could be total)
    current_stock_num: number,  // carats (paid I think)
    draw_num: number,
    draw_type: number,
    gacha_id: number,
    item_id: number, // not sure if standard, can't remember seeing this param before
    viewer_id: number,
}

const gachaDataPath = path.join(process.cwd(), 'assets', 'gacha_data.json');
const umasDataPath = path.join(process.cwd(), 'assets', 'umas_data.json');
const supportCardsDataPath = path.join(process.cwd(), 'assets', 'support_cards_data.json');

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

        let gacha_info_list: GachaInfo[] = [];
        try {
            const gachaDataRaw = fs.readFileSync(gachaDataPath, 'utf-8');
            const gachaData = JSON.parse(gachaDataRaw);
            const currentTime = Math.floor(Date.now() / 1000);
            
            gacha_info_list = gachaData
                //.filter((gacha: any) => gacha.start_date <= currentTime && gacha.end_date >= currentTime)
                .map((gacha: any) => ({
                    id: gacha.id,
                    is_campaign_draw_enable_multi: 1,
                    is_campaign_draw_enable_single: 0,
                    is_daily_draw_end: 0,
                    prize_selected_card_id: 0,
                    prize_selected_card_type: 0,
                    remain_stock_num_multi: 0,
                    remain_stock_num_single: 0,
                    web_text: ""
                }));
        } catch (err) {
            console.error("Error reading gacha data:", err);
        }
        
        var response = {
            "data": {
                gacha_info_list,
                limit_item_info: {
                    expired_limit_item_list: [],
                    limit_item_list: [],
                    reward_summary_info: null
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

    fastify.post("/exec", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as GachaExecBody

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

        // Load Data
        let gachaData: any[] = [];
        let umasData: any = {};
        let supportCardsData: any[] = [];
        try {
            gachaData = JSON.parse(fs.readFileSync(gachaDataPath, 'utf-8'));
            umasData = JSON.parse(fs.readFileSync(umasDataPath, 'utf-8'));
            supportCardsData = JSON.parse(fs.readFileSync(supportCardsDataPath, 'utf-8'));
        } catch (err) {
            console.error("Error reading assets:", err);
            return reply.status(500).send({ error: "Internal Server Error", message: "Failed to load assets" });
        }

        const gachaInfo = gachaData.find((g: any) => g.id === body.gacha_id);
        if (!gachaInfo) {
            console.error(`Gacha ID ${body.gacha_id} not found`);
             // Fallback or error? defaulting to card_type 1 if not found for testing
        }
        const cardType = gachaInfo ? gachaInfo.card_type : 1;

        // Payment Logic
        const cost = 150 * body.draw_num;
        const player = getPlayer(viewerId);
        if (!player) return reply.status(400).send({ error: "Player not found" });

        let fcoin = player.fcoin;
        let coin = player.coin;

        if (fcoin >= cost) {
            fcoin -= cost;
        } else {
            const remainder = cost - fcoin;
            fcoin = 0;
            if (coin >= remainder) {
                coin -= remainder;
            } else {
                return reply.status(400).send({
                    "error": "Bad Request",
                    "message": "Not enough currency"
                });
            }
        }
        updateUserCoin(viewerId, coin, fcoin);

        // Roll Logic
        const gacha_result_list: any[] = [];
        const add_card_list: any[] = [];
        const add_chara_list: any[] = [];
        const add_piece_list: any[] = [];
        const add_support_card_list: any[] = [];
        const add_support_card_num_array: any[] = [];

        // Prepare pool
        let pool: number[] = [];
        let umasMap = new Map<number, any>(); // Map for quick lookup

        if (cardType === 1) { // Uma
            if (Array.isArray(umasData)) {
                for (const uma of umasData) {
                    pool.push(uma.id);
                    umasMap.set(uma.id, uma);
                }
            } else {
                console.error("umasData is not an array");
            }
        } else { // Support Card
            pool = supportCardsData.map((sc: any) => sc.id);
        }

        if (pool.length === 0) {
            console.error("Pool is empty!");
            // Handle empty pool?
        }

        for (let i = 0; i < body.draw_num; i++) {
            // Pick random
            const pickedId = pool[Math.floor(Math.random() * pool.length)]; //30028; kitasan
            
            if (cardType === 1) { // Uma
                const umaInfo = umasMap.get(pickedId);
                const rarity = umaInfo ? umaInfo.default_rarity : 1; // Use default_rarity
                const isOwned = checkUserCard(viewerId, pickedId);
                const charaId = umaInfo ? umaInfo.chara_id : Math.floor(pickedId / 100); 
                
                const resultEntry: any = {
                    additional_piece_num: 0,
                    card_id: pickedId,
                    card_type: 1,
                    common_item_category: 0,
                    common_item_id: 0,
                    convert_common_item_num: 0,
                    convert_piece_num: 0,
                    new_flag: isOwned ? 0 : 1,
                    piece_id: pickedId,
                    win_prize: 0
                };

                if (!isOwned) {
                    addUserCard(viewerId, pickedId, rarity, 1);
                    addOrUpdateUserChara(viewerId, charaId);
                    addOrUpdateUserCharaProfile(viewerId, charaId);

                    add_card_list.push({
                        card_id: pickedId,
                        create_time: formatServerTimestamp(),
                        rarity: rarity,
                        talent_level: 1
                    });
                    
                    // Add chara info to list (mocking values)
                    add_chara_list.push({
                         chara_id: charaId,
                         dress_id: 2, // Default
                         fan: 1,
                         love_point: 0,
                         max_grade: 0,
                         mini_dress_id: 2,
                         training_num: 0
                    });

                } else {
                    // Duplicate -> Pieces
                    let pieces = 0;
                    if (rarity === 1) pieces = 5;
                    else if (rarity === 2) pieces = 10;
                    else if (rarity === 3) pieces = 60;

                    resultEntry.additional_piece_num = pieces;
                    addOrUpdateUserPiece(viewerId, pickedId, pieces);
                    
                    // Aggregate pieces in add_piece_list
                    const existingPieceEntry = add_piece_list.find((p: any) => p.piece_id === pickedId);
                    if (existingPieceEntry) {
                        existingPieceEntry.piece_num += pieces;
                    } else {
                        add_piece_list.push({
                            piece_id: pickedId,
                            piece_num: pieces
                        });
                    }
                }
                gacha_result_list.push(resultEntry);

            } else { // Support Card
                const check = checkUserSupportCard(viewerId, pickedId);
                const isNew = !check.exists;
                
                addOrUpdateUserSupportCard(viewerId, pickedId, 1);

                gacha_result_list.push({
                    additional_piece_num: 0,
                    card_id: pickedId,
                    card_type: 2,
                    common_item_category: 0,
                    common_item_id: 0,
                    convert_common_item_num: 0,
                    convert_piece_num: 0,
                    new_flag: isNew ? 1 : 0,
                    piece_id: 0,
                    win_prize: 0
                });

                add_support_card_list.push({
                    create_time: formatServerTimestamp(),
                    exp: 0,
                    favorite_flag: 0,
                    limit_break_count: 0,
                    possess_time: formatServerTimestamp(),
                    stock: isNew ? 0 : check.stock + 1, // 0 if new, current stock + 1 if duplicate
                    support_card_id: pickedId,
                    viewer_id: viewerId
                });

                add_support_card_num_array.push({
                    item_type: 51, // Fixed value from example
                    number: 1,
                    support_card_id: pickedId
                });
            }
        }
        
        var response = {
            "data": {
                "bonus_item_array": [],
                "coin_info": {
                    "coin": coin,
                    "fcoin": fcoin
                },
                "gacha_result_list": gacha_result_list,
                "item_list": [],
                "limit_item_info": {
                    "converted_item_num": 0,
                    "gacha_id": body.gacha_id,
                    "num": body.draw_num
                },
                "reward_summary_info": {
                    "add_card_bonus_info": null,
                    "add_card_list": add_card_list,
                    "add_chara_list": add_chara_list,
                    "add_cloth_list": [],
                    "add_fcoin": 0,
                    "add_honor_list": [],
                    "add_item_list": [],
                    "add_music_list": [],
                    "add_piece_list": add_piece_list,
                    "add_present_num": 0,
                    "add_story_id_array": [],
                    "add_support_card_list": add_support_card_list,
                    "add_support_card_num_array": add_support_card_num_array,
                    "add_total_fan": 0,
                    "force_update_honor_id": 0,
                    "new_chara_profile_array": []
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

        console.log("Response: ", inspect(response, { depth: null, colors: true }))

        reply.status(200).send(response)
    })

}


export default routes;
