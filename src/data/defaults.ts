export const DEFAULT_USER_PROFILE = {
    best_team_evaluation_point: 1,
    bonus_trainer_point: 0,
    comment: "Let's have fun!",
    current_rp: 5,
    directory_level: 1,
    fan: 0,
    honor_id: 100101,
    last_information_checked_time: "0000-00-00 00:00:00",
    leader_chara_dress_id: 101,
    leader_chara_id: 1009,
    max_rp_add_val: 0,
    name: "Trainer",
    partner_chara_id: 1,
    rank_score: 0,
    rp_max_recovery_time: 0,
    sex: 1,
    single_mode_play_count: 0,
    support_card_id: 20021,
    team_stadium_win_count: 0,
    total_login_day_count: 0,
    total_login_day_count_check_time: "0000-00-00 00:00:00",
    tp_max_recovery_time: 0,
    trainer_point: 15,
    tutorial_step: 0
};

export const DEFAULT_USER_PROFILE_AFTER_TUTORIAL = {
    best_team_evaluation_point: 2224,
    comment: "Let's have fun!",
    fan: 747,
    honor_id: 100101,
    leader_chara_dress_id: 101,
    leader_chara_id: 1009,
    name: "Trainer",
    partner_chara_id: 1,
    rank_score: 21100,
    sex: 1,
    support_card_id: 10009,
    tutorial_step: 1000
};

export const DEFAULT_CARDS = [
    { card_id: 100701, rarity: 2, talent_level: 1 },
    { card_id: 100801, rarity: 2, talent_level: 1 },
    { card_id: 100901, rarity: 2, talent_level: 1 },
    { card_id: 104101, rarity: 1, talent_level: 1 },
    { card_id: 105201, rarity: 1, talent_level: 1 }
];

export const DEFAULT_CHARAS = [
    { chara_id: 1007, dress_id: 2, mini_dress_id: 2, fan: 1, love_point: 0, max_grade: 0, training_num: 0 },
    { chara_id: 1008, dress_id: 2, mini_dress_id: 2, fan: 1, love_point: 0, max_grade: 0, training_num: 0 },
    { chara_id: 1009, dress_id: 2, mini_dress_id: 2, fan: 743, love_point: 11, max_grade: 1, training_num: 0 },
    { chara_id: 1041, dress_id: 2, mini_dress_id: 2, fan: 1, love_point: 0, max_grade: 0, training_num: 0 },
    { chara_id: 1052, dress_id: 2, mini_dress_id: 2, fan: 1, love_point: 0, max_grade: 0, training_num: 0 }
];

export const DEFAULT_CHARA_PROFILES = [
    { chara_id: 1001, data_id: 1, new_flag: 0 },
    { chara_id: 1007, data_id: 1, new_flag: 0 },
    { chara_id: 1008, data_id: 1, new_flag: 0 },
    { chara_id: 1009, data_id: 1, new_flag: 0 },
    { chara_id: 1009, data_id: 2, new_flag: 1 },
    { chara_id: 1052, data_id: 1, new_flag: 0 },
    { chara_id: 9001, data_id: 7, new_flag: 0 }
];

export const DEFAULT_ITEMS = [
    { item_id: 59, number: 10500 },
    { item_id: 110, number: 10000 },
    { item_id: 96, number: 6 },
    { item_id: 97, number: 3 },
    { item_id: 168, number: 1 }
];

export const DEFAULT_SUPPORT_CARDS = [
    { support_card_id: 10001, exp: 60 },
    { support_card_id: 10002, exp: 60 },
    { support_card_id: 10003, exp: 60 },
    { support_card_id: 10005, exp: 0 },
    { support_card_id: 10009, exp: 0 },
    { support_card_id: 10010, exp: 60 },
    { support_card_id: 10027, exp: 0 },
    { support_card_id: 10032, exp: 0 },
    { support_card_id: 10049, exp: 0 },
    { support_card_id: 20021, exp: 60 }
];

// Based on the JSON, these seem to be the initial team members
// We will insert these as "UserTrainedChara" with some default stats
export const DEFAULT_TRAINED_CHARAS = [
    {
        "arrive_route_race_id": 0,
        "card_id": 100901,
        "chara_grade": 900,
        "chara_seed": 0,
        "create_time": "2025-12-29 22:40:14",
        "factor_id_array": [
            501,
            2201
        ],
        "factor_info_array": [
            {
                "factor_id": 501,
                "level": 0
            },
            {
                "factor_id": 2201,
                "level": 0
            }
        ],
        "fans": 1,
        "guts": 95,
        "is_locked": 0,
        "is_saved": 1,
        "nickname_id": 92,
        "nickname_id_array": [
            92
        ],
        "owner_trained_chara_id": 0,
        "owner_viewer_id": 0,
        "power": 79,
        "proper_distance_long": 6,
        "proper_distance_middle": 7,
        "proper_distance_mile": 7,
        "proper_distance_short": 2,
        "proper_ground_dirt": 1,
        "proper_ground_turf": 7,
        "proper_running_style_nige": 7,
        "proper_running_style_oikomi": 1,
        "proper_running_style_sashi": 3,
        "proper_running_style_senko": 7,
        "race_cloth_id": 101,
        "race_result_list": [
            {
                "ground_condition": 1,
                "popularity": 1,
                "prize_money": 0,
                "program_id": 1067,
                "result_rank": 1,
                "result_time": 100,
                "running_style": 1,
                "turn": 1,
                "weather": 1
            }
        ],
        "rank": 2,
        "rank_score": 507,
        "rarity": 2,
        "register_time": "2025-12-29 22:40:14",
        "route_id": 1,
        "running_style": 2,
        "scenario_id": 1,
        "single_mode_chara_id": 0,
        "skill_array": [
            {
                "level": 2,
                "skill_id": 10091
            }
        ],
        "speed": 84,
        "stamina": 77,
        "succession_chara_array": [
            {
                "card_id": 100701,
                "factor_id_array": [
                    201,
                    3401
                ],
                "factor_info_array": [
                    {
                        "factor_id": 201,
                        "level": 0
                    },
                    {
                        "factor_id": 3401,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 10,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 20,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 11,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 105201,
                "factor_id_array": [
                    401,
                    1201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 401,
                        "level": 0
                    },
                    {
                        "factor_id": 1201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 12,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100901,
                "factor_id_array": [
                    501,
                    2201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 501,
                        "level": 0
                    },
                    {
                        "factor_id": 2201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 21,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 22,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            }
        ],
        "succession_history_array": [],
        "succession_num": 0,
        "succession_trained_chara_id_1": 2,
        "succession_trained_chara_id_2": 4,
        "support_card_list": [
            {
                "exp": 1,
                "limit_break_count": 0,
                "position": 1,
                "support_card_id": 10001
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 2,
                "support_card_id": 10009
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 3,
                "support_card_id": 10027
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 4,
                "support_card_id": 10032
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 5,
                "support_card_id": 10049
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 6,
                "support_card_id": 10005
            }
        ],
        "talent_level": 1,
        "trained_chara_id": 1,
        "use_type": 0,
        "viewer_id": 0,
        "win_saddle_id_array": [],
        "wins": 0,
        "wiz": 90
    },
    {
        "arrive_route_race_id": 0,
        "card_id": 100701,
        "chara_grade": 900,
        "chara_seed": 0,
        "create_time": "2025-12-29 22:40:14",
        "factor_id_array": [
            201,
            3401
        ],
        "factor_info_array": [
            {
                "factor_id": 201,
                "level": 0
            },
            {
                "factor_id": 3401,
                "level": 0
            }
        ],
        "fans": 1,
        "guts": 77,
        "is_locked": 0,
        "is_saved": 1,
        "nickname_id": 92,
        "nickname_id_array": [
            92
        ],
        "owner_trained_chara_id": 0,
        "owner_viewer_id": 0,
        "power": 104,
        "proper_distance_long": 7,
        "proper_distance_middle": 7,
        "proper_distance_mile": 5,
        "proper_distance_short": 1,
        "proper_ground_dirt": 1,
        "proper_ground_turf": 7,
        "proper_running_style_nige": 1,
        "proper_running_style_oikomi": 7,
        "proper_running_style_sashi": 6,
        "proper_running_style_senko": 6,
        "race_cloth_id": 101,
        "race_result_list": [
            {
                "ground_condition": 1,
                "popularity": 1,
                "prize_money": 0,
                "program_id": 1068,
                "result_rank": 1,
                "result_time": 100,
                "running_style": 1,
                "turn": 1,
                "weather": 1
            }
        ],
        "rank": 2,
        "rank_score": 508,
        "rarity": 2,
        "register_time": "2025-12-29 22:40:14",
        "route_id": 1,
        "running_style": 4,
        "scenario_id": 1,
        "single_mode_chara_id": 0,
        "skill_array": [
            {
                "level": 2,
                "skill_id": 10071
            }
        ],
        "speed": 82,
        "stamina": 82,
        "succession_chara_array": [
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 10,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 105201,
                "factor_id_array": [
                    401,
                    1201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 401,
                        "level": 0
                    },
                    {
                        "factor_id": 1201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 20,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100901,
                "factor_id_array": [
                    501,
                    2201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 501,
                        "level": 0
                    },
                    {
                        "factor_id": 2201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 11,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 12,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 21,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 22,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            }
        ],
        "succession_history_array": [],
        "succession_num": 0,
        "succession_trained_chara_id_1": 4,
        "succession_trained_chara_id_2": 5,
        "support_card_list": [
            {
                "exp": 1,
                "limit_break_count": 0,
                "position": 1,
                "support_card_id": 10001
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 2,
                "support_card_id": 10009
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 3,
                "support_card_id": 10027
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 4,
                "support_card_id": 10032
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 5,
                "support_card_id": 10049
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 6,
                "support_card_id": 10005
            }
        ],
        "talent_level": 1,
        "trained_chara_id": 2,
        "use_type": 0,
        "viewer_id": 0,
        "win_saddle_id_array": [],
        "wins": 0,
        "wiz": 80
    },
    {
        "arrive_route_race_id": 0,
        "card_id": 104101,
        "chara_grade": 900,
        "chara_seed": 0,
        "create_time": "2025-12-29 22:40:14",
        "factor_id_array": [
            101,
            3101
        ],
        "factor_info_array": [
            {
                "factor_id": 101,
                "level": 0
            },
            {
                "factor_id": 3101,
                "level": 0
            }
        ],
        "fans": 1,
        "guts": 78,
        "is_locked": 0,
        "is_saved": 1,
        "nickname_id": 92,
        "nickname_id_array": [
            92
        ],
        "owner_trained_chara_id": 0,
        "owner_viewer_id": 0,
        "power": 90,
        "proper_distance_long": 1,
        "proper_distance_middle": 1,
        "proper_distance_mile": 6,
        "proper_distance_short": 7,
        "proper_ground_dirt": 1,
        "proper_ground_turf": 7,
        "proper_running_style_nige": 7,
        "proper_running_style_oikomi": 1,
        "proper_running_style_sashi": 2,
        "proper_running_style_senko": 7,
        "race_cloth_id": 101,
        "race_result_list": [
            {
                "ground_condition": 1,
                "popularity": 1,
                "prize_money": 0,
                "program_id": 676,
                "result_rank": 1,
                "result_time": 100,
                "running_style": 1,
                "turn": 1,
                "weather": 1
            }
        ],
        "rank": 2,
        "rank_score": 367,
        "rarity": 1,
        "register_time": "2025-12-29 22:40:14",
        "route_id": 1,
        "running_style": 2,
        "scenario_id": 1,
        "single_mode_chara_id": 0,
        "skill_array": [
            {
                "level": 1,
                "skill_id": 10411
            }
        ],
        "speed": 87,
        "stamina": 53,
        "succession_chara_array": [
            {
                "card_id": 100701,
                "factor_id_array": [
                    201,
                    3401
                ],
                "factor_info_array": [
                    {
                        "factor_id": 201,
                        "level": 0
                    },
                    {
                        "factor_id": 3401,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 10,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 20,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 11,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 105201,
                "factor_id_array": [
                    401,
                    1201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 401,
                        "level": 0
                    },
                    {
                        "factor_id": 1201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 12,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100901,
                "factor_id_array": [
                    501,
                    2201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 501,
                        "level": 0
                    },
                    {
                        "factor_id": 2201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 21,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 22,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            }
        ],
        "succession_history_array": [],
        "succession_num": 0,
        "succession_trained_chara_id_1": 2,
        "succession_trained_chara_id_2": 4,
        "support_card_list": [
            {
                "exp": 1,
                "limit_break_count": 0,
                "position": 1,
                "support_card_id": 10001
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 2,
                "support_card_id": 10009
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 3,
                "support_card_id": 10027
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 4,
                "support_card_id": 10032
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 5,
                "support_card_id": 10049
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 6,
                "support_card_id": 10005
            }
        ],
        "talent_level": 1,
        "trained_chara_id": 3,
        "use_type": 0,
        "viewer_id": 0,
        "win_saddle_id_array": [],
        "wins": 0,
        "wiz": 92
    },
    {
        "arrive_route_race_id": 0,
        "card_id": 100801,
        "chara_grade": 900,
        "chara_seed": 0,
        "create_time": "2025-12-29 22:40:14",
        "factor_id_array": [
            301,
            3201
        ],
        "factor_info_array": [
            {
                "factor_id": 301,
                "level": 0
            },
            {
                "factor_id": 3201,
                "level": 0
            }
        ],
        "fans": 1,
        "guts": 75,
        "is_locked": 0,
        "is_saved": 1,
        "nickname_id": 92,
        "nickname_id_array": [
            92
        ],
        "owner_trained_chara_id": 0,
        "owner_viewer_id": 0,
        "power": 110,
        "proper_distance_long": 2,
        "proper_distance_middle": 7,
        "proper_distance_mile": 7,
        "proper_distance_short": 2,
        "proper_ground_dirt": 1,
        "proper_ground_turf": 7,
        "proper_running_style_nige": 5,
        "proper_running_style_oikomi": 2,
        "proper_running_style_sashi": 7,
        "proper_running_style_senko": 6,
        "race_cloth_id": 101,
        "race_result_list": [
            {
                "ground_condition": 1,
                "popularity": 1,
                "prize_money": 0,
                "program_id": 1066,
                "result_rank": 1,
                "result_time": 100,
                "running_style": 1,
                "turn": 1,
                "weather": 1
            }
        ],
        "rank": 2,
        "rank_score": 509,
        "rarity": 2,
        "register_time": "2025-12-29 22:40:14",
        "route_id": 1,
        "running_style": 3,
        "scenario_id": 1,
        "single_mode_chara_id": 0,
        "skill_array": [
            {
                "level": 2,
                "skill_id": 10081
            }
        ],
        "speed": 96,
        "stamina": 55,
        "succession_chara_array": [
            {
                "card_id": 100901,
                "factor_id_array": [
                    501,
                    2201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 501,
                        "level": 0
                    },
                    {
                        "factor_id": 2201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 10,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 20,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100701,
                "factor_id_array": [
                    201,
                    3401
                ],
                "factor_info_array": [
                    {
                        "factor_id": 201,
                        "level": 0
                    },
                    {
                        "factor_id": 3401,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 11,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 12,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100701,
                "factor_id_array": [
                    201,
                    3401
                ],
                "factor_info_array": [
                    {
                        "factor_id": 201,
                        "level": 0
                    },
                    {
                        "factor_id": 3401,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 21,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 22,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            }
        ],
        "succession_history_array": [],
        "succession_num": 0,
        "succession_trained_chara_id_1": 1,
        "succession_trained_chara_id_2": 3,
        "support_card_list": [
            {
                "exp": 1,
                "limit_break_count": 0,
                "position": 1,
                "support_card_id": 10001
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 2,
                "support_card_id": 10009
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 3,
                "support_card_id": 10027
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 4,
                "support_card_id": 10032
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 5,
                "support_card_id": 10049
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 6,
                "support_card_id": 10005
            }
        ],
        "talent_level": 1,
        "trained_chara_id": 4,
        "use_type": 0,
        "viewer_id": 0,
        "win_saddle_id_array": [],
        "wins": 0,
        "wiz": 89
    },
    {
        "arrive_route_race_id": 0,
        "card_id": 105201,
        "chara_grade": 900,
        "chara_seed": 0,
        "create_time": "2025-12-29 22:40:14",
        "factor_id_array": [
            401,
            1201
        ],
        "factor_info_array": [
            {
                "factor_id": 401,
                "level": 0
            },
            {
                "factor_id": 1201,
                "level": 0
            }
        ],
        "fans": 1,
        "guts": 66,
        "is_locked": 0,
        "is_saved": 1,
        "nickname_id": 92,
        "nickname_id_array": [
            92
        ],
        "owner_trained_chara_id": 0,
        "owner_viewer_id": 0,
        "power": 111,
        "proper_distance_long": 1,
        "proper_distance_middle": 1,
        "proper_distance_mile": 6,
        "proper_distance_short": 7,
        "proper_ground_dirt": 7,
        "proper_ground_turf": 1,
        "proper_running_style_nige": 1,
        "proper_running_style_oikomi": 5,
        "proper_running_style_sashi": 7,
        "proper_running_style_senko": 1,
        "race_cloth_id": 101,
        "race_result_list": [
            {
                "ground_condition": 1,
                "popularity": 1,
                "prize_money": 0,
                "program_id": 931,
                "result_rank": 1,
                "result_time": 100,
                "running_style": 1,
                "turn": 1,
                "weather": 1
            }
        ],
        "rank": 2,
        "rank_score": 370,
        "rarity": 1,
        "register_time": "2025-12-29 22:40:14",
        "route_id": 1,
        "running_style": 3,
        "scenario_id": 1,
        "single_mode_chara_id": 0,
        "skill_array": [
            {
                "level": 1,
                "skill_id": 10521
            }
        ],
        "speed": 92,
        "stamina": 48,
        "succession_chara_array": [
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 10,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 20,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100901,
                "factor_id_array": [
                    501,
                    2201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 501,
                        "level": 0
                    },
                    {
                        "factor_id": 2201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 11,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 12,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100701,
                "factor_id_array": [
                    201,
                    3401
                ],
                "factor_info_array": [
                    {
                        "factor_id": 201,
                        "level": 0
                    },
                    {
                        "factor_id": 3401,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 21,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 22,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            }
        ],
        "succession_history_array": [],
        "succession_num": 0,
        "succession_trained_chara_id_1": 4,
        "succession_trained_chara_id_2": 3,
        "support_card_list": [
            {
                "exp": 1,
                "limit_break_count": 0,
                "position": 1,
                "support_card_id": 10001
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 2,
                "support_card_id": 10009
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 3,
                "support_card_id": 10027
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 4,
                "support_card_id": 10032
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 5,
                "support_card_id": 10049
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 6,
                "support_card_id": 10005
            }
        ],
        "talent_level": 1,
        "trained_chara_id": 5,
        "use_type": 0,
        "viewer_id": 0,
        "win_saddle_id_array": [],
        "wins": 0,
        "wiz": 83
    },
    {
        "arrive_route_race_id": 0,
        "card_id": 100901,
        "chara_grade": 900,
        "chara_seed": 0,
        "create_time": "2025-12-29 22:40:14",
        "factor_id_array": [
            101,
            3301,
            2005701
        ],
        "factor_info_array": [
            {
                "factor_id": 101,
                "level": 0
            },
            {
                "factor_id": 3301,
                "level": 0
            },
            {
                "factor_id": 2005701,
                "level": 0
            }
        ],
        "fans": 742,
        "guts": 115,
        "is_locked": 0,
        "is_saved": 1,
        "nickname_id": 92,
        "nickname_id_array": [
            92
        ],
        "owner_trained_chara_id": 0,
        "owner_viewer_id": 0,
        "power": 94,
        "proper_distance_long": 7,
        "proper_distance_middle": 7,
        "proper_distance_mile": 7,
        "proper_distance_short": 3,
        "proper_ground_dirt": 2,
        "proper_ground_turf": 7,
        "proper_running_style_nige": 7,
        "proper_running_style_oikomi": 1,
        "proper_running_style_sashi": 3,
        "proper_running_style_senko": 7,
        "race_cloth_id": 101,
        "race_result_list": [
            {
                "ground_condition": 1,
                "popularity": 1,
                "prize_money": 0,
                "program_id": 1067,
                "result_rank": 1,
                "result_time": 100,
                "running_style": 1,
                "turn": 1,
                "weather": 1
            }
        ],
        "rank": 3,
        "rank_score": 799,
        "rarity": 2,
        "register_time": "2025-12-29 22:40:14",
        "route_id": 3,
        "running_style": 2,
        "scenario_id": 1,
        "single_mode_chara_id": 0,
        "skill_array": [
            {
                "level": 2,
                "skill_id": 10091
            },
            {
                "level": 1,
                "skill_id": 200572
            }
        ],
        "speed": 100,
        "stamina": 82,
        "succession_chara_array": [
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 10,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100701,
                "factor_id_array": [
                    201,
                    3401
                ],
                "factor_info_array": [
                    {
                        "factor_id": 201,
                        "level": 0
                    },
                    {
                        "factor_id": 3401,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 20,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100901,
                "factor_id_array": [
                    501,
                    2201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 501,
                        "level": 0
                    },
                    {
                        "factor_id": 2201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 11,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 104101,
                "factor_id_array": [
                    101,
                    3101
                ],
                "factor_info_array": [
                    {
                        "factor_id": 101,
                        "level": 0
                    },
                    {
                        "factor_id": 3101,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 12,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 100801,
                "factor_id_array": [
                    301,
                    3201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 301,
                        "level": 0
                    },
                    {
                        "factor_id": 3201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 21,
                "rank": 2,
                "rarity": 2,
                "talent_level": 1,
                "win_saddle_id_array": []
            },
            {
                "card_id": 105201,
                "factor_id_array": [
                    401,
                    1201
                ],
                "factor_info_array": [
                    {
                        "factor_id": 401,
                        "level": 0
                    },
                    {
                        "factor_id": 1201,
                        "level": 0
                    }
                ],
                "owner_viewer_id": 0,
                "position_id": 22,
                "rank": 2,
                "rarity": 1,
                "talent_level": 1,
                "win_saddle_id_array": []
            }
        ],
        "succession_history_array": [],
        "succession_num": 0,
        "succession_trained_chara_id_1": 4,
        "succession_trained_chara_id_2": 2,
        "support_card_list": [
            {
                "exp": 1,
                "limit_break_count": 0,
                "position": 1,
                "support_card_id": 10001
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 2,
                "support_card_id": 10002
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 3,
                "support_card_id": 10003
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 4,
                "support_card_id": 10010
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 5,
                "support_card_id": 20021
            },
            {
                "exp": 0,
                "limit_break_count": 0,
                "position": 6,
                "support_card_id": 10005
            }
        ],
        "talent_level": 1,
        "trained_chara_id": 6,
        "use_type": 0,
        "viewer_id": 0,
        "win_saddle_id_array": [],
        "wins": 1,
        "wiz": 95
    }
];

export const DEFAULT_TEAM_DATA = [
    { distance_type: 1, member_id: 1, running_style: 2, trained_chara_id: 3 },
    { distance_type: 1, member_id: 2, running_style: 0, trained_chara_id: 0 },
    { distance_type: 1, member_id: 3, running_style: 0, trained_chara_id: 0 },
    { distance_type: 2, member_id: 1, running_style: 3, trained_chara_id: 4 },
    { distance_type: 2, member_id: 2, running_style: 0, trained_chara_id: 0 },
    { distance_type: 2, member_id: 3, running_style: 0, trained_chara_id: 0 },
    { distance_type: 3, member_id: 1, running_style: 2, trained_chara_id: 1 },
    { distance_type: 3, member_id: 2, running_style: 0, trained_chara_id: 0 },
    { distance_type: 3, member_id: 3, running_style: 0, trained_chara_id: 0 },
    { distance_type: 4, member_id: 1, running_style: 4, trained_chara_id: 2 },
    { distance_type: 4, member_id: 2, running_style: 0, trained_chara_id: 0 },
    { distance_type: 4, member_id: 3, running_style: 0, trained_chara_id: 0 },
    { distance_type: 5, member_id: 1, running_style: 3, trained_chara_id: 5 },
    { distance_type: 5, member_id: 2, running_style: 0, trained_chara_id: 0 },
    { distance_type: 5, member_id: 3, running_style: 0, trained_chara_id: 0 },
];

export const COMMON_DEFINE = {
    "champions_entry_cost_num": 30,
    "champions_entry_reset_time": 22,
    "champions_open_league_rank_max": 11,
    "champions_polling_interval": 1,
    "champions_stamp_max_display_num": 7,
    "champions_stamp_polling_interval": 3,
    "change_date_hour": 15,
    "charm_add_evaluation": 2,
    "circle_chat_post_partner_daily_max_count": 10,
    "circle_chat_post_partner_hold_count": 5,
    "coefficient_money_required_strength": 2,
    "cygames_id_open_date": "2025-02-14 12:00:00",
    "cygames_id_resign_url": "https://account.cygames.com/en/resign/",
    "daily_legend_race_ticket_max_num": 1,
    "daily_race_ticket_max_num": 6,
    "dress_change_open_date": "2022-05-30 12:00:00",
    "featured_stock_add_evaluation": 2,
    "group_support_card_open_date": "2022-03-18 12:00:00",
    "hint_lvup_open_date": "2022-03-07 12:00:00",
    "home_eat_open_date": "2022-02-24 12:00:00",
    "is_cygames_id_open": true,
    "item_request_expire": 8,
    "jukebox_open_date": "2021-11-15 12:00:00",
    "legend_race_ticket_max_num": 3,
    "max_circle_member_num": 30,
    "max_circle_scout_num": 30,
    "max_donate_count_day": 10,
    "max_donate_num_for_request": 2,
    "max_donate_num_total": 10,
    "max_follow_num": 20,
    "max_follower_num": 1000,
    "max_practice_partner_num": 50,
    "max_race_point": 9,
    "max_trainer_point": 999,
    "multi_reserve_open_date": "2022-2-24 12:00:00",
    "need_team_rank_play_champions": 4,
    "need_team_rank_play_circle": 5,
    "need_team_rank_play_daily_race": 2,
    "need_team_rank_play_practice_race": 5,
    "need_team_rank_play_room_match": 5,
    "new_single_mode_trained_chara_rental_max_num": 5,
    "new_single_mode_trained_chara_rental_open_time": 1768575600,
    "practice_race_create_partner_id_daily_max_count": 20,
    "practice_race_entry_chara_num_min": 9,
    "practice_race_entry_same_chara_num_max": 5,
    "practice_race_preset_entry_num_max": 18,
    "practice_race_preset_num_max": 10,
    "practice_race_preset_open_date": "2021-12-15 12:00:00",
    "practice_race_save_race_num_max": 5,
    "practice_race_sns_share_partner_expire_hour": 24,
    "practice_race_used_history_expire_day_count": 30,
    "practice_race_used_history_list_count_max": 100,
    "practice_recommend_list_reload_interval_ms": 3000,
    "present_history_limit": 100,
    "profile_card_open_date": "2022-04-22 12:00:00",
    "race_orientation_open_date": "2021-11-15 12:00:00",
    "race_point_recovery_calc_base": 50,
    "race_point_recovery_time": 7200,
    "race_point_recovery_unit_value": 1,
    "race_rich_open_date": "2022-02-24 12:00:00",
    "room_match_change_lock_reload_interval_ms": 1000,
    "room_match_entry_limit_time": 15,
    "room_match_force_start_time_min": 1,
    "room_match_force_start_time_sec": 10,
    "room_match_max_join_watch_num": 5,
    "room_match_max_saved_race_num": 5,
    "room_match_min_entry_num": 9,
    "room_match_preset_entry_num_max": 3,
    "room_match_preset_num_max": 5,
    "room_match_reload_interval_ms": 3000,
    "room_match_second_update": "2022-05-20 12:00:00",
    "serial_code_restrict_release_sec": 3600,
    "single_mode_free_auto_item_use_open_date": "2026-03-12 22:00:00",
    "single_mode_scenario_free_shop_item_motivation_up_condition_check_open_date": "2022-03-04 12:00:00",
    "single_mode_trained_chara_rental_max_num": 3,
    "single_mode_trainer_point_use_value": 3,     // test setting (live game: 30)
    "skill_upgrade_max_level": 3,
    "story_event_max_total_bonus": 200,
    "talk_gallery_open_date": "2022-02-14 12:00:00",
    "team_building_coin_pay_cost": 10,
    "team_building_free_continue_num": 5,
    "team_building_purchase_limit_num": 5,
    "team_stadium_reload_interval_ms": 3000,
    "team_stadium_support_card_bonus_max": 5000,
    "trained_chara_default_save_num": 230,
    "trained_chara_default_succession_num": 2,
    "trainer_point_recovery_calc_base": 1000,
    "trainer_point_recovery_time": 12,     // seconds per TP; test setting (live game: 600)
    "trainer_point_recovery_unit_value": 30,
    "update_tp_rp_limit_open_date": "2025-02-14 12:00:00"
};

export const RELEASED_CARD_ARRAY = [
    102701, 103201, 103501, 104101, 105201, 105601, 106001, 106101, 100701, 100801,
    100901, 101101, 101401, 101801, 102401, 104501, 100101, 100201, 100301, 100401,
    100601, 101001, 101301, 101501, 101701, 103001, 102601, 102301, 100302, 101302,
    103801, 105001, 104601, 101601, 102402, 101802, 102001, 101201, 101402, 101102,
    100501, 104001, 100102, 100402, 105801, 103701, 105602, 102801, 101901, 103002,
    104502, 103901, 102501, 101702, 104002, 104801, 105901
];

export const SINGLE_MODE_DIFFICULTY_INFO_ARRAY = [
    {
        box_id: 1,
        box_info_array: [
            {
                box_id: 1,
                reward_info_array: [
                    { difficulty_box_reward_id: 1, remain_num: 5 },
                    { difficulty_box_reward_id: 2, remain_num: 2 },
                    { difficulty_box_reward_id: 3, remain_num: 2 },
                    { difficulty_box_reward_id: 4, remain_num: 15 },
                    { difficulty_box_reward_id: 5, remain_num: 15 },
                    { difficulty_box_reward_id: 6, remain_num: 10 },
                    { difficulty_box_reward_id: 7, remain_num: 10 },
                    { difficulty_box_reward_id: 8, remain_num: 3 },
                    { difficulty_box_reward_id: 9, remain_num: 5 },
                    { difficulty_box_reward_id: 10, remain_num: 5 }
                ]
            },
            {
                box_id: 2,
                reward_info_array: [
                    { difficulty_box_reward_id: 11, remain_num: 0 },
                    { difficulty_box_reward_id: 12, remain_num: 0 },
                    { difficulty_box_reward_id: 13, remain_num: 0 },
                    { difficulty_box_reward_id: 14, remain_num: 0 },
                    { difficulty_box_reward_id: 15, remain_num: 0 },
                    { difficulty_box_reward_id: 16, remain_num: 0 },
                    { difficulty_box_reward_id: 17, remain_num: 0 },
                    { difficulty_box_reward_id: 18, remain_num: 0 },
                    { difficulty_box_reward_id: 19, remain_num: 0 },
                    { difficulty_box_reward_id: 20, remain_num: 0 }
                ]
            }
        ],
        box_item_num: 72,
        difficulty_id: 1001,
        gacha_gauge: 0,
        item_num: 0,
        open_difficulty_index: 1
    }
];

export const DEFAULT_PAYMENT_PURCHASED_TIMES_LIST = [
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1001",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1002",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1003",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1004",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1005",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1006",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 0,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item1007",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 3,
        "limit_type": 1,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item2001",
        "recommended_flag": 1,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 2,
        "limit_type": 1,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item2002",
        "recommended_flag": 1,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2025-12-10 14:59:59",
        "item_pack_id": 0,
        "limit": 3,
        "limit_type": 1,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item2004",
        "recommended_flag": 1,
        "start_date": "2025-11-03 22:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 9000,
        "limit": 1,
        "limit_type": 1,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item3001",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 9001,
        "limit": 1,
        "limit_type": 1,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item3002",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 9002,
        "limit": 1,
        "limit_type": 1,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item3003",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    },
    {
        "end_date": "2050-01-01 01:00:00",
        "item_pack_id": 0,
        "limit": 0,
        "limit_type": 3,
        "num_of_purchases": 0,
        "product_id": "com.cygames.umamusume.item4002",
        "recommended_flag": 0,
        "start_date": "2020-01-01 01:00:00"
    }
];

export const TUTORIAL_FINISH_TRAINED_CHARA = {
    arrive_route_race_id: 0,
    card_id: 100901,
    chara_grade: 900,
    chara_seed: 0,
    create_time: "2025-12-30 14:14:37",
    directory_ranking: 1,
    factor_id_array: [101, 3301, 2005701],
    factor_info_array: [
        { factor_id: 101, level: 0 },
        { factor_id: 3301, level: 0 },
        { factor_id: 2005701, level: 0 }
    ],
    fans: 742,
    guts: 115,
    is_locked: 0,
    is_saved: 1,
    nickname_id: 92,
    nickname_id_array: [92],
    owner_trained_chara_id: 0,
    owner_viewer_id: 0,
    power: 94,
    proper_distance_long: 7,
    proper_distance_middle: 7,
    proper_distance_mile: 7,
    proper_distance_short: 3,
    proper_ground_dirt: 2,
    proper_ground_turf: 7,
    proper_running_style_nige: 7,
    proper_running_style_oikomi: 1,
    proper_running_style_sashi: 3,
    proper_running_style_senko: 7,
    race_cloth_id: 101,
    race_result_list: [
        {
            ground_condition: 1,
            popularity: 1,
            prize_money: 0,
            program_id: 1067,
            result_rank: 1,
            result_time: 100,
            running_style: 1,
            turn: 1,
            weather: 1
        }
    ],
    rank: 3,
    rank_score: 799,
    rarity: 2,
    register_time: "",
    route_id: 3,
    running_style: 2,
    scenario_id: 1,
    single_mode_chara_id: 0,
    skill_array: [
        { level: 2, skill_id: 10091 },
        { level: 1, skill_id: 200572 }
    ],
    speed: 100,
    stamina: 82,
    succession_chara_array: [
        {
            card_id: 100801,
            factor_id_array: [301, 3201],
            factor_info_array: [{ factor_id: 301, level: 0 }, { factor_id: 3201, level: 0 }],
            owner_viewer_id: 0,
            position_id: 10,
            rank: 2,
            rarity: 2,
            talent_level: 1,
            win_saddle_id_array: []
        },
        {
            card_id: 100701,
            factor_id_array: [201, 3401],
            factor_info_array: [{ factor_id: 201, level: 0 }, { factor_id: 3401, level: 0 }],
            owner_viewer_id: 0,
            position_id: 20,
            rank: 2,
            rarity: 2,
            talent_level: 1,
            win_saddle_id_array: []
        },
        {
            card_id: 100901,
            factor_id_array: [501, 2201],
            factor_info_array: [{ factor_id: 501, level: 0 }, { factor_id: 2201, level: 0 }],
            owner_viewer_id: 0,
            position_id: 11,
            rank: 2,
            rarity: 2,
            talent_level: 1,
            win_saddle_id_array: []
        },
        {
            card_id: 104101,
            factor_id_array: [101, 3101],
            factor_info_array: [{ factor_id: 101, level: 0 }, { factor_id: 3101, level: 0 }],
            owner_viewer_id: 0,
            position_id: 12,
            rank: 2,
            rarity: 1,
            talent_level: 1,
            win_saddle_id_array: []
        },
        {
            card_id: 100801,
            factor_id_array: [301, 3201],
            factor_info_array: [{ factor_id: 301, level: 0 }, { factor_id: 3201, level: 0 }],
            owner_viewer_id: 0,
            position_id: 21,
            rank: 2,
            rarity: 2,
            talent_level: 1,
            win_saddle_id_array: []
        },
        {
            card_id: 105201,
            factor_id_array: [401, 1201],
            factor_info_array: [{ factor_id: 401, level: 0 }, { factor_id: 1201, level: 0 }],
            owner_viewer_id: 0,
            position_id: 22,
            rank: 2,
            rarity: 1,
            talent_level: 1,
            win_saddle_id_array: []
        }
    ],
    succession_history_array: [],
    succession_num: 0,
    succession_trained_chara_id_1: 4,
    succession_trained_chara_id_2: 2,
    support_card_list: [
        { exp: 1, limit_break_count: 0, position: 1, support_card_id: 10001 },
        { exp: 0, limit_break_count: 0, position: 2, support_card_id: 10002 },
        { exp: 0, limit_break_count: 0, position: 3, support_card_id: 10003 },
        { exp: 0, limit_break_count: 0, position: 4, support_card_id: 10010 },
        { exp: 0, limit_break_count: 0, position: 5, support_card_id: 20021 },
        { exp: 0, limit_break_count: 0, position: 6, support_card_id: 10005 }
    ],
    talent_level: 1,
    trained_chara_id: 6,
    use_type: 0,
    viewer_id: 0,
    win_saddle_id_array: [],
    wins: 1,
    wiz: 95
};

export const DEFAULT_SUPPORT_CARD_DATA_ARRAY = [
      {
        "create_time": "2025-12-30 14:03:29",
        "exp": 60,
        "favorite_flag": 0,
        "limit_break_count": 0,
        "possess_time": "2025-12-30 14:03:29",
        "stock": 0,
        "support_card_id": 10001,
        "viewer_id": 857736024869
      },
      {
        "create_time": "2025-12-30 14:03:29",
        "exp": 60,
        "favorite_flag": 0,
        "limit_break_count": 0,
        "possess_time": "2025-12-30 14:03:29",
        "stock": 0,
        "support_card_id": 10002,
        "viewer_id": 857736024869
      },
      {
        "create_time": "2025-12-30 14:03:29",
        "exp": 60,
        "favorite_flag": 0,
        "limit_break_count": 0,
        "possess_time": "2025-12-30 14:03:29",
        "stock": 0,
        "support_card_id": 10003,
        "viewer_id": 857736024869
      },
      {
        "create_time": "2025-12-30 14:03:29",
        "exp": 60,
        "favorite_flag": 0,
        "limit_break_count": 0,
        "possess_time": "2025-12-30 14:03:29",
        "stock": 0,
        "support_card_id": 10010,
        "viewer_id": 857736024869
      },
      {
        "create_time": "2025-12-30 14:03:29",
        "exp": 60,
        "favorite_flag": 0,
        "limit_break_count": 0,
        "possess_time": "2025-12-30 14:03:29",
        "stock": 0,
        "support_card_id": 20021,
        "viewer_id": 857736024869
      }
]