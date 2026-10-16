import getDatabase, { Database } from './index';
import { Account, Session, Player, TeamStadiumBorderLine, UserTeamStadiumRanking, UserDirectoryCard, LovePointInfo, RewardItemInfo, UserCharaList, UserCharaProfile, UserTrainedChara, UserPresent, UserItemList, UserClothList, SupportCardNum, UserTpInfo } from './types';
import { generateViewerId, getServerTime, formatServerTimestamp } from '../utils';
import { generateAuthKey } from '../crypto';
import { getDefaultPlayerData, makeRewardItemInfo } from './utils';
import { DEFAULT_CARDS, DEFAULT_CHARAS, DEFAULT_ITEMS, DEFAULT_SUPPORT_CARDS, DEFAULT_TRAINED_CHARAS, DEFAULT_TEAM_DATA, DEFAULT_CHARA_PROFILES, DEFAULT_USER_PROFILE, TUTORIAL_FINISH_TRAINED_CHARA, DEFAULT_SUPPORT_CARD_DATA_ARRAY } from './defaults';

const db = getDatabase(Database.HONSE_DATA);

export function getAccountByUdid(udid: string): Account | undefined {
    return db.prepare('SELECT * FROM accounts WHERE udid = ?').get(udid) as Account | undefined;
}

export function createAccount(udid: string): Account {
    // Generate a unique viewer_id
    // utils.generateViewerId returns a number, but we store as string in DB and types
    let viewerId = generateViewerId();
    
    // Ensure uniqueness (though unlikely to collide with randomInt)
    while (db.prepare('SELECT 1 FROM accounts WHERE viewer_id = ?').get(viewerId)) {
        viewerId = generateViewerId();
    }

    const player: Omit<Player, 'id'> = getDefaultPlayerData(viewerId);
    
    const now = formatServerTimestamp();
    
    const result = db.prepare(`
        INSERT INTO accounts (viewer_id, udid, first_login_time)
        VALUES (?, ?, ?)
    `).run(viewerId, udid, now);

    const accountId = result.lastInsertRowid as number;

    db.prepare(`
        INSERT INTO players (account_id, viewer_id, coin, fcoin, optin_user_birth, rp, tp, tutorial_step)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(accountId, player.viewer_id, player.coin, player.fcoin, player.optin_user_birth, player.rp, player.tp, player.tutorial_step);

    // Initialize User Profile
    db.prepare(`
        INSERT INTO user_profiles (
            viewer_id, account_id, name, comment, birth_day, sex, 
            rank_score, fan, tutorial_step, 
            create_time, register_time, update_time, last_ticket_natural_recovery_time,
            leader_chara_id, leader_chara_dress_id, partner_chara_id, support_card_id,
            best_team_evaluation_point, honor_id,
            bonus_trainer_point, current_rp, directory_level, last_information_checked_time,
            max_rp_add_val, rp_max_recovery_time, single_mode_play_count,
            team_stadium_win_count, total_login_day_count, total_login_day_count_check_time,
            tp_max_recovery_time, trainer_point
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        viewerId, accountId, 
        DEFAULT_USER_PROFILE.name, DEFAULT_USER_PROFILE.comment, "", DEFAULT_USER_PROFILE.sex,
        DEFAULT_USER_PROFILE.rank_score, DEFAULT_USER_PROFILE.fan, DEFAULT_USER_PROFILE.tutorial_step,
        now, now, now, now,
        DEFAULT_USER_PROFILE.leader_chara_id, DEFAULT_USER_PROFILE.leader_chara_dress_id, DEFAULT_USER_PROFILE.partner_chara_id, DEFAULT_USER_PROFILE.support_card_id,
        DEFAULT_USER_PROFILE.best_team_evaluation_point, DEFAULT_USER_PROFILE.honor_id,
        DEFAULT_USER_PROFILE.bonus_trainer_point, DEFAULT_USER_PROFILE.current_rp, DEFAULT_USER_PROFILE.directory_level, DEFAULT_USER_PROFILE.last_information_checked_time,
        DEFAULT_USER_PROFILE.max_rp_add_val, DEFAULT_USER_PROFILE.rp_max_recovery_time, DEFAULT_USER_PROFILE.single_mode_play_count,
        DEFAULT_USER_PROFILE.team_stadium_win_count, DEFAULT_USER_PROFILE.total_login_day_count, DEFAULT_USER_PROFILE.total_login_day_count_check_time,
        DEFAULT_USER_PROFILE.tp_max_recovery_time, DEFAULT_USER_PROFILE.trainer_point
    );

    // Initialize Default Cards
    const insertCard = db.prepare(`
        INSERT INTO user_cards (viewer_id, card_id, rarity, talent_level, create_time, skill_data)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const card of DEFAULT_CARDS) {
        insertCard.run(viewerId, card.card_id, card.rarity, card.talent_level, now, JSON.stringify([]));
    }

    // Initialize Default Charas
    const insertChara = db.prepare(`
        INSERT INTO user_charas (viewer_id, chara_id, dress_id, mini_dress_id, love_point, max_grade, fan, training_num)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const chara of DEFAULT_CHARAS) {
        insertChara.run(viewerId, chara.chara_id, chara.dress_id, chara.mini_dress_id, chara.love_point, chara.max_grade, chara.fan, chara.training_num);
    }

    // Initialize Default Chara Profiles
    const insertCharaProfile = db.prepare(`
        INSERT INTO user_chara_profiles (viewer_id, chara_id, data_id, new_flag)
        VALUES (?, ?, ?, ?)
    `);
    for (const profile of DEFAULT_CHARA_PROFILES) {
        insertCharaProfile.run(viewerId, profile.chara_id, profile.data_id, profile.new_flag);
    }

    // Initialize Default Items
    const insertItem = db.prepare(`
        INSERT INTO user_items (viewer_id, item_id, number)
        VALUES (?, ?, ?)
    `);
    for (const item of DEFAULT_ITEMS) {
        insertItem.run(viewerId, item.item_id, item.number);
    }

    // Initialize Default Support Cards
    const insertSupportCard = db.prepare(`
        INSERT INTO user_support_cards (viewer_id, support_card_id, exp, limit_break_count, favorite_flag, create_time, possess_time, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const sc of DEFAULT_SUPPORT_CARDS) {
        insertSupportCard.run(viewerId, sc.support_card_id, sc.exp, 0, 0, now, now, 0);
    }

    // Initialize Default Decks (10 empty decks)
    const insertDeck = db.prepare(`
        INSERT INTO user_decks (viewer_id, deck_id, name, cards, possess_time, stock)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (let i = 1; i <= 10; i++) {
        insertDeck.run(viewerId, i, `Deck ${i}`, JSON.stringify([0, 0, 0, 0, 0]), now, 0);
    }

    // Initialize Default Trained Charas
    const insertTrainedChara = db.prepare(`
        INSERT INTO user_trained_charas (
            viewer_id, trained_chara_id, card_id, chara_seed, rank, rank_score, speed, stamina, power, guts, wiz,
            rarity, running_style, scenario_id, route_id, wins, register_time, create_time,
            skill_array, race_result_list, factor_info_array, support_card_list,
            arrive_route_race_id, factor_id_array, fans, is_locked, is_saved, nickname_id, nickname_id_array,
            owner_trained_chara_id, proper_distance_long, proper_distance_short, proper_distance_middle, proper_distance_mile,
            proper_ground_dirt, proper_ground_turf, proper_running_style_nige, proper_running_style_oikomi,
            proper_running_style_sashi, proper_running_style_senko, race_cloth_id, single_mode_chara_id,
            succession_chara_array, succession_history_array, succession_num, succession_trained_chara_id_1,
            succession_trained_chara_id_2, talent_level, use_type, win_saddle_id_array, owner_viewer_id, chara_grade
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?
        )
    `);
    
    // We need to map trained_chara_id to the actual DB ID if we want to reference it later
    // For now, let's just insert them. The DB will assign IDs.
    // However, the JSON has `trained_chara_id` which are likely auto-incremented DB IDs.
    // Since this is a new account, they will likely be 1, 2, 3... if the table is empty or per-user?
    // Wait, `user_trained_charas` has `trained_chara_id` as PRIMARY KEY. This is global.
    // So we can't force it to be 1, 2, 3 unless we are the first user.
    // We should let SQLite assign the ID, and then update our `team_data` with the assigned ID.
    
    const trainedCharaIdMap = new Map<number, number>(); // local index -> db id

    for (let i = 0; i < DEFAULT_TRAINED_CHARAS.length - 1; i++) {
        const tc = DEFAULT_TRAINED_CHARAS[i];
        insertTrainedChara.run(
            viewerId, tc.trained_chara_id, tc.card_id, tc.chara_seed, tc.rank, tc.rank_score,
            tc.speed, tc.stamina, tc.power, tc.guts, tc.wiz,
            tc.rarity, tc.running_style, tc.scenario_id, tc.route_id, tc.wins,
            now, now,
            JSON.stringify(tc.skill_array || []), 
            JSON.stringify(tc.race_result_list || []), 
            JSON.stringify(tc.factor_info_array || []), 
            JSON.stringify(tc.support_card_list || []),
            tc.arrive_route_race_id,
            JSON.stringify(tc.factor_id_array || []),
            tc.fans,
            tc.is_locked,
            tc.is_saved,
            tc.nickname_id,
            JSON.stringify(tc.nickname_id_array || []),
            tc.owner_trained_chara_id,
            tc.proper_distance_long,
            tc.proper_distance_short,
            tc.proper_distance_middle,
            tc.proper_distance_mile,
            tc.proper_ground_dirt,
            tc.proper_ground_turf,
            tc.proper_running_style_nige,
            tc.proper_running_style_oikomi,
            tc.proper_running_style_sashi,
            tc.proper_running_style_senko,
            tc.race_cloth_id,
            tc.single_mode_chara_id,
            JSON.stringify(tc.succession_chara_array || []),
            JSON.stringify(tc.succession_history_array || []),
            tc.succession_num,
            tc.succession_trained_chara_id_1,
            tc.succession_trained_chara_id_2,
            tc.talent_level,
            tc.use_type,
            JSON.stringify(tc.win_saddle_id_array || []),
            tc.owner_viewer_id,
            tc.chara_grade
        );
        trainedCharaIdMap.set(tc.trained_chara_id, tc.trained_chara_id);
    }

    // Initialize Default Team Data
    const insertTeamData = db.prepare(`
        INSERT INTO user_team_data (viewer_id, distance_type, member_id, running_style, trained_chara_id)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const td of DEFAULT_TEAM_DATA) {
        // map the dummy trained_chara_id to the real one if it exists
        const realTrainedCharaId = td.trained_chara_id > 0 ? trainedCharaIdMap.get(td.trained_chara_id) || 0 : 0;
        insertTeamData.run(viewerId, td.distance_type, td.member_id, td.running_style, realTrainedCharaId);
    }
    
    return {
        id: accountId,
        viewer_id: viewerId,
        udid: udid,
        first_login_time: now
    };
}

export function getAccountByViewerId(viewerId: string): Account | undefined {
    return db.prepare('SELECT * FROM accounts WHERE viewer_id = ?').get(viewerId) as Account | undefined;
}

export function getSessionByViewerId(viewerId: string): Session | undefined {
    return db.prepare('SELECT * FROM sessions WHERE viewer_id = ? ORDER BY expires DESC LIMIT 1').get(viewerId) as Session | undefined;
}

export function verifySession(viewerId: string): Session | undefined {
    const session = getSessionByViewerId(viewerId);
    if (!session) return undefined;
    
    if (session.expires < getServerTime()) {
        // Session expired
        // Optionally delete it? db.prepare('DELETE FROM sessions WHERE auth_key = ?').run(session.auth_key);
        return undefined;
    }
    
    return session;
}

export function createSession(account: Account): Session {
    const authKey = generateAuthKey();
    const expiresTimestamp = getServerTime() + (60 * 30); // 30 minutes
    
    db.prepare(`
        INSERT INTO sessions (auth_key, account_id, viewer_id, expires)
        VALUES (?, ?, ?, ?)
    `).run(authKey, account.id, account.viewer_id, expiresTimestamp);
    
    return {
        auth_key: authKey,
        expires: expiresTimestamp,
        accountId: account.id,
        viewer_id: account.viewer_id
    };
}


export function getPlayer(viewerId: number | string): Player | null {
    const player = db.prepare(`
    SELECT id, viewer_id, coin, fcoin, optin_user_birth, rp, tp, tutorial_step
    FROM players
    WHERE viewer_id = ?
    `).get(viewerId.toString()) as Player | undefined

    if (player === undefined) return null

    return player
}

// Trainer points (career stamina). TP refills 1 per TP_RECOVERY_SECONDS up to MAX_TP; the refill
// state is just the unix time it becomes full (user_profiles.tp_max_recovery_time), and
// players.tp holds the value as of the last spend (or more, from recovery items).
export const MAX_TP = 100
const TP_RECOVERY_SECONDS = 600

export function getTpInfo(viewerId: number | string): UserTpInfo {
    const now = Math.floor(Date.now() / 1000)
    const tp = (db.prepare('SELECT tp FROM players WHERE viewer_id = ?').get(viewerId.toString()) as { tp: number } | undefined)?.tp ?? 0
    const fullAt = (db.prepare('SELECT tp_max_recovery_time t FROM user_profiles WHERE viewer_id = ?').get(viewerId.toString()) as { t: number } | undefined)?.t ?? 0
    if (fullAt <= now) return { current_tp: Math.max(tp, MAX_TP), max_tp: MAX_TP, max_recovery_time: 0 }
    const missing = Math.ceil((fullAt - now) / TP_RECOVERY_SECONDS)
    return { current_tp: Math.max(0, MAX_TP - missing), max_tp: MAX_TP, max_recovery_time: fullAt }
}

/** Spends TP for a career start. Returns the new TP info, or null when there isn't enough. */
export function spendTp(viewerId: number | string, amount: number): UserTpInfo | null {
    const before = getTpInfo(viewerId)
    if (before.current_tp < amount) return null
    const tp = before.current_tp - amount
    const now = Math.floor(Date.now() / 1000)
    const fullAt = tp >= MAX_TP ? 0 : now + (MAX_TP - tp) * TP_RECOVERY_SECONDS
    db.prepare('UPDATE players SET tp = ? WHERE viewer_id = ?').run(tp, viewerId.toString())
    db.prepare('UPDATE user_profiles SET tp_max_recovery_time = ? WHERE viewer_id = ?').run(fullAt, viewerId.toString())
    return { current_tp: tp, max_tp: MAX_TP, max_recovery_time: fullAt }
}

export function ensurePlayerExists(account: Account): void {
    const existing = db.prepare('SELECT 1 FROM players WHERE viewer_id = ?').get(account.viewer_id)
    if (existing) return

    const player: Omit<Player, 'id'> = getDefaultPlayerData(account.viewer_id);
    db.prepare(`
        INSERT INTO players (account_id, viewer_id, coin, fcoin, optin_user_birth, rp, tp, tutorial_step)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(account.id, player.viewer_id, player.coin, player.fcoin, player.optin_user_birth, player.rp, player.tp, player.tutorial_step);
}

export function getPlayerBorderline(viewerId: number | string): TeamStadiumBorderLine {
    const playerClass = getPlayerTeamStadiumData(viewerId).team_class
    
    const rawEntries = db.prepare(`
    SELECT demotion_point, demotion_rank, keep_point, keep_rank, promotion_point, promotion_rank
    FROM team_stadium_data
    WHERE team_class = ?
    `).all(playerClass.toString()) as TeamStadiumBorderLine[]
    
    return { // hardcode it for now
        "demotion_point": 0,
        "demotion_rank": 0,
        "keep_point": 1000,
        "keep_rank": 1000,
        "promotion_point": 5000,
        "promotion_rank": 100
    }
}

export function getPaymentItemList(): any {
    return {
        "data": [
        {
            "id": 1,
            "store_product_id": "com.cygames.umamusume.item1001",
            "disp_order": 120,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 60,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 2,
            "store_product_id": "com.cygames.umamusume.item1002",
            "disp_order": 110,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 210,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 3,
            "store_product_id": "com.cygames.umamusume.item1003",
            "disp_order": 100,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 350,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 4,
            "store_product_id": "com.cygames.umamusume.item1004",
            "disp_order": 90,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 700,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 5,
            "store_product_id": "com.cygames.umamusume.item1005",
            "disp_order": 80,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 1500,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 6,
            "store_product_id": "com.cygames.umamusume.item1006",
            "disp_order": 70,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 2500,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 7,
            "store_product_id": "com.cygames.umamusume.item1007",
            "disp_order": 60,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 5000,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 0,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 8,
            "store_product_id": "com.cygames.umamusume.item2001",
            "disp_order": 40,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 7500,
            "free_num": 0,
            "limit_num": 3,
            "limit_type": 1,
            "item_pack_id": 0,
            "recommended_flag": 1,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 20,
            "store_product_id": "com.cygames.umamusume.item2002",
            "disp_order": 50,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 1500,
            "free_num": 0,
            "limit_num": 2,
            "limit_type": 1,
            "item_pack_id": 0,
            "recommended_flag": 1,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 23,
            "store_product_id": "com.cygames.umamusume.item2004",
            "disp_order": 5,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 7500,
            "free_num": 0,
            "limit_num": 3,
            "limit_type": 1,
            "item_pack_id": 0,
            "recommended_flag": 1,
            "start_time": 1762207200,
            "end_time": 1765378799,
            "number_of_product_purchased": 0
        },
        {
            "id": 3001,
            "store_product_id": "com.cygames.umamusume.item3001",
            "disp_order": 10,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 600,
            "free_num": 0,
            "limit_num": 1,
            "limit_type": 1,
            "item_pack_id": 9000,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 3002,
            "store_product_id": "com.cygames.umamusume.item3002",
            "disp_order": 15,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 1500,
            "free_num": 0,
            "limit_num": 1,
            "limit_type": 1,
            "item_pack_id": 9001,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 3003,
            "store_product_id": "com.cygames.umamusume.item3003",
            "disp_order": 20,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 1500,
            "free_num": 0,
            "limit_num": 1,
            "limit_type": 1,
            "item_pack_id": 9002,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        },
        {
            "id": 16,
            "store_product_id": "com.cygames.umamusume.item4002",
            "disp_order": 30,
            "price": 0,
            "formatted_price": "0pt",
            "charge_num": 500,
            "free_num": 0,
            "limit_num": 0,
            "limit_type": 3,
            "item_pack_id": 0,
            "recommended_flag": 0,
            "start_time": 1577840400,
            "end_time": 2524611600,
            "number_of_product_purchased": 0
        }
        ],
        "last_checked_time": 0,
        "season_pack_info": {
            "notice_status": 0,
            "product_master_id": 0,
            "repurchase_time": 0,
            "season_end_time": 0
        }
    }
}

export function updateTutorialStep(viewerId: number | string, step: number): void {
    db.prepare(`
        UPDATE players
        SET tutorial_step = ?
        WHERE viewer_id = ?
    `).run(step, viewerId.toString());

    db.prepare(`
        UPDATE user_profiles
        SET tutorial_step = ?
        WHERE viewer_id = ?
    `).run(step, viewerId.toString());
}

export function getPlayerTeamStadiumData(viewerId: number | string): UserTeamStadiumRanking {
    const player = getPlayer(viewerId)

    
    
    return { // hardcode it for now
        "best_point": 0,
        "rank": 0,
        "team_class": 1,
        "term_id": 20260301,
        "viewer_id": player?.viewer_id ?? 0
    }
}

export function getUserProfile(viewerId: number | string): any {
    return db.prepare('SELECT * FROM user_profiles WHERE viewer_id = ?').get(viewerId);
}

export function getUserCards(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_cards WHERE viewer_id = ?').all(viewerId);
}

export function getUserCharas(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_charas WHERE viewer_id = ?').all(viewerId);
}

export function getUserCharaProfiles(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_chara_profiles WHERE viewer_id = ?').all(viewerId);
}

export function getUserItems(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_items WHERE viewer_id = ?').all(viewerId);
}

export function getUserSupportCards(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_support_cards WHERE viewer_id = ?').all(viewerId);
}

export function getUserDecks(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_decks WHERE viewer_id = ?').all(viewerId);
}

export function getUserTrainedCharas(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_trained_charas WHERE viewer_id = ?').all(viewerId);
}

export function getUserTeamData(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_team_data WHERE viewer_id = ?').all(viewerId);
}

export function updateUserCoin(viewerId: number | string, coin: number, fcoin: number): void {
    db.prepare('UPDATE players SET coin = ?, fcoin = ? WHERE viewer_id = ?').run(coin, fcoin, viewerId.toString());
}

export function getRandomViewerIds(limit: number, excludeViewerId?: number): number[] {
    if (excludeViewerId !== undefined) {
        const rows = db.prepare('SELECT viewer_id FROM accounts WHERE viewer_id != ? ORDER BY RANDOM() LIMIT ?').all(excludeViewerId, limit) as { viewer_id: number }[];
        return rows.map(r => r.viewer_id);
    }
    const rows = db.prepare('SELECT viewer_id FROM accounts ORDER BY RANDOM() LIMIT ?').all(limit) as { viewer_id: number }[];
    return rows.map(r => r.viewer_id);
}

export function getCircleMembership(viewerId: number | string): { circle_info: { circle_id: number, name: string } | null, circle_user: any | null } {
    const cm = db.prepare('SELECT * FROM circle_members WHERE viewer_id = ?').get(viewerId.toString()) as any;
    if (!cm) return { circle_info: null, circle_user: null };
    const ci = db.prepare('SELECT * FROM circles WHERE id = ?').get(cm.circle_id) as any;
    const circle_info = ci ? { circle_id: ci.id, name: ci.name } : null;
    const circle_user = {
        circle_id: cm.circle_id,
        item_request_end_time: cm.item_request_end_time,
        join_time: cm.join_time,
        last_check_post_id: cm.last_check_post_id,
        membership: cm.membership,
        penalty_end_time: cm.penalty_end_time,
        ranking_result_check_time: cm.ranking_result_check_time,
        viewer_id: cm.viewer_id
    };
    return { circle_info, circle_user };
}

export function getUserSupportCardById(viewerId: number | string, supportCardId: number): any | null {
    const row = db.prepare('SELECT * FROM user_support_cards WHERE viewer_id = ? AND support_card_id = ?').get(viewerId.toString(), supportCardId) as any;
    return row || null;
}

export function checkUserCard(viewerId: number | string, cardId: number): boolean {
    const result = db.prepare('SELECT 1 FROM user_cards WHERE viewer_id = ? AND card_id = ?').get(viewerId.toString(), cardId);
    return !!result;
}

export function addUserCard(viewerId: number | string, cardId: number, rarity: number, talentLevel: number): void {
    const now = formatServerTimestamp();
    db.prepare(`
        INSERT INTO user_cards (viewer_id, card_id, rarity, talent_level, create_time, skill_data)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(viewerId.toString(), cardId, rarity, talentLevel, now, JSON.stringify([]));
}

export function checkUserSupportCard(viewerId: number | string, supportCardId: number): { exists: boolean, stock: number } {
    const result = db.prepare('SELECT stock FROM user_support_cards WHERE viewer_id = ? AND support_card_id = ?').get(viewerId.toString(), supportCardId) as { stock: number } | undefined;
    return result ? { exists: true, stock: result.stock } : { exists: false, stock: 0 };
}

export function addOrUpdateUserSupportCard(viewerId: number | string, supportCardId: number, count: number): void {
    const now = formatServerTimestamp();
    const existing = checkUserSupportCard(viewerId, supportCardId);
    if (existing.exists) {
        db.prepare('UPDATE user_support_cards SET stock = stock + ? WHERE viewer_id = ? AND support_card_id = ?')
          .run(count, viewerId.toString(), supportCardId);
    } else {
        const initialStock = Math.max(0, count - 1);
        db.prepare(`
            INSERT INTO user_support_cards (viewer_id, support_card_id, exp, limit_break_count, favorite_flag, create_time, possess_time, stock)
            VALUES (?, ?, 0, 0, 0, ?, ?, ?)
        `).run(viewerId.toString(), supportCardId, now, now, initialStock);
    }
}

export function addOrUpdateUserPiece(viewerId: number | string, pieceId: number, addNum: number): void {
    const result = db.prepare('SELECT piece_num FROM user_pieces WHERE viewer_id = ? AND piece_id = ?').get(viewerId.toString(), pieceId) as { piece_num: number } | undefined;
    if (result) {
        db.prepare('UPDATE user_pieces SET piece_num = piece_num + ? WHERE viewer_id = ? AND piece_id = ?')
          .run(addNum, viewerId.toString(), pieceId);
    } else {
        db.prepare('INSERT INTO user_pieces (viewer_id, piece_id, piece_num) VALUES (?, ?, ?)').run(viewerId.toString(), pieceId, addNum);
    }
}

export function getUserPieces(viewerId: number | string): any[] {
    return db.prepare('SELECT * FROM user_pieces WHERE viewer_id = ?').all(viewerId.toString());
}

export function addUserSupportCardExp(viewerId: number | string, supportCardId: number, addExp: number): void {
    if (addExp <= 0) return;
    db.prepare('UPDATE user_support_cards SET exp = exp + ? WHERE viewer_id = ? AND support_card_id = ?')
      .run(Math.round(addExp), viewerId.toString(), supportCardId);
}

export function incrementUserCharaTrainingStats(viewerId: number | string, charaId: number, fanGain: number): void {
    db.prepare('UPDATE user_charas SET fan = fan + ?, training_num = training_num + 1 WHERE viewer_id = ? AND chara_id = ?')
      .run(Math.max(0, Math.round(fanGain)), viewerId.toString(), charaId);
}

export function incrementSingleModePlayCount(viewerId: number | string): void {
    db.prepare('UPDATE user_profiles SET single_mode_play_count = single_mode_play_count + 1 WHERE viewer_id = ?')
      .run(viewerId.toString());
}

// Generic insert for a freeform (non-tutorial) finished training run.
// Mirrors the column layout used by updatePlayerSingleModeFinish's tutorial-specific insert,
// but takes real computed values instead of a hardcoded example row.
export function insertTrainedChara(viewerId: number | string, trainedChara: any): number {
    const viewerIdStr = viewerId.toString();
    const now = formatServerTimestamp();

    const maxIdResult = db.prepare('SELECT MAX(trained_chara_id) as max_id FROM user_trained_charas WHERE viewer_id = ?').get(viewerIdStr) as { max_id: number };
    const nextId = (maxIdResult.max_id || 0) + 1;

    const row = {
        viewer_id: Number(viewerIdStr),
        trained_chara_id: nextId,
        card_id: trainedChara.card_id,
        chara_seed: trainedChara.chara_seed ?? 0,
        rank: trainedChara.rank ?? 0,
        rank_score: trainedChara.rank_score ?? 0,
        speed: trainedChara.speed ?? 0,
        stamina: trainedChara.stamina ?? 0,
        power: trainedChara.power ?? 0,
        guts: trainedChara.guts ?? 0,
        wiz: trainedChara.wiz ?? 0,
        rarity: trainedChara.rarity ?? 1,
        running_style: trainedChara.running_style ?? 0,
        scenario_id: trainedChara.scenario_id ?? 0,
        route_id: trainedChara.route_id ?? 0,
        wins: trainedChara.wins ?? 0,
        register_time: now,
        create_time: now,
        skill_array: JSON.stringify(trainedChara.skill_array ?? []),
        race_result_list: JSON.stringify(trainedChara.race_result_list ?? []),
        factor_info_array: JSON.stringify(trainedChara.factor_info_array ?? []),
        support_card_list: JSON.stringify(trainedChara.support_card_list ?? []),
        arrive_route_race_id: trainedChara.arrive_route_race_id ?? 0,
        factor_id_array: JSON.stringify(trainedChara.factor_id_array ?? []),
        fans: trainedChara.fans ?? 0,
        is_locked: 0,
        is_saved: 0,
        nickname_id: trainedChara.nickname_id ?? 0,
        nickname_id_array: JSON.stringify(trainedChara.nickname_id_array ?? []),
        owner_trained_chara_id: 0,
        proper_distance_long: trainedChara.proper_distance_long ?? 0,
        proper_distance_short: trainedChara.proper_distance_short ?? 0,
        proper_distance_middle: trainedChara.proper_distance_middle ?? 0,
        proper_distance_mile: trainedChara.proper_distance_mile ?? 0,
        proper_ground_dirt: trainedChara.proper_ground_dirt ?? 0,
        proper_ground_turf: trainedChara.proper_ground_turf ?? 0,
        proper_running_style_nige: trainedChara.proper_running_style_nige ?? 0,
        proper_running_style_oikomi: trainedChara.proper_running_style_oikomi ?? 0,
        proper_running_style_sashi: trainedChara.proper_running_style_sashi ?? 0,
        proper_running_style_senko: trainedChara.proper_running_style_senko ?? 0,
        race_cloth_id: trainedChara.race_cloth_id ?? 0,
        single_mode_chara_id: 0,
        succession_chara_array: JSON.stringify(trainedChara.succession_chara_array ?? []),
        succession_history_array: JSON.stringify(trainedChara.succession_history_array ?? []),
        succession_num: trainedChara.succession_num ?? 0,
        succession_trained_chara_id_1: trainedChara.succession_trained_chara_id_1 ?? 0,
        succession_trained_chara_id_2: trainedChara.succession_trained_chara_id_2 ?? 0,
        talent_level: trainedChara.talent_level ?? 1,
        use_type: trainedChara.use_type ?? 0,
        win_saddle_id_array: JSON.stringify(trainedChara.win_saddle_id_array ?? []),
        owner_viewer_id: 0,
        chara_grade: trainedChara.chara_grade ?? 1,
    };

    db.prepare(`
        INSERT INTO user_trained_charas (
            viewer_id, trained_chara_id, card_id, chara_seed, rank, rank_score, speed, stamina, power, guts, wiz,
            rarity, running_style, scenario_id, route_id, wins, register_time, create_time,
            skill_array, race_result_list, factor_info_array, support_card_list,
            arrive_route_race_id, factor_id_array, fans, is_locked, is_saved, nickname_id, nickname_id_array,
            owner_trained_chara_id, proper_distance_long, proper_distance_short, proper_distance_middle, proper_distance_mile,
            proper_ground_dirt, proper_ground_turf, proper_running_style_nige, proper_running_style_oikomi,
            proper_running_style_sashi, proper_running_style_senko, race_cloth_id, single_mode_chara_id,
            succession_chara_array, succession_history_array, succession_num, succession_trained_chara_id_1,
            succession_trained_chara_id_2, talent_level, use_type, win_saddle_id_array, owner_viewer_id, chara_grade
        ) VALUES (
            @viewer_id, @trained_chara_id, @card_id, @chara_seed, @rank, @rank_score, @speed, @stamina, @power, @guts, @wiz,
            @rarity, @running_style, @scenario_id, @route_id, @wins, @register_time, @create_time,
            @skill_array, @race_result_list, @factor_info_array, @support_card_list,
            @arrive_route_race_id, @factor_id_array, @fans, @is_locked, @is_saved, @nickname_id, @nickname_id_array,
            @owner_trained_chara_id, @proper_distance_long, @proper_distance_short, @proper_distance_middle, @proper_distance_mile,
            @proper_ground_dirt, @proper_ground_turf, @proper_running_style_nige, @proper_running_style_oikomi,
            @proper_running_style_sashi, @proper_running_style_senko, @race_cloth_id, @single_mode_chara_id,
            @succession_chara_array, @succession_history_array, @succession_num, @succession_trained_chara_id_1,
            @succession_trained_chara_id_2, @talent_level, @use_type, @win_saddle_id_array, @owner_viewer_id, @chara_grade
        )
    `).run(row);

    return nextId;
}

export function addOrUpdateUserChara(viewerId: number | string, charaId: number): void {
    const existing = db.prepare('SELECT 1 FROM user_charas WHERE viewer_id = ? AND chara_id = ?').get(viewerId.toString(), charaId);
    if (!existing) {
        // Default values for new chara
        // Using dress_id 2 (School Uniform) as default
        db.prepare(`
            INSERT INTO user_charas (viewer_id, chara_id, dress_id, mini_dress_id, love_point, max_grade, fan, training_num)
            VALUES (?, ?, ?, ?, 0, 0, 1, 0)
        `).run(viewerId.toString(), charaId, 2, 2); 
    }
}

export function addOrUpdateUserCharaProfile(viewerId: number | string, charaId: number): void {
     const existing = db.prepare('SELECT 1 FROM user_chara_profiles WHERE viewer_id = ? AND chara_id = ? AND data_id = 1').get(viewerId.toString(), charaId);
     if (!existing) {
         db.prepare(`
            INSERT INTO user_chara_profiles (viewer_id, chara_id, data_id, new_flag)
            VALUES (?, ?, 1, 1)
         `).run(viewerId.toString(), charaId);
     }
}

export function updatePlayerSingleModeFinish(viewerId: number | string): any {
    const viewerIdStr = viewerId.toString();
    const now = formatServerTimestamp();

    const player = getPlayer(viewerId);
    if (!player) return null;
    console.log("player.tutorial_step:", player.tutorial_step)

    if (player.tutorial_step < 1000) {
        const tc = { ...TUTORIAL_FINISH_TRAINED_CHARA };
        tc.viewer_id = typeof viewerId === 'string' ? parseInt(viewerId) : viewerId;
        tc.create_time = now;
        tc.register_time = now;

        const maxIdResult = db.prepare('SELECT MAX(trained_chara_id) as max_id FROM user_trained_charas WHERE viewer_id = ?').get(viewerIdStr) as { max_id: number };
        const nextId = (maxIdResult.max_id || 0) + 1;
        tc.trained_chara_id = nextId;
        
        const insertTrainedChara = db.prepare(`
            INSERT INTO user_trained_charas (
                viewer_id, trained_chara_id, card_id, chara_seed, rank, rank_score, speed, stamina, power, guts, wiz,
                rarity, running_style, scenario_id, route_id, wins, register_time, create_time,
                skill_array, race_result_list, factor_info_array, support_card_list,
                arrive_route_race_id, factor_id_array, fans, is_locked, is_saved, nickname_id, nickname_id_array,
                owner_trained_chara_id, proper_distance_long, proper_distance_short, proper_distance_middle, proper_distance_mile,
                proper_ground_dirt, proper_ground_turf, proper_running_style_nige, proper_running_style_oikomi,
                proper_running_style_sashi, proper_running_style_senko, race_cloth_id, single_mode_chara_id,
                succession_chara_array, succession_history_array, succession_num, succession_trained_chara_id_1,
                succession_trained_chara_id_2, talent_level, use_type, win_saddle_id_array, owner_viewer_id, chara_grade
            ) VALUES (
                @viewer_id, @trained_chara_id, @card_id, @chara_seed, @rank, @rank_score, @speed, @stamina, @power, @guts, @wiz,
                @rarity, @running_style, @scenario_id, @route_id, @wins, @register_time, @create_time,
                @skill_array, @race_result_list, @factor_info_array, @support_card_list,
                @arrive_route_race_id, @factor_id_array, @fans, @is_locked, @is_saved, @nickname_id, @nickname_id_array,
                @owner_trained_chara_id, @proper_distance_long, @proper_distance_short, @proper_distance_middle, @proper_distance_mile,
                @proper_ground_dirt, @proper_ground_turf, @proper_running_style_nige, @proper_running_style_oikomi,
                @proper_running_style_sashi, @proper_running_style_senko, @race_cloth_id, @single_mode_chara_id,
                @succession_chara_array, @succession_history_array, @succession_num, @succession_trained_chara_id_1,
                @succession_trained_chara_id_2, @talent_level, @use_type, @win_saddle_id_array, @owner_viewer_id, @chara_grade
            )
        `);
        
        const insertData = {
            ...tc,
            skill_array: JSON.stringify(tc.skill_array),
            race_result_list: JSON.stringify(tc.race_result_list),
            factor_info_array: JSON.stringify(tc.factor_info_array),
            support_card_list: JSON.stringify(tc.support_card_list),
            factor_id_array: JSON.stringify(tc.factor_id_array),
            nickname_id_array: JSON.stringify(tc.nickname_id_array),
            succession_chara_array: JSON.stringify(tc.succession_chara_array),
            succession_history_array: JSON.stringify(tc.succession_history_array),
            win_saddle_id_array: JSON.stringify(tc.win_saddle_id_array)
        };
        
        insertTrainedChara.run(insertData);
        const newTrainedCharaId = nextId;

        const updateChara = db.prepare(`
            UPDATE user_charas 
            SET fan = ?, love_point = ?, max_grade = ?
            WHERE viewer_id = ? AND chara_id = ?
        `);
        updateChara.run(743, 11, 1, viewerIdStr, 1009);
        
        const insertProfile = db.prepare(`
            INSERT OR REPLACE INTO user_chara_profiles (viewer_id, chara_id, data_id, new_flag)
            VALUES (?, ?, ?, ?)
        `);
        insertProfile.run(viewerIdStr, 1009, 2, 1);

        const item59 = db.prepare('SELECT number FROM user_items WHERE viewer_id = ? AND item_id = ?').get(viewerIdStr, 59) as any;
        const currentNum = item59 ? item59.number : 0;
        const newNum = currentNum + 500;
        
        db.prepare(`
            INSERT OR REPLACE INTO user_items (viewer_id, item_id, number)
            VALUES (?, ?, ?)
        `).run(viewerIdStr, 59, newNum);

        const directoryCard = {
            card_id: tc.card_id,
            directory_ranking: 1,
            trained_chara: { ...tc }
        };
        
        const lovePointInfo: LovePointInfo = {
            chara_id: 1009,
            love_point_after: 11,
            love_point_before: 0
        };
        
        const newCharaProfileArray = [
            { chara_id: 1009, data_id: 2, new_flag: 1 }
        ];
        
        const rewardItemInfo: RewardItemInfo = {
            add_card_bonus_info: null,
            add_card_list: [],
            add_chara_list: [],
            add_cloth_list: [],
            add_fcoin: 0,
            add_honor_list: [],
            add_item_list: [{ item_id: 59, number: 500 }],
            add_music_list: [],
            add_piece_list: [],
            add_present_num: 0,
            add_story_id_array: [],
            add_support_card_list: [],
            add_support_card_num_array: [],
            add_total_fan: 0,
            force_update_honor_id: 0,
            new_chara_profile_array: []
        };
        
        const updatedChara = db.prepare('SELECT * FROM user_charas WHERE viewer_id = ? AND chara_id = ?').get(viewerIdStr, 1009) as any;
        const updateUserCharaInfo: UserCharaList = {
            chara_id: updatedChara.chara_id,
            dress_id: updatedChara.dress_id,
            fan: updatedChara.fan,
            love_point: updatedChara.love_point,
            max_grade: updatedChara.max_grade,
            mini_dress_id: updatedChara.mini_dress_id,
            training_num: updatedChara.training_num
        };

        const supportCardDataArray = DEFAULT_SUPPORT_CARD_DATA_ARRAY.map(card => ({
            ...card,
            viewer_id: typeof viewerId === 'string' ? parseInt(viewerId) : viewerId,
            create_time: now,
            possess_time: now
        }));


        const currentDate = new Date();
        const dateNum = parseInt(currentDate.getFullYear().toString() + (currentDate.getMonth() + 1).toString().padStart(2, '0') + currentDate.getDate().toString().padStart(2, '0'));

        const updateSuccession = db.prepare(`
            UPDATE user_trained_charas
            SET succession_history_array = ?, succession_num = ?
            WHERE viewer_id = ? AND trained_chara_id = ?
        `);

        const successionHistory2 = [
            {
                "circle_name": "",
                "date": dateNum,
                "history_type": 1,
                "id": 10001,
                "rental_viewer_id": Number(viewerIdStr),
                "succession_card_id": 100901,
                "trained_chara_id": 2, // This seems to be the target ID? Or reference? In the example it says "trained_chara_id": 2 inside the object.
                "user_name": "",
                "viewer_id": Number(viewerIdStr)
            }
        ];
        updateSuccession.run(JSON.stringify(successionHistory2), 1, viewerIdStr, 2);
        const successionHistory4 = [
            {
                ...successionHistory2[0],
                "id": 10002,
                "trained_chara_id": 4
            }
        ];
        successionHistory4[0].id = 10002;
        updateSuccession.run(JSON.stringify(successionHistory4), 1, viewerIdStr, 4);

        
        const dbTrainedCharas = getUserTrainedCharas(viewerId);
        
        const trainedCharaList = dbTrainedCharas.map((tc: any) => ({
             ...tc,
             skill_array: JSON.parse(tc.skill_array),
             race_result_list: JSON.parse(tc.race_result_list),
             factor_info_array: JSON.parse(tc.factor_info_array),
             support_card_list: JSON.parse(tc.support_card_list),
             factor_id_array: JSON.parse(tc.factor_id_array),
             nickname_id_array: JSON.parse(tc.nickname_id_array),
             succession_chara_array: JSON.parse(tc.succession_chara_array),
             succession_history_array: JSON.parse(tc.succession_history_array),
             win_saddle_id_array: JSON.parse(tc.win_saddle_id_array),
        }));

        return {
            directory_card_array: [directoryCard],
            directory_ranking: 1,
            limited_shop_info: [],
            love_point_info: lovePointInfo,
            new_chara_profile_array: newCharaProfileArray,
            reward_item_info: rewardItemInfo,
            support_card_data_array: supportCardDataArray,
            trained_chara: trainedCharaList,
            trained_chara_id: Number(newTrainedCharaId),
            update_user_chara_info: updateUserCharaInfo
        };

    } else {
        return {
             directory_card_array: [],
             directory_ranking: 1,
             limited_shop_info: [],
             love_point_info: { chara_id: 0, love_point_after: 0, love_point_before: 0 },
             new_chara_profile_array: [],
             reward_item_info: { 
                 add_card_bonus_info: null,
                 add_card_list: [],
                 add_chara_list: [],
                 add_cloth_list: [],
                 add_fcoin: 0,
                 add_honor_list: [],
                 add_item_list: [],
                 add_music_list: [],
                 add_piece_list: [],
                 add_present_num: 0,
                 add_story_id_array: [],
                 add_support_card_list: [],
                 add_support_card_num_array: [],
                 add_total_fan: 0,
                 force_update_honor_id: 0,
                 new_chara_profile_array: []
             },
             support_card_data_array: [],
             trained_chara: [],
             trained_chara_id: 0,
             update_user_chara_info: { 
                 chara_id: 0, dress_id: 0, fan: 0, love_point: 0, max_grade: 0, mini_dress_id: 0, training_num: 0
             }
        };
    }
}

export function getUserPresents(viewerId: number | string, limit: number = 100, offset: number = 0): UserPresent[] {
    return db.prepare('SELECT * FROM user_presents WHERE viewer_id = ? AND state = 0 ORDER BY create_time DESC LIMIT ? OFFSET ?').all(viewerId.toString(), limit, offset) as UserPresent[];
}

export function countUserPresents(viewerId: number | string): number {
    const result = db.prepare('SELECT COUNT(*) as count FROM user_presents WHERE viewer_id = ? AND state = 0').get(viewerId.toString()) as { count: number };
    return result ? result.count : 0;
}

export function getUserPresentCounts(viewerId: number | string): { time_limit: number, no_time_limit: number } {
    const timeLimit = db.prepare('SELECT COUNT(*) as count FROM user_presents WHERE viewer_id = ? AND state = 0 AND reward_limit_time > 0').get(viewerId.toString()) as { count: number };
    const noTimeLimit = db.prepare('SELECT COUNT(*) as count FROM user_presents WHERE viewer_id = ? AND state = 0 AND reward_limit_time = 0').get(viewerId.toString()) as { count: number };
    
    return {
        time_limit: timeLimit ? timeLimit.count : 0,
        no_time_limit: noTimeLimit ? noTimeLimit.count : 0
    };
}

export function addUserPresent(
    viewerId: number | string, 
    rewardId: number, 
    rewardCount: number, 
    rewardType: number, 
    message: string = "", 
    limitTime: number = 0
): void {
    const now = formatServerTimestamp();
    db.prepare(`
        INSERT INTO user_presents (
            viewer_id, create_time, free_message, 
            message_id, message_param_value_1, message_param_value_2, message_param_value_3, message_param_value_4,
            receive_time, reward_count, reward_id, reward_limit_time, reward_type, state
        ) VALUES (?, ?, ?, 0, 0, 0, 0, 0, '0000-00-00 00:00:00', ?, ?, ?, ?, 0)
    `).run(viewerId.toString(), now, message, rewardCount, rewardId, limitTime, rewardType);
}

export function addOrUpdateUserItem(viewerId: number | string, itemId: number, addNum: number): void {
    const result = db.prepare('SELECT number FROM user_items WHERE viewer_id = ? AND item_id = ?').get(viewerId.toString(), itemId) as { number: number } | undefined;
    if (result) {
        db.prepare('UPDATE user_items SET number = number + ? WHERE viewer_id = ? AND item_id = ?')
          .run(addNum, viewerId.toString(), itemId);
    } else {
        db.prepare('INSERT INTO user_items (viewer_id, item_id, number) VALUES (?, ?, ?)').run(viewerId.toString(), itemId, addNum);
    }
}

export function addOrUpdateUserCloth(viewerId: number | string, clothId: number): void {
    const now = formatServerTimestamp();
    const existing = db.prepare('SELECT 1 FROM user_cloths WHERE viewer_id = ? AND cloth_id = ?').get(viewerId.toString(), clothId);
    if (!existing) {
        db.prepare('INSERT INTO user_cloths (viewer_id, cloth_id, acquisition_time) VALUES (?, ?, ?)').run(viewerId.toString(), clothId, now);
    }
}

export function addOrUpdateUserMoney(viewerId: number | string, amount: number): void {
    db.prepare('UPDATE players SET money = money + ? WHERE viewer_id = ?').run(amount, viewerId.toString());
}

export function addOrUpdateUserFCoin(viewerId: number | string, amount: number): void {
    db.prepare('UPDATE players SET fcoin = fcoin + ? WHERE viewer_id = ?').run(amount, viewerId.toString());
}

export function addOrUpdateUserTrainerPoint(viewerId: number | string, amount: number): void {
    db.prepare('UPDATE user_profiles SET trainer_point = trainer_point + ? WHERE viewer_id = ?').run(amount, viewerId.toString());
}

export function claimUserPresents(viewerId: number, presentIds?: number[]): { info: RewardItemInfo, count: number } {
    const viewerIdStr = viewerId.toString();
    const now = formatServerTimestamp();
    
    // Construct query
    let query = 'SELECT * FROM user_presents WHERE viewer_id = ? AND state = 0';
    let params: any[] = [viewerIdStr];
    
    if (presentIds && presentIds.length > 0) {
        query += ` AND present_id IN (${presentIds.map(() => '?').join(',')})`;
        params.push(...presentIds);
    }
    
    const presents = db.prepare(query).all(...params) as UserPresent[];
    
    if (presents.length === 0) {
        return { info: makeRewardItemInfo(), count: 0 };
    }
    
    const accumulatedReward: Partial<RewardItemInfo> = {
        add_item_list: [],
        add_cloth_list: [],
        add_support_card_num_array: [],
        add_fcoin: 0,
    };
    
    const itemMap = new Map<number, number>(); // item_id -> count
    const clothSet = new Set<number>();
    
    const updatePresentState = db.prepare('UPDATE user_presents SET state = 1, receive_time = ? WHERE present_id = ?');
    
    db.transaction(() => {
        for (const present of presents) {
            const { reward_type, reward_id, reward_count } = present;
            
            // reward_type is the client's Gallop.GameDefine.ItemCategory.
            switch (reward_type) {
                case 90: // FREE_CARROT (free jewels)
                    addOrUpdateUserFCoin(viewerId, reward_count);
                    accumulatedReward.add_fcoin = (accumulatedReward.add_fcoin || 0) + reward_count;
                    break;
                case 91: // MONEY: Monies are item 59, the balance the client shows and spends
                    addOrUpdateUserItem(viewerId, 59, reward_count);
                    itemMap.set(59, (itemMap.get(59) || 0) + reward_count);
                    break;
                case 30: // EXPERIENCE: Support Points (item 110), spent levelling support cards
                case 43: // older presents used 43 for Support Pt
                    addOrUpdateUserItem(viewerId, 110, reward_count);
                    itemMap.set(110, (itemMap.get(110) || 0) + reward_count);
                    break;
                case 102: // CARD_PIECE: reward_id is the piece id (= the card id it unlocks/upgrades)
                    addOrUpdateUserPiece(viewerId, reward_id, reward_count);
                    break;
                case 11: // TRAINING items (talent / hint materials)
                case 20: // RECOVER_TP
                case 21: // RECOVER_RP
                case 34: // CONTINUE (alarm clocks)
                case 40: // GACHA_TICKET
                case 93: // MEDAL
                case 164: // SUPPORT_CARD_LIMIT_BREAK_ITEM (uncap crystals)
                    addOrUpdateUserItem(viewerId, reward_id, reward_count);
                    itemMap.set(reward_id, (itemMap.get(reward_id) || 0) + reward_count);
                    break;
                case 51: // Support Card (Guessing type 51 based on comment, or maybe type is different but treated here)
                    // If reward_type is for support card
                    addOrUpdateUserSupportCard(viewerId, reward_id, reward_count);
                    // Add to response
                    if (!accumulatedReward.add_support_card_num_array) accumulatedReward.add_support_card_num_array = [];
                    // Check if already in array
                    const existingSC = accumulatedReward.add_support_card_num_array.find(sc => sc.support_card_id === reward_id);
                    if (existingSC) {
                        existingSC.num += reward_count;
                    } else {
                        accumulatedReward.add_support_card_num_array.push({
                            item_id: 51, // "always 51"
                            support_card_id: reward_id,
                            num: reward_count
                        });
                    }
                    break;
                case 60: // Cloth (Guessing type)
                case 10: // Maybe generic type for cloth?
                     // I will try to handle cloth if I knew the type. 
                     // In the response JSON, add_cloth_list is present.
                     // I'll assume if reward_type corresponds to cloth (let's say 60 for now, or fallback).
                     // If I see a present with reward_type and I don't know it, I might log it.
                     // But for this task, I'll assume type 60 is Cloth.
                     // Or maybe I check `reward_id`?
                     // If `reward_type` is generic (e.g. 1) maybe `reward_id` determines it?
                     // But usually type is distinctive.
                     // I will assume type 60 is Cloth.
                     addOrUpdateUserCloth(viewerId, reward_id);
                     clothSet.add(reward_id);
                     break;
                default:
                    // Fallback: treat as item if we don't know?
                    // Or check if it matches "Item" type 20.
                    // If unknown, we might lose it.
                    // I'll assume type 20 is the only "Item" type.
                    // If it is 90, 30, 43 we handled it.
                    // If it is something else, I'll log.
                    console.warn(`Unknown reward type: ${reward_type} for present ${present.present_id}`);
                    break;
            }
            
            updatePresentState.run(now, present.present_id);
        }
    })();
    
    // Convert maps to lists
    if (itemMap.size > 0) {
        accumulatedReward.add_item_list = Array.from(itemMap.entries()).map(([item_id, number]) => ({ item_id, number }));
    }
    
    if (clothSet.size > 0) {
        accumulatedReward.add_cloth_list = Array.from(clothSet).map(cloth_id => ({ cloth_id }));
    }
    
    return { info: makeRewardItemInfo(accumulatedReward), count: presents.length };
}

export function addPresentToAllUsers(
    rewardId: number, 
    rewardCount: number, 
    rewardType: number, 
    message: string = "", 
    limitTime: number = 0
): void {
    const now = formatServerTimestamp();
    const users = db.prepare('SELECT viewer_id FROM accounts').all() as { viewer_id: number }[];
    
    const insert = db.prepare(`
        INSERT INTO user_presents (
            viewer_id, create_time, free_message, 
            message_id, message_param_value_1, message_param_value_2, message_param_value_3, message_param_value_4,
            receive_time, reward_count, reward_id, reward_limit_time, reward_type, state
        ) VALUES (?, ?, ?, 0, 0, 0, 0, 0, '0000-00-00 00:00:00', ?, ?, ?, ?, 0)
    `);

    const transaction = db.transaction((users) => {
        for (const user of users) {
            insert.run(user.viewer_id, now, message, rewardCount, rewardId, limitTime, rewardType);
        }
    });

    transaction(users);
}

