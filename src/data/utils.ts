import { ChallengeMatchLoadInfo, ChampionsMeetingInfo, CircleInfo, CircleUser, ClientPlayerData, ClientUserInfo, CommonDefine, LegendRacePlayingInfo, TeamStadiumBorderLine, UserCircleData, UserCoinInfo, UserDailyLegendRacePlayingInfo, UserDailyRacePlayingInfo, UserHomePositionInfo, UserHonorInfo, UserJukeboxInfo, UserJukeboxRequestHistory, UserLimitedShopInfo, UserMenuBadgeInfo, UserRpInfo, UserSeasonPackInfo, UserTeamBuildingLoadInfo, UserTeamStadiumRanking, UserTeamStadiumRecord, UserTpInfo, Player, UserCardList, UserCharaList, UserSupportCardList, UserSupportCardDeck, UserTrainedChara, UserTeamStadiumData, UserItemList, UserCharaProfile, RewardItemInfo } from './types';
import { getPlayer, getPlayerBorderline, getUserCards, getUserCharas, getUserDecks, getUserItems, getUserProfile, getUserSupportCards, getUserTeamData, getUserTrainedCharas, getUserCharaProfiles, getUserPieces, countUserPresents } from './honseData';
import { getServerTime, formatTimestamp, formatServerTimestamp } from '../utils';
import { COMMON_DEFINE, RELEASED_CARD_ARRAY, SINGLE_MODE_DIFFICULTY_INFO_ARRAY, DEFAULT_PAYMENT_PURCHASED_TIMES_LIST } from './defaults';


export function getDefaultPlayerData(viewerId: number): Omit<Player, 'id'> {
    return {
        viewer_id: viewerId,
        coin: 500000,
        fcoin: 499999,
        optin_user_birth: 199001,
        rp: 5,
        tp: 100,
        tutorial_step: 0
    };
}


export function getClientSerializedData(viewerId: number): ClientPlayerData | null {
    const playerData = getPlayer(viewerId)
    if (!playerData) return null

    //const viewerIdStr = viewerId.toString();
    const now = new Date();
    const nowIso = formatTimestamp(now);
    const unixSeconds = getServerTime();

    // Fetch User Data from DB
    const dbUserProfile = getUserProfile(viewerId);
    
    // Check tutorial state
    const tutorialStep = dbUserProfile.tutorial_step;
    const isSignup = tutorialStep < 10;
    const isInTutorial = tutorialStep >= 10 && tutorialStep < 1000;
    //const isFull = tutorialStep >= 1000;

    const dbUserCards = getUserCards(viewerId);
    const dbUserCharas = getUserCharas(viewerId);
    const dbUserCharaProfiles = getUserCharaProfiles(viewerId);
    const dbUserItems = getUserItems(viewerId);
    const dbUserSupportCards = getUserSupportCards(viewerId);
    const dbUserDecks = getUserDecks(viewerId);
    const dbUserTrainedCharas = getUserTrainedCharas(viewerId);
    const dbUserTeamData = getUserTeamData(viewerId);

    const coinInfo: UserCoinInfo = isSignup ? [] as any : {
        coin: playerData.coin,
        fcoin: playerData.fcoin
    };

    const rpInfo: UserRpInfo = isSignup ? [] as any : {
        current_rp: playerData.rp,
        max_recovery_time: 0,// 0 if full, logic to implement later unixSeconds,
        max_rp: 5
    };

    const tpInfo: UserTpInfo = isSignup ? [] as any : {
        current_tp: playerData.tp,
        max_recovery_time: 0,// 0 if full, logic to implement later unixSeconds,
        max_tp: 100
    };


    const challengeMatchLoadInfo: ChallengeMatchLoadInfo = (isSignup || isInTutorial) ? [] as any : {
        challenge_match_id: 0,
        match_point: 0,
        resume_state: null,
        resume_trained_chara_id: null
    };

    const championsInfo: ChampionsMeetingInfo = isSignup ? [] as any : {
        champions_id: 7, // From JSON
        entry_times: 0,
        entry_trained_chara_id_array: [],
        free_entry_times: 0,
        league_type: 0,
        next_tier: 0,
        round_id: 0,
        state: 0
    };

    const circleInfo: CircleInfo | null = {
        circle_id: 0,
        name: ""
    };

    const circleUser: CircleUser = {
        circle_id: 0,
        join_time: dbUserProfile.create_time,
        last_check_post_id: 0,
        membership: 0,
        viewer_id: viewerId
    };

    const circleData: UserCircleData = isSignup ? [] as any : {
        circle_info: null,
        circle_user: circleUser
    };
    // JSON says circle_info: null. Type definition might need update if strict, but let's send empty object or fix type.
    // The type definition in types.ts says CircleInfo (not null). I will stick to empty object for now to satisfy type, or assume TS is loose.

    const homePositionInfo: UserHomePositionInfo = isSignup ? [] as any : {
        position1_chara_id: 1009,
        position1_cloth_id: 101,
        position2_chara_id: 1007,
        position2_cloth_id: 101,
        position3_chara_id: 1041,
        position3_cloth_id: 101,
        position4_chara_id: 1008,
        position4_cloth_id: 101
    };

    const honorInfo: UserHonorInfo = isSignup ? [] as any : {
        honor_list: [{ create_time: "1970-01-01 00:00:00", honor_id: 100101 }],
        last_checked_time: 0
    };

    const jukeboxInfo: UserJukeboxInfo = isSignup ? [] as any : {
        music_size: 0,
        next_random_request_time: "0000-00-00 00:00:00", // From JSON
        play_music_flag: 1,
        random_request_flag: 1,
        user_request_flag: 1
    };

    const jukeboxRequestHistory: UserJukeboxRequestHistory[] = [] /*{ 
        music_id: 0,
        request_id: 0,
        request_time: nowIso,
        request_type: 0,
        request_value: 0,
        requester_id: 0,
        requester_request_id: 0
    };*/

    const legendRacePlayingInfo: LegendRacePlayingInfo = isSignup ? [] as any : {
        group_id: 101906,
        legend_race_record_array: [{ is_cleared: 0, is_played: 0, legend_race_id: 31 }],
        next_group_id: null,
        state: 0,
        trained_chara_id: 0
    };

    const limitedShopInfo: UserLimitedShopInfo = {
        appear_flag: 0,
        close_time: 0,
        limited_exchange_id: 2,
        open_count: 0,
        open_flag: 0
    };

    const menuBadgeInfo: UserMenuBadgeInfo = (isSignup || isInTutorial) ? [] as any : {
        challenge_match_mission_num: 0,
        champions_mission_array: [],
        legend_mission_num: 0,
        mission_num: 4,
        new_gacha_flag: 1,
        present_num: countUserPresents(viewerId),
        team_building_mission_num: 0,
        training_challenge_mission_num: 0,
        view_limited_mission_num: 151
    };

    const ranking: UserTeamStadiumRanking = isSignup ? [] as any : {
        best_point: 0,
        rank: 0,
        team_class: 0,
        term_id: 20251229,
        viewer_id: viewerId
    };

    const seasonPackInfo: UserSeasonPackInfo = {
        notice_status: 0,
        product_master_id: 0,
        repurchase_time: 0,
        season_end_time: 0,
        ...(isInTutorial ? { buy_id: 0, expire_alert: 0 } : {})
    };

    const teamBuildingLoadInfo: UserTeamBuildingLoadInfo = isSignup ? [] as any : {
        captain_id: 0,
        state: 5,
        team_building_id: 0
    };

    const teamStadiumUser: UserTeamStadiumRecord = isSignup ? [] as any : {
        best_point: 0,
        best_team_class: 1,
        last_exec_batch: 20251222,
        team_class: 1,
        team_class_state: 0
    };

    const dailyRacePlayingInfo: UserDailyRacePlayingInfo = isSignup ? [] as any : {
        daily_race_record_array: [
             { daily_race_id: 1, is_cleared: 0, is_played: 0 },
             { daily_race_id: 2, is_cleared: 0, is_played: 0 },
             { daily_race_id: 3, is_cleared: 0, is_played: 0 },
             { daily_race_id: 5, is_cleared: 0, is_played: 0 },
             { daily_race_id: 6, is_cleared: 0, is_played: 0 },
             { daily_race_id: 7, is_cleared: 0, is_played: 0 }
        ],
        state: 0,
        trained_chara_id: 0
    };

    const dailyLegendRacePlayingInfo: UserDailyLegendRacePlayingInfo = isSignup ? [] as any : {
        daily_legend_race_record: [],
        new_flag: 0,
        state: 0,
        trained_chara_id: 0
    };

    const userInfo: ClientUserInfo = {
        best_team_evaluation_point: isInTutorial ? 2224 : dbUserProfile.best_team_evaluation_point,
        birth_day: dbUserProfile.birth_day,
        bonus_follow_num: dbUserProfile.bonus_follow_num,
        comment: dbUserProfile.comment,
        create_time: dbUserProfile.create_time,
        fan: isInTutorial ? 5 : dbUserProfile.fan,
        honor_id: dbUserProfile.honor_id,
        last_ticket_natural_recovery_time: dbUserProfile.last_ticket_natural_recovery_time,
        leader_chara_dress_id: dbUserProfile.leader_chara_dress_id,
        leader_chara_id: dbUserProfile.leader_chara_id,
        name: dbUserProfile.name,
        partner_chara_id: dbUserProfile.partner_chara_id,
        rank_score: isInTutorial ? 21000 : dbUserProfile.rank_score,
        register_time: dbUserProfile.register_time,
        sex: dbUserProfile.sex,
        support_card_id: 10010, //dbUserProfile.support_card_id,
        tutorial_step: dbUserProfile.tutorial_step,
        update_time: dbUserProfile.update_time,
        viewer_id: viewerId
    };

    // Transform Lists
    const cardList: UserCardList[] = isSignup ? [] : dbUserCards.map((c: any) => ({
        card_id: c.card_id,
        create_time: c.create_time,
        rarity: c.rarity,
        skill_data_array: JSON.parse(c.skill_data),
        talent_level: c.talent_level
    }));



    const charaList: UserCharaList[] = isSignup ? [] : dbUserCharas.map((c: any) => ({
        chara_id: c.chara_id,
        dress_id: c.dress_id,
        fan: c.fan,
        love_point: c.love_point,
        max_grade: c.max_grade,
        mini_dress_id: c.mini_dress_id,
        training_num: c.training_num
    }));

    let charaProfileList: UserCharaProfile[] = isSignup ? [] : dbUserCharaProfiles.map((cp: any) => ({
        chara_id: cp.chara_id,
        data_id: cp.data_id,
        new_flag: cp.new_flag
    }));

    if (isInTutorial) {
        charaProfileList = charaProfileList.filter(cp => !(cp.chara_id === 1009 && cp.data_id === 2 && cp.new_flag === 1));
    }

    let itemList: UserItemList[] = isSignup ? [] : dbUserItems.map((i: any) => ({
        item_id: i.item_id,
        number: i.number
    }));

    if (isInTutorial) {
        itemList = itemList.filter(i => (i.item_id === 59 || i.item_id === 110)).map(i => {
            if (i.item_id === 59) return { ...i, number: 10000 };
            return i;
        });
    }

    const supportCardList: UserSupportCardList[] = isSignup ? [] : dbUserSupportCards.map((s: any) => ({
        create_time: s.create_time,
        exp: isInTutorial ? 0 : s.exp,
        favorite_flag: s.favorite_flag,
        limit_break_count: s.limit_break_count,
        support_card_id: s.support_card_id, // interface has support_card_id? yes
        possess_time: s.possess_time || s.create_time,
        stock: s.stock || 0,
        viewer_id: viewerId
    }));
    // Note: UserSupportCardList in types.ts doesn't have support_card_id??
    // Line 191:
    /*
    export interface UserSupportCardList {
        create_time: string
        exp: number
        favorite_flag: number
        limit_break_count: number
    }
    */
    // It seems missing from the interface but present in JSON.
    // I should fix the interface or ignore TS error. I will fix interface later if needed, 
    // but for now I will just construct it. If TS complains I'll suppress or fix types.ts.

    const deckList: UserSupportCardDeck[] = isSignup ? [] : dbUserDecks.map((d: any) => ({
        deck_id: d.deck_id,
        name: d.name,
        support_card_id_array: JSON.parse(d.cards),
    }));

    let trainedCharaList: UserTrainedChara[] = isSignup ? [] : dbUserTrainedCharas.map((tc: any) => ({
        arrive_route_race_id: tc.arrive_route_race_id,
        card_id: tc.card_id,
        chara_grade: tc.chara_grade,
        chara_seed: tc.chara_seed,
        create_time: tc.create_time,
        factor_id_array: JSON.parse(tc.factor_id_array),
        factor_info_array: JSON.parse(tc.factor_info_array),
        fans: tc.fans,
        guts: tc.guts,
        is_locked: tc.is_locked,
        is_saved: tc.is_saved,
        nickname_id: tc.nickname_id,
        nickname_id_array: JSON.parse(tc.nickname_id_array),
        owner_trained_chara_id: tc.owner_trained_chara_id,
        owner_viewer_id: tc.owner_viewer_id,
        power: tc.power,
        proper_distance_long: tc.proper_distance_long,
        proper_distance_middle: tc.proper_distance_middle,
        proper_distance_mile: tc.proper_distance_mile,
        proper_distance_short: tc.proper_distance_short,
        proper_ground_dirt: tc.proper_ground_dirt,
        proper_ground_turf: tc.proper_ground_turf,
        proper_running_style_nige: tc.proper_running_style_nige,
        proper_running_style_oikomi: tc.proper_running_style_oikomi,
        proper_running_style_sashi: tc.proper_running_style_sashi,
        proper_running_style_senko: tc.proper_running_style_senko,
        race_cloth_id: tc.race_cloth_id,
        race_result_list: JSON.parse(tc.race_result_list),
        rank: tc.rank,
        rank_score: tc.rank_score,
        rarity: tc.rarity,
        register_time: tc.register_time,
        route_id: tc.route_id,
        running_style: tc.running_style,
        scenario_id: tc.scenario_id,
        single_mode_chara_id: tc.single_mode_chara_id,
        skill_array: JSON.parse(tc.skill_array),
        speed: tc.speed,
        stamina: tc.stamina,
        succession_chara_array: JSON.parse(tc.succession_chara_array),
        succession_history_array: JSON.parse(tc.succession_history_array),
        succession_num: tc.succession_num,
        succession_trained_chara_id_1: tc.succession_trained_chara_id_1,
        succession_trained_chara_id_2: tc.succession_trained_chara_id_2,
        support_card_list: JSON.parse(tc.support_card_list),
        talent_level: tc.talent_level,
        trained_chara_id: tc.trained_chara_id,
        use_type: tc.use_type,
        viewer_id: viewerId,
        win_saddle_id_array: JSON.parse(tc.win_saddle_id_array),
        wins: tc.wins,
        wiz: tc.wiz
    }));

    if (isInTutorial && trainedCharaList.length > 0) {
        trainedCharaList.pop(); // Remove the last one
    }

    const teamDataList: UserTeamStadiumData[] = isSignup ? [] : dbUserTeamData.map((td: any) => ({
        distance_type: td.distance_type,
        member_id: td.member_id,
        running_style: td.running_style,
        trained_chara_id: td.trained_chara_id
    }));

    const baseData = {
        border_line: [],//getPlayerBorderline(viewerId),
        card_dress_array: [],
        card_list: cardList,
        champions_info: championsInfo,
        chara_list: charaList,
        chara_profile_array: charaProfileList,
        character_story_data_list: [],
        circle_data: circleData,
        cloth_list: isSignup ? [] : [{ cloth_id: 101 }], // Default cloth
        coin_info: coinInfo,
        common_define: COMMON_DEFINE,
        country_type: 1,
        cygames_id_apply_product_flag: false,
        daily_legend_race_playing_info: dailyLegendRacePlayingInfo,
        daily_race_playing_info: dailyRacePlayingInfo,
        directory_card_array: [],
        dma_state: 1,
        event_data_array: [],
        extra_story_data_list: {"story_event": [], "story_extra": []},
        gacha_banner_info: [],
        gacha_campaign_info_array: [],
        home_position_info: homePositionInfo,
        home_poster_data_array: [],
        home_story_data_array: [],
        honor_info: honorInfo,
        is_linkage: 0,
        item_list: itemList,
        jukebox_info: jukeboxInfo,
        jukebox_request_history: jukeboxRequestHistory, // Cast to any to bypass array mismatch
        last_information_update_time: nowIso,
        last_select_support_card_deck_id: 1,
        legend_race_playing_info: legendRacePlayingInfo,
        login_trophy_info_array: [],
        main_story_data_list: [],
        menu_badge_info: menuBadgeInfo,
        music_list: [],
        notice_data: { button_type: 1, event_id: 0, notice_text: "", notice_title: "" },
        optin_user_birth: playerData.optin_user_birth,
        parental_consent: 0,
        payment_purchased_times_list: DEFAULT_PAYMENT_PURCHASED_TIMES_LIST,
        piece_list: isSignup ? [] : getUserPieces(viewerId),
        practice_partner_chara_array: [],
        practice_partner_owner_info_array: [],
        practice_race_state: 0,
        ranking: ranking,
        release_card_array: RELEASED_CARD_ARRAY,
        release_item_flag: 0,
        released_episode_data_array: [],
        res_version: isSignup ? "" : "10003850",
        rp_info: rpInfo,
        scenario_record_array: [],
        season_pack_info: seasonPackInfo,
        short_episode_data_array: [],
        single_mode_chara_light: [],
        single_mode_difficulty_info_array: SINGLE_MODE_DIFFICULTY_INFO_ARRAY,
        single_mode_rental_succession_num: 0,
        single_mode_succession_free_rental_time: 0,
        stadium_race_chara_id_array: [],
        story_favorite_array: [],
        support_card_deck_array: deckList,
        support_card_list: supportCardList,
        talk_gallery_list: [],
        team_building_load_info: teamBuildingLoadInfo,
        team_data_array: teamDataList,
        team_stadium_race_status: 0,
        team_stadium_user: teamStadiumUser,
        tp_info: tpInfo,
        trained_chara: trainedCharaList,
        trained_chara_favorite_array: [],
        training_challenge_exam_infos: null,
        training_challenge_user_info: null,
        tutorial_guide_data_array: [],
        user_birth: null,
        user_info: userInfo,
        user_last_checked_time_list: [],
        valentine_campaign_received_array: []
    }

    if (isSignup || isInTutorial) {
        return baseData;
    }

    return {
        ...baseData,
        add_friend_point: 0,
        added_gacha_stock_info: null,
        challenge_match_load_info: challengeMatchLoadInfo,
        cygames_id_serial_code_reward_info_array: [],
        fan_raid_first_flag: true,
        fan_raid_id: 0,
        limited_shop_info: limitedShopInfo,
        login_bonus_list: [ { login_bonus_id: 20001, total_count: 1 }, { login_bonus_id: 11001, total_count: 1 } ],
        recheck_dmm_jewel: "",
        single_mode_scenario_id_array: [1, 2],
        story_event_first_flag: true,
        story_event_id: 0,
        story_event_mission_list: [],
        story_event_roulette_coin_num: 0,
        support_user_num: 0,
        unread_announce_id_array: [30054, 30055]
    }
}

export function constructClientUserInfo(viewerId: number): { full: ClientUserInfo, minimal: ClientUserInfo } {
    const dbUserProfile = getUserProfile(viewerId);
    
    if (!dbUserProfile) {
        throw new Error(`User profile not found for viewer_id: ${viewerId}`);
    }

    const tutorialStep = dbUserProfile.tutorial_step;
    const isInTutorial = tutorialStep >= 10 && tutorialStep < 1000;

    // Use existing logic for specific fields
    const best_team_evaluation_point = isInTutorial ? 2224 : dbUserProfile.best_team_evaluation_point;
    const fan = isInTutorial ? 5 : dbUserProfile.fan;
    const rank_score = isInTutorial ? 21000 : dbUserProfile.rank_score;
    // Hardcoded in original: support_card_id: 10010
    const support_card_id = 10010; 

    const full: ClientUserInfo = {
        best_team_evaluation_point,
        birth_day: dbUserProfile.birth_day,
        bonus_follow_num: dbUserProfile.bonus_follow_num,
        bonus_trainer_point: dbUserProfile.bonus_trainer_point ?? 0,
        comment: dbUserProfile.comment,
        create_time: dbUserProfile.create_time,
        current_rp: dbUserProfile.current_rp ?? 0,
        directory_level: dbUserProfile.directory_level ?? 0,
        fan,
        honor_id: dbUserProfile.honor_id,
        last_information_checked_time: dbUserProfile.last_information_checked_time,
        last_ticket_natural_recovery_time: dbUserProfile.last_ticket_natural_recovery_time,
        leader_chara_dress_id: dbUserProfile.leader_chara_dress_id,
        leader_chara_id: dbUserProfile.leader_chara_id,
        max_rp_add_val: dbUserProfile.max_rp_add_val ?? 0,
        name: dbUserProfile.name,
        partner_chara_id: dbUserProfile.partner_chara_id,
        rank_score,
        register_time: dbUserProfile.register_time,
        rp_max_recovery_time: dbUserProfile.rp_max_recovery_time ?? 0,
        sex: dbUserProfile.sex,
        single_mode_play_count: dbUserProfile.single_mode_play_count ?? 0,
        support_card_id,
        team_stadium_win_count: dbUserProfile.team_stadium_win_count ?? 0,
        total_login_day_count: dbUserProfile.total_login_day_count ?? 0,
        total_login_day_count_check_time: dbUserProfile.total_login_day_count_check_time,
        tp_max_recovery_time: dbUserProfile.tp_max_recovery_time ?? 0,
        trainer_point: dbUserProfile.trainer_point ?? 0,
        tutorial_step: dbUserProfile.tutorial_step,
        update_time: dbUserProfile.update_time,
        viewer_id: viewerId
    };

    const minimal: ClientUserInfo = {
        best_team_evaluation_point: full.best_team_evaluation_point,
        birth_day: full.birth_day,
        bonus_follow_num: full.bonus_follow_num,
        comment: full.comment,
        create_time: full.create_time,
        fan: full.fan,
        honor_id: full.honor_id,
        last_ticket_natural_recovery_time: full.last_ticket_natural_recovery_time,
        leader_chara_dress_id: full.leader_chara_dress_id,
        leader_chara_id: full.leader_chara_id,
        name: full.name,
        partner_chara_id: full.partner_chara_id,
        rank_score: full.rank_score,
        register_time: full.register_time,
        sex: full.sex,
        support_card_id: full.support_card_id,
        tutorial_step: full.tutorial_step,
        update_time: full.update_time,
        viewer_id: full.viewer_id
    };

    return { full, minimal };
}

export function makeRewardItemInfo(data: Partial<RewardItemInfo> = {}): RewardItemInfo {
    return {
        add_card_bonus_info: data.add_card_bonus_info ?? null,
        add_card_list: data.add_card_list ?? [],
        add_chara_list: data.add_chara_list ?? [],
        add_cloth_list: data.add_cloth_list ?? [],
        add_fcoin: data.add_fcoin ?? 0,
        add_honor_list: data.add_honor_list ?? [],
        add_item_list: data.add_item_list ?? [],
        add_music_list: data.add_music_list ?? [],
        add_piece_list: data.add_piece_list ?? [],
        add_present_num: data.add_present_num ?? 0,
        add_story_id_array: data.add_story_id_array ?? [],
        add_support_card_list: data.add_support_card_list ?? [],
        add_support_card_num_array: data.add_support_card_num_array ?? [],
        add_total_fan: data.add_total_fan ?? 0,
        force_update_honor_id: data.force_update_honor_id ?? 0,
        new_chara_profile_array: data.new_chara_profile_array ?? []
    };
}

