export interface Account {
    id: number // internal id
    first_login_time: string
    udid: string
    viewer_id: number // also used as the player's "public" id
}

export interface Session {
    auth_key: string
    expires: number // Unix timestamp (seconds)
    accountId: number // account.id
    viewer_id: number // account.viewer_id
}

export interface Player {
    id: number // internal id
    viewer_id: number // account.viewer_id
    coin: number // premium currency paid for
    fcoin: number // premium currency earned
    optin_user_birth: number
    rp: number
    tp: number
    tutorial_step: number
}


// Client Types: used by the honse game client
// TODO

export interface ClientUserInfo {
    best_team_evaluation_point: number
    birth_day: string
    bonus_follow_num: number
    bonus_trainer_point?: number
    comment: string
    create_time: string
    current_rp?: number
    directory_level?: number // 1 in general
    fan: number
    honor_id: number
    last_information_checked_time?: string // "0000-00-00 00:00:00" if never checked
    last_ticket_natural_recovery_time: string // "0000-00-00 00:00:00" if never recovered
    leader_chara_dress_id: number
    leader_chara_id: number
    max_rp_add_val?: number // 0
    name: string
    partner_chara_id: number
    rank_score: number
    register_time: string
    rp_max_recovery_time?: number // raw timestamp
    sex: number
    single_mode_play_count?: number
    support_card_id: number
    team_stadium_win_count?: number
    total_login_day_count?: number
    total_login_day_count_check_time?: string // "0000-00-00 00:00:00" if never checked
    tp_max_recovery_time?: number // raw timestamp
    trainer_point?: number
    tutorial_step: number
    update_time: string
    viewer_id: number
}

export interface ClientPlayerData {
    // should be used to construct the /load/index response body
    add_friend_point?: number
    added_gacha_stock_info?: unknown
    border_line: TeamStadiumBorderLine[]
    card_dress_array: unknown[]
    card_list: UserCardList[]
    challenge_match_load_info?: ChallengeMatchLoadInfo
    champions_info: ChampionsMeetingInfo
    chara_list: UserCharaList[]
    chara_profile_array: UserCharaProfile[]
    character_story_data_list: CharacterStoryData[]
    circle_data: UserCircleData
    cloth_list: UserClothList[]
    coin_info: UserCoinInfo
    common_define: CommonDefine
    country_type: number
    cygames_id_apply_product_flag: boolean
    cygames_id_serial_code_reward_info_array?: unknown[]
    daily_legend_race_playing_info: UserDailyLegendRacePlayingInfo
    daily_race_playing_info: UserDailyRacePlayingInfo
    directory_card_array: UserDirectoryCard[]
    dma_state: number
    event_data_array: UserEventData[]
    extra_story_data_list: UserExtraStoryData
    fan_raid_first_flag?: boolean
    fan_raid_id?: number
    gacha_banner_info: GachaBannerInfo[]
    gacha_campaign_info_array: unknown[]
    home_position_info: UserHomePositionInfo
    home_poster_data_array: UserHomePosterData[]
    home_story_data_array: UserHomeStoryData[]
    honor_info: UserHonorInfo
    is_linkage: number
    item_list: UserItemList[]
    jukebox_info: UserJukeboxInfo
    jukebox_request_history: UserJukeboxRequestHistory[]
    last_information_update_time: string
    last_select_support_card_deck_id: number
    legend_race_playing_info: LegendRacePlayingInfo
    limited_shop_info?: UserLimitedShopInfo
    login_bonus_list?: unknown[]
    login_trophy_info_array: UserLoginTrophyInfo[]
    main_story_data_list: UserMainStoryData[]
    menu_badge_info: UserMenuBadgeInfo
    music_list: UserMusicList[]
    notice_data: NoticeData
    optin_user_birth: number
    parental_consent: number
    payment_purchased_times_list: UserPaymentPurchasedTimes[]
    piece_list: UserPieceList[]
    practice_partner_chara_array: UserTrainedChara[]
    practice_partner_owner_info_array: UserPracticePartnerOwnerInfo[]
    practice_race_state: number
    ranking: UserTeamStadiumRanking
    recheck_dmm_jewel?: string
    release_card_array: number[]
    release_item_flag: number
    released_episode_data_array: EpisodeData[]
    res_version: string
    rp_info: UserRpInfo
    scenario_record_array: UserScenarioRecord[]
    season_pack_info: UserSeasonPackInfo
    short_episode_data_array: EpisodeData[]
    single_mode_chara_light: unknown[]
    single_mode_difficulty_info_array: UserSingleModeDifficultyInfo[]
    single_mode_rental_succession_num: number
    single_mode_scenario_id_array?: number[]
    single_mode_succession_free_rental_time: number
    stadium_race_chara_id_array: number[]
    story_event_first_flag?: boolean
    story_event_id?: number
    story_event_mission_list?: UserStoryEventMissionList[]
    story_event_roulette_coin_num?: number
    story_favorite_array: unknown[]
    support_card_deck_array: UserSupportCardDeck[]
    support_card_list: UserSupportCardList[]
    support_user_num?: number
    talk_gallery_list: UserTalkGalleryList[]
    team_building_load_info: UserTeamBuildingLoadInfo
    team_data_array: UserTeamStadiumData[]
    team_stadium_race_status: number
    team_stadium_user: UserTeamStadiumRecord
    tp_info: UserTpInfo
    trained_chara: UserTrainedChara[]
    trained_chara_favorite_array: UserTrainedCharaFavorite[]
    training_challenge_exam_infos: unknown
    training_challenge_user_info: unknown
    tutorial_guide_data_array: TutorialGuideData[]
    unread_announce_id_array?: number[]
    user_birth: string | null
    user_info: ClientUserInfo
    user_last_checked_time_list: UserLastCheckedTimeList[]
    valentine_campaign_received_array: unknown[]
}

export interface UserLastCheckedTimeList {
    last_checked_time: number
    type: number
}



export interface TutorialGuideData {
    id: number
}

export interface UserTrainedCharaFavorite {
    icon_type: number
    memo: string
    trained_chara_id: number
}

export interface UserTeamStadiumRecord {
    best_point: number
    best_team_class: number
    last_exec_batch: number
    team_class: number
    team_class_state: number
}


export interface UserTeamStadiumData {
    distance_type: number
    member_id: number
    running_style: number
    trained_chara_id: number
}

export interface UserTeamBuildingLoadInfo {
    captain_id: number
    state: number
    team_building_id: number
}


export interface UserTalkGalleryList {
    home_story_trigger_id: number
    new_flag: number
}


export interface UserSupportCardList {
    create_time: string
    exp: number
    favorite_flag: number
    limit_break_count: number
    possess_time: string
    stock: number
}


export interface UserSupportCardDeck {
    deck_id: number
    name: string
    support_card_id_array: number[]
}


export interface UserStoryEventMissionList {
    event_id: number
    exec_count: number
    mission_id: number
    mission_status: number
    mission_type: number
}


export interface UserSingleModeDifficultyInfo {
    box_id: number
    box_info_array: UserSingleModeDifficultyBoxInfo[]
    box_item_num: number
    difficulty_id: number
    gacha_gauge: number
    item_num: number
    open_difficulty_index: number
}

export interface UserSingleModeDifficultyBoxInfo {
    box_id: number
    reward_info_array: UserSingleModeDifficultyRewardInfo[]
}

export interface UserSingleModeDifficultyRewardInfo {
    difficulty_box_reward_id: number
    remain_num: number
}


export interface UserSeasonPackInfo {
    buy_id?: number
    expire_alert?: number
    notice_status: number
    product_master_id: number
    repurchase_time: number
    season_end_time: number
}

export interface UserScenarioRecord {
    directory_ranking: number
    scenario_id: number
    trained_chara: UserTrainedChara
}


export interface EpisodeData {
    id: number
}


export interface UserTeamStadiumRanking {
    best_point: number
    rank: number
    team_class: number
    term_id: number
    viewer_id: number
}

export interface UserPracticePartnerOwnerInfo {
    friend_state: number
    owner_name: string
    owner_trained_chara_id: number
    owner_viewer_id: number
    partner_trained_chara_id: number
}

export interface UserPracticePartnerChara extends Omit<UserTrainedChara, 'directory_ranking'> {
    //arrive_route_race_id: number
    register_time: string
    use_type: number
    wins: number
}


export interface UserPieceList {
    piece_id: number
    piece_num: number
}


export interface UserPaymentPurchasedTimes {
    end_date: string
    item_pack_id: number
    limit: number
    limit_type: number
    num_of_purchases: number
    product_id: string
    recommended_flag: number
    start_date: string
}


export interface NoticeData {
    button_type: number
    event_id: number
    notice_text: string
    notice_title: string
}


export interface UserMusicList {
    acquisition_time: string
    music_id: number
}


export interface UserMenuBadgeInfo {
    challenge_match_mission_num: number
    champions_mission_array: unknown[]
    legend_mission_num: number
    mission_num: number
    new_gacha_flag: number
    present_num: number
    team_building_mission_num: number
    training_challenge_mission_num: number
    view_limited_mission_num: number
}


export interface UserMainStoryData {
    episode_id: number
    state: number
}

export interface UserLoginTrophyInfo {
    chara_id_array: number[]
    trophy_id: number
}


export interface UserLimitedShopInfo {
    appear_flag: number
    close_time: number
    limited_exchange_id: number
    open_count: number
    open_flag: number
}

export interface LegendRacePlayingInfo {
    group_id: number
    legend_race_record_array: UserLegendRaceRecord[]
    next_group_id: number | null
    state: number
    trained_chara_id: number
}

export interface UserLegendRaceRecord {
    is_cleared: number
    is_played: number
    legend_race_id: number
}

export interface UserJukeboxInfo {
    music_size: number
    next_random_request_time: string
    play_music_flag: number
    random_request_flag: number
    user_request_flag: number
}

export interface UserJukeboxRequestHistory {
    music_id: number
    request_id: number
    request_time: string
    request_type: number
    request_value: number
    requester_id: number
    requester_request_id: number
}

export interface UserItemList {
    item_id: number
    number: number
}

export interface UserHonorInfo {
    honor_list: UserHonorData[]
    last_checked_time: number
}

export interface UserHonorData {
    create_time: string
    honor_id: number
}

export interface UserHomePosterData {
    id: number
}


export interface UserHomeStoryData {
    id: number
}

export interface UserHomePositionInfo {
    position1_chara_id: number
    position1_cloth_id: number
    position2_chara_id: number
    position2_cloth_id: number
    position3_chara_id: number
    position3_cloth_id: number
    position4_chara_id: number
    position4_cloth_id: number
}


export interface GachaBannerInfo {
    id: number
}

export interface UserExtraStoryData {
    story_event: UserStoryEventData[]
    story_extra: UserStoryEventData[]
}

export interface UserStoryEventData {
    episode_id: number
    state: number
}


export interface UserEventData {
    chara_id: number
    create_time: string
    data_id: number
    new_flag: number
}


export interface UserDirectoryCard {
    card_id: number
    directory_ranking: number
    trained_chara: UserDCTrainedChara[]
}


export interface UserTrainedChara {
    arrive_route_race_id: number
    card_id: number
    chara_grade: number
    chara_seed: number
    create_time: string
    factor_id_array: number[]
    factor_info_array: UserFactorInfo[]
    fans: number
    guts: number
    is_locked: number
    is_saved: number
    nickname_id: number
    nickname_id_array: number[]
    owner_trained_chara_id: number
    owner_viewer_id: number
    power: number
    proper_distance_long: number
    proper_distance_short: number
    proper_distance_middle: number
    proper_distance_mile: number
    proper_ground_dirt: number
    proper_ground_turf: number
    proper_running_style_nige: number
    proper_running_style_oikomi: number
    proper_running_style_sashi: number
    proper_running_style_senko: number
    race_cloth_id: number
    race_result_list: TrainedCharaRaceResult[]
    rank: number
    rank_score: number
    rarity: number
    register_time: string
    route_id: number
    running_style: number
    scenario_id: number
    single_mode_chara_id: number
    skill_array: TrainedCharaSkill[]
    speed: number
    stamina: number
    succession_chara_array: TrainedCharaSuccessionChara[]
    succession_history_array: TrainedCharaSuccessionHistory[]
    succession_num: number
    succession_trained_chara_id_1: number
    succession_trained_chara_id_2: number
    support_card_list: TrainedCharaSupportCard[]
    talent_level: number
    trained_chara_id?: number
    use_type: number
    viewer_id?: number
    win_saddle_id_array: number[]
    wins: number
    wiz: number
}

export interface UserDCTrainedChara extends UserTrainedChara {
    directory_ranking: number
}

export interface TrainedCharaSupportCard {
    exp: number
    limit_break_count: number
    position: number
    support_card_id: number
}

export interface TrainedCharaSuccessionChara {
    card_id: number
    factor_id_array: number[]
    factor_info_array: UserFactorInfo[]
    owner_viewer_id: number
    position_id: number
    rank: number
    rarity: number
    talent_level: number
    win_saddle_id_array: number[]
}

export interface TrainedCharaSuccessionHistory {
    circle_name: string,
    date: string,
    history_type: number,
    id: number,
    rental_viewer_id: number,
    succession_card_id: number,
    trained_chara_id: number,
    user_name: string,
    viewer_id: number
}

export interface TrainedCharaSkill {
    level: number
    skill_id: number
}

export interface TrainedCharaRaceResult {
    ground_condition: number
    popularity: number
    prize_money: number
    program_id: number
    result_rank: number
    result_time: number
    running_style: number
    turn: number
    weather: number
}

export interface UserFactorInfo {
    factor_id: number
    level: number
}


export interface UserDailyRacePlayingInfo {
    daily_race_record_array: UserDailyRaceRecord[]
    state: number
    trained_chara_id: number
}

export interface UserDailyRaceRecord {
    daily_race_id: number
    is_cleared: number
    is_played: number
}

export interface UserDailyLegendRacePlayingInfo {
    daily_legend_race_record: unknown[],
    new_flag: number
    state: number
    trained_chara_id: number
}

export interface CommonDefine {
    champions_entry_cost_num: number
    champions_entry_reset_time: number
    champions_open_league_rank_max: number,
    champions_polling_interval: number,
    champions_stamp_max_display_num: number,
    champions_stamp_polling_interval: number,
    change_date_hour: number,
    charm_add_evaluation: number,
    circle_chat_post_partner_daily_max_count: number,
    circle_chat_post_partner_hold_count: number,
    coefficient_money_required_strength: number,
    cygames_id_open_date: string,
    cygames_id_resign_url: string,
    daily_legend_race_ticket_max_num: number,
    daily_race_ticket_max_num: number,
    dress_change_open_date: string,
    featured_stock_add_evaluation: number,
    group_support_card_open_date: string,
    hint_lvup_open_date: string,
    home_eat_open_date: string,
    is_cygames_id_open: boolean,
    item_request_expire: number,
    jukebox_open_date: string,
    legend_race_ticket_max_num: number,
    max_circle_member_num: number,
    max_circle_scout_num: number,
    max_donate_count_day: number,
    max_donate_num_for_request: number,
    max_donate_num_total: number,
    max_follow_num: number,
    max_follower_num: number,
    max_practice_partner_num: number,
    max_race_point: number,
    max_trainer_point: number,
    multi_reserve_open_date: string,
    need_team_rank_play_champions: number,
    need_team_rank_play_circle: number,
    need_team_rank_play_daily_race: number,
    need_team_rank_play_practice_race: number,
    need_team_rank_play_room_match: number,
    new_single_mode_trained_chara_rental_max_num: number,
    new_single_mode_trained_chara_rental_open_time: number,
    practice_race_create_partner_id_daily_max_count: number,
    practice_race_entry_chara_num_min: number,
    practice_race_entry_same_chara_num_max: number,
    practice_race_preset_entry_num_max: number,
    practice_race_preset_num_max: number,
    practice_race_preset_open_date: string,
    practice_race_save_race_num_max: number,
    practice_race_sns_share_partner_expire_hour: number,
    practice_race_used_history_expire_day_count: number,
    practice_race_used_history_list_count_max: number,
    practice_recommend_list_reload_interval_ms: number,
    present_history_limit: number,
    profile_card_open_date: string,
    race_orientation_open_date: string,
    race_point_recovery_calc_base: number,
    race_point_recovery_time: number,
    race_point_recovery_unit_value: number,
    race_rich_open_date: string,
    room_match_change_lock_reload_interval_ms: number,
    room_match_entry_limit_time: number,
    room_match_force_start_time_min: number,
    room_match_force_start_time_sec: number,
    room_match_max_join_watch_num: number,
    room_match_max_saved_race_num: number,
    room_match_min_entry_num: number,
    room_match_preset_entry_num_max: number,
    room_match_preset_num_max: number,
    room_match_reload_interval_ms: number,
    room_match_second_update: string,
    serial_code_restrict_release_sec: number,
    single_mode_free_auto_item_use_open_date: string,
    single_mode_scenario_free_shop_item_motivation_up_condition_check_open_date: string,
    single_mode_trained_chara_rental_max_num: number,
    single_mode_trainer_point_use_value: number,
    skill_upgrade_max_level: number,
    story_event_max_total_bonus: number,
    talk_gallery_open_date: string,
    team_building_coin_pay_cost: number,
    team_building_free_continue_num: number,
    team_building_purchase_limit_num: number,
    team_stadium_reload_interval_ms: number,
    team_stadium_support_card_bonus_max: number,
    trained_chara_default_save_num: number,
    trained_chara_default_succession_num: number,
    trainer_point_recovery_calc_base: number,
    trainer_point_recovery_time: number,
    trainer_point_recovery_unit_value: number,
    update_tp_rp_limit_open_date: string
}



export interface UserCoinInfo {
    coin: number
    fcoin: number
}


export interface UserClothList {
    cloth_id: number
}


export interface UserCircleData {
    circle_info: CircleInfo | null
    circle_user: CircleUser
}

export interface CircleInfo {
    circle_id: number
    name: string
}

export interface CircleUser {
    circle_id: number
    item_request_end_time?: string
    join_time: string
    last_check_post_id: number
    membership: number
    penalty_end_time?: string
    ranking_result_check_time?: string
    viewer_id: number
}



export interface CharacterStoryData {
    episode_id: number
    state: number
}


export interface ChampionsMeetingInfo {
    champions_id: number
    entry_times: number
    entry_trained_chara_id_array: number[]
    free_entry_times: number
    league_type: number
    next_tier: number
    round_id: number
    state: number
}

export interface ChallengeMatchLoadInfo {
    challenge_match_id: number
    match_point: number
    resume_state: unknown
    resume_trained_chara_id: unknown
}


export interface UserCardList {
    card_id: number
    create_time: string
    rarity: number
    skill_data_array: unknown[]
    talent_level: number
}


export interface UserCharaList {
    chara_id: number
    dress_id: number
    fan: number
    love_point: number
    max_grade: number
    mini_dress_id: number
    training_num: number
}

export interface UserCharaProfile {
    chara_id: number
    data_id: number
    new_flag: number
}

export interface TeamStadiumBorderLine {
    demotion_point: number
    demotion_rank: number
    keep_point: number
    keep_rank: number
    promotion_point: number
    promotion_rank: number
}

export interface UserRpInfo {
    current_rp: number
    max_recovery_time: number
    max_rp: number
}

export interface UserTpInfo {
    current_tp: number
    max_recovery_time: number
    max_tp: number
}

export interface LovePointInfo {
    chara_id: number
    love_point_after: number
    love_point_before: number
}

export interface RewardItemInfo {
    add_card_bonus_info: unknown
    add_card_list: unknown[]
    add_chara_list: unknown[]
    add_cloth_list: unknown[]
    add_fcoin: number
    add_honor_list: unknown[]
    add_item_list: UserItemList[]
    add_music_list: unknown[]
    add_piece_list: unknown[]
    add_present_num: number
    add_story_id_array: unknown[]
    add_support_card_list: unknown[]
    add_support_card_num_array: unknown[]
    add_total_fan: number
    force_update_honor_id: number
    new_chara_profile_array: unknown[]
}
