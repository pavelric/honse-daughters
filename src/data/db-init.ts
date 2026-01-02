import { Database } from "better-sqlite3";

export default function init(
    database: Database,
    exists: Boolean
) {
    // Enable foreign keys constraints
    database.pragma('foreign_keys = ON');
    
    // Create Accounts table
    // Core identity table linking udid and viewer_id
    // viewer_id is INTEGER to match Account/Player interfaces (9+ digit ID)
    database.prepare(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            viewer_id INTEGER UNIQUE NOT NULL,
            udid TEXT UNIQUE NOT NULL,
            first_login_time TEXT NOT NULL
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS common_define (
            id INTEGER PRIMARY KEY,
            data TEXT NOT NULL
        )
    `).run();

    // Create Sessions table
    // Manages active login sessions
    database.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
            auth_key TEXT PRIMARY KEY,
            account_id INTEGER NOT NULL,
            viewer_id INTEGER NOT NULL,
            expires INTEGER NOT NULL,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            viewer_id INTEGER UNIQUE NOT NULL,
            coin INTEGER DEFAULT 0,
            fcoin INTEGER DEFAULT 0,
            optin_user_birth INTEGER DEFAULT 0,
            rp INTEGER DEFAULT 0,
            tp INTEGER DEFAULT 0,
            tutorial_step INTEGER DEFAULT 0,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // Create User Profiles table
    // Aggregates Player, ClientUserInfo, and ClientPlayerData settings.
    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            viewer_id INTEGER PRIMARY KEY,
            account_id INTEGER NOT NULL,
            name TEXT,
            comment TEXT,
            birth_day TEXT,
            sex INTEGER,
            rank_score INTEGER DEFAULT 0,
            fan INTEGER DEFAULT 0,
            tutorial_step INTEGER DEFAULT 0,
            leader_chara_id INTEGER,
            leader_chara_dress_id INTEGER,
            partner_chara_id INTEGER,
            support_card_id INTEGER,
            best_team_evaluation_point INTEGER DEFAULT 0,
            bonus_follow_num INTEGER DEFAULT 0,
            honor_id INTEGER DEFAULT 0,
            last_ticket_natural_recovery_time TEXT,
            register_time TEXT,
            create_time TEXT,
            update_time TEXT,
            bonus_trainer_point INTEGER DEFAULT 0,
            current_rp INTEGER DEFAULT 0,
            directory_level INTEGER DEFAULT 0,
            last_information_checked_time TEXT,
            max_rp_add_val INTEGER DEFAULT 0,
            rp_max_recovery_time INTEGER DEFAULT 0,
            single_mode_play_count INTEGER DEFAULT 0,
            team_stadium_win_count INTEGER DEFAULT 0,
            total_login_day_count INTEGER DEFAULT 0,
            total_login_day_count_check_time TEXT,
            tp_max_recovery_time INTEGER DEFAULT 0,
            trainer_point INTEGER DEFAULT 0,
            -- Additional Player/ClientPlayerData fields
            optin_user_birth INTEGER DEFAULT 0,
            parental_consent INTEGER DEFAULT 0,
            country_type INTEGER DEFAULT 0,
            dma_state INTEGER DEFAULT 0,
            is_linkage INTEGER DEFAULT 0,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // User Items (Inventory)
    // Maps item_id to quantity owned by user
    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_items (
            viewer_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            number INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, item_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_pieces (
            viewer_id INTEGER NOT NULL,
            piece_id INTEGER NOT NULL,
            piece_num INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, piece_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // User Cards (P-Cards / Playable Characters)
    // Represents unlocked characters/cards with their talent level and rarity
    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_cards (
            viewer_id INTEGER NOT NULL,
            card_id INTEGER NOT NULL,
            rarity INTEGER NOT NULL,
            talent_level INTEGER NOT NULL,
            exp INTEGER DEFAULT 0,
            create_time TEXT,
            skill_data TEXT, -- JSON stored as string
            PRIMARY KEY (viewer_id, card_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // User Charas (Character Relationship/Status)
    // Tracks affection, dress unlocks, and usage stats per character ID
    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_charas (
            viewer_id INTEGER NOT NULL,
            chara_id INTEGER NOT NULL,
            dress_id INTEGER,
            mini_dress_id INTEGER,
            love_point INTEGER DEFAULT 0,
            max_grade INTEGER DEFAULT 0,
            fan INTEGER DEFAULT 0,
            training_num INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, chara_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_chara_profiles (
            viewer_id INTEGER NOT NULL,
            chara_id INTEGER NOT NULL,
            data_id INTEGER NOT NULL,
            new_flag INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, chara_id, data_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_support_cards (
            viewer_id INTEGER NOT NULL,
            support_card_id INTEGER NOT NULL,
            exp INTEGER DEFAULT 0,
            limit_break_count INTEGER DEFAULT 0,
            favorite_flag INTEGER DEFAULT 0,
            create_time TEXT,
            possess_time TEXT,
            stock INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, support_card_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // Migration for existing tables
    try {
        database.prepare('ALTER TABLE user_support_cards ADD COLUMN possess_time TEXT').run();
    } catch (e) {}
    try {
        database.prepare('ALTER TABLE user_support_cards ADD COLUMN stock INTEGER DEFAULT 0').run();
    } catch (e) {}

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_trained_charas (
            arrive_route_race_id INTEGER,
            card_id INTEGER NOT NULL,
            chara_grade INTEGER,
            chara_seed INTEGER DEFAULT 0,
            create_time TEXT,
            factor_id_array TEXT, -- JSON array
            factor_info_array TEXT, -- JSON array
            fans INTEGER,
            guts INTEGER,
            is_locked INTEGER,
            is_saved INTEGER,
            nickname_id INTEGER,
            nickname_id_array TEXT, -- JSON array
            owner_trained_chara_id INTEGER,
            owner_viewer_id INTEGER,
            power INTEGER,
            proper_distance_long INTEGER,
            proper_distance_middle INTEGER,
            proper_distance_mile INTEGER,
            proper_distance_short INTEGER,
            proper_ground_dirt INTEGER,
            proper_ground_turf INTEGER,
            proper_running_style_nige INTEGER,
            proper_running_style_oikomi INTEGER,
            proper_running_style_sashi INTEGER,
            proper_running_style_senko INTEGER,
            race_cloth_id INTEGER,
            race_result_list TEXT, -- JSON array
            rank INTEGER,
            rank_score INTEGER,
            rarity INTEGER,
            register_time TEXT,
            route_id INTEGER,
            running_style INTEGER,
            scenario_id INTEGER,
            single_mode_chara_id INTEGER,
            skill_array TEXT, -- JSON array
            speed INTEGER,
            stamina INTEGER,
            succession_chara_array TEXT, -- JSON array
            succession_history_array TEXT, -- JSON array
            succession_num INTEGER,
            succession_trained_chara_id_1 INTEGER,
            succession_trained_chara_id_2 INTEGER,
            support_card_list TEXT, -- JSON array
            talent_level INTEGER,
            trained_chara_id INTEGER NOT NULL,
            use_type INTEGER,
            viewer_id INTEGER NOT NULL,
            win_saddle_id_array TEXT, -- JSON array
            wins INTEGER DEFAULT 0,
            wiz INTEGER,
            PRIMARY KEY (viewer_id, trained_chara_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_decks (
            viewer_id INTEGER NOT NULL,
            deck_id INTEGER NOT NULL,
            name TEXT,
            cards TEXT, -- JSON array of support_card_ids
            possess_time TEXT,
            stock INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, deck_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();
    
    // User Music (Jukebox unlocks)
    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_music (
            viewer_id INTEGER NOT NULL,
            music_id INTEGER NOT NULL,
            acquisition_time TEXT,
            PRIMARY KEY (viewer_id, music_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();
    
    // User Trophies/Titles
    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_trophies (
            viewer_id INTEGER NOT NULL,
            trophy_id INTEGER NOT NULL,
            acquisition_time TEXT,
            PRIMARY KEY (viewer_id, trophy_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_login_trophy_charas (
            viewer_id INTEGER NOT NULL,
            trophy_id INTEGER NOT NULL,
            chara_id INTEGER NOT NULL,
            PRIMARY KEY (viewer_id, trophy_id, chara_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // Circles
    database.prepare(`
        CREATE TABLE IF NOT EXISTS circles (
            id INTEGER PRIMARY KEY, -- circle_id
            name TEXT,
            create_time TEXT
        )
    `).run();

    // Circle Members
    database.prepare(`
        CREATE TABLE IF NOT EXISTS circle_members (
            circle_id INTEGER NOT NULL,
            viewer_id INTEGER NOT NULL,
            membership INTEGER NOT NULL, -- role
            join_time TEXT,
            item_request_end_time TEXT,
            penalty_end_time TEXT,
            ranking_result_check_time TEXT,
            last_check_post_id INTEGER,
            PRIMARY KEY (circle_id, viewer_id),
            FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE CASCADE,
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_jukebox_info (
            viewer_id INTEGER PRIMARY KEY,
            music_size INTEGER DEFAULT 0,
            next_random_request_time TEXT,
            play_music_flag INTEGER DEFAULT 0,
            random_request_flag INTEGER DEFAULT 0,
            user_request_flag INTEGER DEFAULT 0,
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_jukebox_request_history (
            viewer_id INTEGER NOT NULL,
            request_id INTEGER NOT NULL,
            music_id INTEGER NOT NULL,
            request_time TEXT,
            request_type INTEGER,
            request_value INTEGER,
            requester_id INTEGER,
            requester_request_id INTEGER,
            PRIMARY KEY (viewer_id, request_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS team_stadium_data (
            team_class INTEGER PRIMARY KEY,
            demotion_point INTEGER NOT NULL,
            demotion_rank INTEGER NOT NULL,
            keep_point INTEGER NOT NULL,
            keep_rank INTEGER NOT NULL,
            promotion_point INTEGER NOT NULL,
            promotion_rank INTEGER NOT NULL
        )
    `).run();

    database.prepare(`
        CREATE TABLE IF NOT EXISTS user_team_data (
            viewer_id INTEGER NOT NULL,
            distance_type INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            running_style INTEGER DEFAULT 0,
            trained_chara_id INTEGER DEFAULT 0,
            PRIMARY KEY (viewer_id, distance_type, member_id),
            FOREIGN KEY (viewer_id) REFERENCES accounts(viewer_id) ON DELETE CASCADE
        )
    `).run();

    // Create indexes for performance
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_accounts_udid ON accounts(udid)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_accounts_viewer_id ON accounts(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_auth_key ON sessions(auth_key)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_sessions_viewer_id ON sessions(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_players_viewer_id ON players(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_players_account_id ON players(account_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_trained_charas_viewer_id ON user_trained_charas(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_support_cards_viewer_id ON user_support_cards(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_cards_viewer_id ON user_cards(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_charas_viewer_id ON user_charas(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_decks_viewer_id ON user_decks(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_music_viewer_id ON user_music(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_user_trophies_viewer_id ON user_trophies(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_circle_members_viewer ON circle_members(viewer_id)`).run();
    database.prepare(`CREATE INDEX IF NOT EXISTS idx_jukebox_history_viewer ON user_jukebox_request_history(viewer_id)`).run();
}
