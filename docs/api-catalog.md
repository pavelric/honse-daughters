# Umamusume client API catalog

Generated from the restored 1.35.2 client (`libil2cpp.v2.so` and the decoded `global-metadata.dat`, metadata v31). A custom dumper was used because Il2CppDumper was not installed: `REA-Projects/umamusume/decoded/tools/il2cpp_dump.py`. Paths come from code cross-references. Each URL literal is loaded by exactly one `Gallop.<X>Task::Send`, and that task belongs to `Gallop.<X>Request : RequestBase<<X>Response>`. Raw dump: `REA-Projects/umamusume/decoded/il2cppdump/`. Regenerate this file with `decoded/tools/api_catalog.py`.

Conventions:

- All paths are POSTed under `/umamusume`. Every request also carries the `RequestCommon` fields: `viewer_id: long, device: int, device_id, device_name, graphics_device_name, ip_address, platform_os_version, carrier: string, keychain: long, locale, button_info, dmm_viewer_id, dmm_onetime_token: string`. They are left out of the tables below.
- Every response is `{ data_headers: DataHeader, data: <X>Response.CommonResponse }` (the server also adds `response_code`). The **Response `data`** column lists the fields of `data`.
- Field names are the msgpack keys exactly as the client deserializes them. Enum-typed fields go over the wire as ints. `long` values can exceed 2^53.
- Status is **implemented** when `src/routes/api/*.ts` registers the path. It says nothing about whether the response is complete or correct.

## Summary

| | count |
|---|---|
| Client endpoints (URL path resolved) | 511 |
| Implemented in honse-daughters | 66 |
| Missing | 445 |
| Request classes whose URL could not be resolved | 1 |
| Server routes the client never calls | 1 |

### Biggest missing areas

_The counts in this section are regenerated with the tables. The prose ranking was written against `main` at e973603 (2026-10-17), before the URA career work on `ura-career`._

The server implements 66 of 511 client endpoints (about 13%). It covers the boot path (`tool/*`, `load/index`, `tutorial/*`), presents, missions, gacha, team stadium, and four career calls. Ranked roughly by how soon a player would hit each gap:

1. **Career (training) core: `single_mode/*`, 15 of 19 missing.** `start`, `check_event`, `exec_command` and `load` exist. A run cannot finish without `race_entry`, `race_start`, `race_end`, `race_out`, `gain_skills`, `continue`, `finish`, `factor_lottery`, `factor_select`, `change_running_style` and the others. `trained_chara/*` (6, including `load`) is also needed afterwards to view and manage the resulting horses.
2. **Scenario-specific career APIs: 106 endpoints, none implemented.** `single_mode_team` (28), `single_mode_venus` (26), `single_mode_live` (23), `single_mode_free` (22) and `idle_single_mode` (7). Each later scenario needs its own family. The URA base scenario needs only `single_mode/*`.
3. **Daily and story content: about 50 endpoints, none implemented.** `daily_race` (10), `legend_race` (9), `daily_legend_race` (8), `main_story_race`/`main_story`/`character_story`/`extra_story` (7), `story_event` (7), `live` and `live_theater*` (5), `gallery`/`talk_gallery` (3). Most home-screen menu buttons lead here.
4. **Inventory and roster management: about 40 endpoints, none implemented.** `card/*` (unlock, rarity/talent/skill upgrade, sell_piece, get_card_event_skill), `item/*` (exchange, sell, use_recovery_item), `user/*` profile edits (17 of 20 missing: leader card, comment, birthday, trophies, TP/RP recovery…), `honor/*`, `option/change_option`, `present/history`, `gacha/get_history`/`limit_exchange`/`select_prize`.
5. **Multiplayer, PvP and social: about 175 endpoints, none implemented.** `room_match` (27), `champions` (24 + 2 stamp), `heroes` (24), `practice_race` (18), `team_building` (17), `challenge_match` (8), circles (`circle*`, 38), `friend` (8), `fan_raid`/`collect_raid`/`collect_event_map` (8). On a single-player preservation server most of these can return empty or stub data. `friend/index` and the circle index calls will still be hit from the home screen.
6. **Account linking: `account/*` (12), `transfer/*` (3), `kids_web_service/*` (4), `cygames_id_external` (1).** These are data transfer and parental-email flows. They can stay unimplemented or return a fixed error.

Other notes:

- `/ajax/info_index` is a server route that the client binary never calls. It is probably fetched by the in-game webview from HTML, not by a `*Task`.
- `ItemExchangeAddFrameRequest` (`item_exchange` follow-frame expansion) has no URL literal in the binary, so its path is unknown.
- **Implemented** only means the route exists. Compare the response fields in the tables below with each handler. For example, `tool/start_session` has no `country_type`.

### Coverage by prefix

| Prefix | Endpoints | Implemented | Missing |
|---|---|---|---|
| [single_mode_team](#prefix-single-mode-team) | 28 | 0 | 28 |
| [room_match](#prefix-room-match) | 27 | 0 | 27 |
| [single_mode_venus](#prefix-single-mode-venus) | 26 | 0 | 26 |
| [champions](#prefix-champions) | 24 | 0 | 24 |
| [heroes](#prefix-heroes) | 24 | 0 | 24 |
| [single_mode_live](#prefix-single-mode-live) | 23 | 0 | 23 |
| [single_mode_free](#prefix-single-mode-free) | 22 | 0 | 22 |
| [practice_race](#prefix-practice-race) | 18 | 0 | 18 |
| [team_building](#prefix-team-building) | 17 | 0 | 17 |
| [user](#prefix-user) | 20 | 3 | 17 |
| [circle_user](#prefix-circle-user) | 16 | 0 | 16 |
| [account](#prefix-account) | 12 | 0 | 12 |
| [circle](#prefix-circle) | 12 | 0 | 12 |
| [daily_race](#prefix-daily-race) | 10 | 0 | 10 |
| [legend_race](#prefix-legend-race) | 9 | 0 | 9 |
| [note](#prefix-note) | 10 | 1 | 9 |
| [challenge_match](#prefix-challenge-match) | 8 | 0 | 8 |
| [daily_legend_race](#prefix-daily-legend-race) | 8 | 0 | 8 |
| [friend](#prefix-friend) | 8 | 0 | 8 |
| [debug](#prefix-debug) | 7 | 0 | 7 |
| [idle_single_mode](#prefix-idle-single-mode) | 7 | 0 | 7 |
| [item](#prefix-item) | 7 | 0 | 7 |
| [story_event](#prefix-story-event) | 7 | 0 | 7 |
| [circle_chat](#prefix-circle-chat) | 6 | 0 | 6 |
| [jukebox](#prefix-jukebox) | 8 | 2 | 6 |
| [map_event](#prefix-map-event) | 5 | 0 | 5 |
| [trained_chara](#prefix-trained-chara) | 6 | 1 | 5 |
| [circle_item_request](#prefix-circle-item-request) | 4 | 0 | 4 |
| [collect_raid](#prefix-collect-raid) | 4 | 0 | 4 |
| [gacha](#prefix-gacha) | 6 | 2 | 4 |
| [kids_web_service](#prefix-kids-web-service) | 4 | 0 | 4 |
| [main_story_race](#prefix-main-story-race) | 4 | 0 | 4 |
| [payment](#prefix-payment) | 7 | 3 | 4 |
| [campaign_walking](#prefix-campaign-walking) | 3 | 0 | 3 |
| [factor_research](#prefix-factor-research) | 3 | 0 | 3 |
| [tool](#prefix-tool) | 7 | 4 | 3 |
| [training_challenge](#prefix-training-challenge) | 3 | 0 | 3 |
| [transfer](#prefix-transfer) | 3 | 0 | 3 |
| [champions_stamp](#prefix-champions-stamp) | 2 | 0 | 2 |
| [collect_event_map](#prefix-collect-event-map) | 2 | 0 | 2 |
| [fan_raid](#prefix-fan-raid) | 2 | 0 | 2 |
| [gallery](#prefix-gallery) | 2 | 0 | 2 |
| [honor](#prefix-honor) | 2 | 0 | 2 |
| [live_theater](#prefix-live-theater) | 2 | 0 | 2 |
| [live_theater_performers_preset](#prefix-live-theater-performers-preset) | 2 | 0 | 2 |
| [photo](#prefix-photo) | 2 | 0 | 2 |
| [raffle](#prefix-raffle) | 2 | 0 | 2 |
| [single_mode](#prefix-single-mode) | 19 | 17 | 2 |
| [team_stadium](#prefix-team-stadium) | 9 | 7 | 2 |
| [valentine](#prefix-valentine) | 2 | 0 | 2 |
| [(unresolved)](#prefix--unresolved-) | 1 | 0 | 1 |
| [banner](#prefix-banner) | 1 | 0 | 1 |
| [card](#prefix-card) | 7 | 6 | 1 |
| [character_story](#prefix-character-story) | 1 | 0 | 1 |
| [cygames_id_external](#prefix-cygames-id-external) | 1 | 0 | 1 |
| [daily_race_skip](#prefix-daily-race-skip) | 1 | 0 | 1 |
| [extra_story](#prefix-extra-story) | 1 | 0 | 1 |
| [live](#prefix-live) | 1 | 0 | 1 |
| [main_story](#prefix-main-story) | 1 | 0 | 1 |
| [option](#prefix-option) | 1 | 0 | 1 |
| [present](#prefix-present) | 4 | 3 | 1 |
| [serial_code](#prefix-serial-code) | 1 | 0 | 1 |
| [support_card](#prefix-support-card) | 6 | 5 | 1 |
| [support_card_ranking](#prefix-support-card-ranking) | 1 | 0 | 1 |
| [talk_gallery](#prefix-talk-gallery) | 1 | 0 | 1 |
| [load](#prefix-load) | 1 | 1 | 0 |
| [mission](#prefix-mission) | 2 | 2 | 0 |
| [pre_single_mode](#prefix-pre-single-mode) | 2 | 2 | 0 |
| [read_info](#prefix-read-info) | 1 | 1 | 0 |
| [support_card_deck](#prefix-support-card-deck) | 2 | 2 | 0 |
| [tutorial](#prefix-tutorial) | 4 | 4 | 0 |

### Server routes not called by this client

- `/ajax/info_index` (src/routes/api/ajax.ts)

## Endpoints

<a id="prefix-account"></a>
### account

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/account/chain_by_icloud_data` | ❌ missing | `DataLinkChainByiCloudData` | `icloud_data`: string | `chained_viewer_id`: long<br>`chained_user_name`: string<br>`auth_key`: string |
| `/account/chain_by_social_account` | ❌ missing | `DataLinkChainBySocialAccount` | `chain_type`: int<br>`openid`: string<br>`openid_type`: int<br>`authentication_token`: string<br>`use_account_type`: int | `social_account_id`: string<br>`social_account_type`: int<br>`auth_key`: string<br>`last_account_type`: int |
| `/account/chain_by_transition_code` | ❌ missing | `DataLinkChainByTransitionCode` | `password`: string<br>`input_viewer_id`: long | `chained_viewer_id`: long<br>`chained_user_name`: string<br>`auth_key`: string |
| `/account/chain_disconnect` | ❌ missing | `AccountChainDisconnect` | `openid`: string<br>`openid_type`: int | `{}` (no fields) |
| `/account/create_facebook_nonce` | ❌ missing | `DataLinkCreateFacebookNonce` | — | `nonce`: string |
| `/account/deletion_cancel` | ❌ missing | `AccountDeletionCancel` | — | `{}` (no fields) |
| `/account/deletion_request` | ❌ missing | `AccountDeletionRequest` | — | `{}` (no fields) |
| `/account/get_by_icloud_data` | ❌ missing | `DataLinkGetByiCloudData` | `icloud_data`: string | `icloud_data_verified`: bool<br>`icloud_viewer_id`: long<br>`icloud_name`: string |
| `/account/get_by_social_account` | ❌ missing | `DataLinkGetGameDataBySocialAccount` | `openid`: string<br>`openid_type`: string<br>`authentication_token`: string<br>`not_return_error`: bool | `viewer_id`: long<br>`name`: string<br>`is_chained`: int<br>`request_user_name`: string |
| `/account/get_by_transition_code` | ❌ missing | `DataLinkGetByTransitionCode` | `password`: string<br>`input_viewer_id`: string | `target_viewer_id`: long<br>`name`: string<br>`request_user_name`: string |
| `/account/index` | ❌ missing | `DataLinkIndex` | `cygames_id_client_sdk_version`: string | `open_date`: string<br>`last_account_type`: int<br>`app_id`: int<br>`host`: string<br>`client_id`: string<br>`user_pool_id`: string<br>`redirect_uri`: string<br>`cygames_id_client_sdk_version`: string<br>`language_code`: string |
| `/account/publish_transition_code` | ❌ missing | `DataLinkPublishTransitionCode` | `password`: string | `{}` (no fields) |

<a id="prefix-banner"></a>
### banner

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/banner/url` | ❌ missing | `BannerUrl` | `banner_id`: int | `url`: string |

<a id="prefix-campaign-walking"></a>
### campaign_walking

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/campaign_walking/check_result` | ❌ missing | `CampaignWalkingCheckResult` | — | `result`: [CampaignWalkingResult](#type-campaignwalkingresult)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/campaign_walking/go_walking` | ❌ missing | `CampaignWalkingGoWalking` | `chara_id`: int<br>`location_id`: int<br>`reward_id`: int | `today_walking_num`: int |
| `/campaign_walking/index` | ❌ missing | `CampaignWalkingIndex` | — | `walking_gauge`: int<br>`today_walking_num`: int<br>`walking_reward_info`: [CampaignWalkingReward](#type-campaignwalkingreward)[]<br>`chara_walking_act_array`: [NoteDataForDisplay](#type-notedatafordisplay)[] |

<a id="prefix-card"></a>
### card

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/card/get_card_event_skill` | ✅ implemented | `CardGetCardEventSkill` | `card_id`: int | `event_skill_list`: [EventSkill](#type-eventskill)[] |
| `/card/get_release_card_array` | ✅ implemented | `CardGetReleaseCard` | — | `release_card_array`: int[] |
| `/card/rarity_upgrade` | ✅ implemented | `CardRarityUpgrade` | `card_id`: int<br>`new_rarity`: int<br>`now_rarity`: int | `card_data`: [UserCard](#type-usercard)<br>`piece_data`: [PieceData](#type-piecedata)[] |
| `/card/sell_piece` | ❌ missing | `CardSellPiece` | `sell_piece_data_array`: [PieceData](#type-piecedata)[] | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`piece_data`: [PieceData](#type-piecedata)[] |
| `/card/skill_upgrade` | ✅ implemented | `CardSkillUpgrade` | `card_id`: int<br>`skill_id`: int<br>`skill_level`: int<br>`new_skill_level`: int | `card_data`: [UserCard](#type-usercard)<br>`item_data_array`: [UserItem](#type-useritem)[] |
| `/card/talent_strengthen` | ✅ implemented | `CardTalentStrengthen` | `card_id`: int<br>`talent_level`: int<br>`new_talent_level`: int | `card_data`: [UserCard](#type-usercard)<br>`item_data_array`: [UserItem](#type-useritem)[] |
| `/card/unlock` | ✅ implemented | `CardUnlock` | `card_id`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`piece_data`: [PieceData](#type-piecedata)[] |

<a id="prefix-challenge-match"></a>
### challenge_match

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/challenge_match/challenge_race_open` | ❌ missing | `ChallengeMatchRaceOpen` | — | `challenge_match_race_id`: int<br>`end_date`: string<br>`challenge_race_extreme_count`: int |
| `/challenge_match/index` | ❌ missing | `ChallengeMatchIndex` | — | `challenge_match_id`: int<br>`match_point`: int<br>`challenge_match_race_record_array`: [ChallengeMatchRaceData](#type-challengematchracedata)[]<br>`challenge_race_gauge_value`: int<br>`challenge_race_extreme_count`: int<br>`challenge_race_open_type`: int<br>`challenge_race_challenge_match_race_id`: int<br>`challenge_race_end_date`: string<br>`challenge_race_retry_bonus`: int<br>`resume_challenge_match_race_id`: int<br>`resume_state`: int<br>`resume_trained_chara_id`: int<br>`mission_badge_num`: int<br>`notify_gauge_max`: int |
| `/challenge_match/race_end` | ❌ missing | `ChallengeMatchRaceEnd` | `challenge_match_race_id`: int | `rank`: int<br>`match_point`: int<br>`add_match_point_array`: [AddMatchPointData](#type-addmatchpointdata)<br>`first_clear_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`drop_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`victory_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`trained_chara_id`: int<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`state`: int<br>`mission_badge_num`: int |
| `/challenge_match/race_entry` | ❌ missing | `ChallengeMatchRaceEntry` | `challenge_match_race_id`: int<br>`trained_chara_id`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`state`: int<br>`trained_chara_id`: int |
| `/challenge_match/race_start` | ❌ missing | `ChallengeMatchRaceStart` | `challenge_match_race_id`: int<br>`running_style`: int<br>`is_short`: int | `race_scenario`: string<br>`state`: int<br>`running_style`: int |
| `/challenge_match/reflect_item_effect` | ❌ missing | `ChallengeMatchReflectItemEffect` | `challenge_match_race_id`: int<br>`item_id_array`: int[] | `rp_info`: [RpInfo](#type-rpinfo)<br>`weather`: int<br>`ground_condition`: int<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`state`: int |
| `/challenge_match/reset` | ❌ missing | `ChallengeMatchReset` | `challenge_match_race_id`: int | `state`: int |
| `/challenge_match/resume` | ❌ missing | `ChallengeMatchResume` | `challenge_match_race_id`: int | `state`: int<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`race_scenario`: string |

<a id="prefix-champions"></a>
### champions

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/champions/all_race_exec` | ❌ missing | `ChampionsAllRaceExec` | — | `state`: int |
| `/champions/cancel` | ❌ missing | `ChampionsCancel` | `room_id_array`: long[] | `is_success`: int |
| `/champions/entry` | ❌ missing | `ChampionsEntry` | `entry_type`: int<br>`client_coin_num`: int<br>`dialog_open_time`: long | `entry_times`: int<br>`free_entry_times`: int<br>`coin_info`: [CoinInfo](#type-coininfo)<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`state`: int |
| `/champions/final_lobby` | ❌ missing | `ChampionsFinalLobby` | — | `race_result_array`: [ChampionsRaceResult](#type-championsraceresult)[]<br>`own_chara_result_array`: [ChampionsCharaResult](#type-championschararesult)[] |
| `/champions/final_race_end` | ❌ missing | `ChampionsFinalRaceEnd` | — | `state`: int<br>`total_entry_num`: int |
| `/champions/final_race_ranking` | ❌ missing | `ChampionsFinalRaceRanking` | — | `total_num`: int<br>`ranking_info_array`: [ChampionsRankingInfo](#type-championsrankinginfo)[]<br>`ranking_user_info_array`: [ChampionsRankingUserInfo](#type-championsrankinguserinfo)[]<br>`ranking_entry_chara_info_array`: [ChampionsRankingEntryCharaInfo](#type-championsrankingentrycharainfo)[] |
| `/champions/final_race_start` | ❌ missing | `ChampionsFinalRaceStart` | — | `room_info`: [ChampionsRoomInfo](#type-championsroominfo)<br>`room_user_array`: [ChampionsRoomUser](#type-championsroomuser)[]<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`state`: int<br>`played_live_flag`: int |
| `/champions/final_round_end` | ❌ missing | `ChampionsFinalRoundEnd` | `is_present`: int | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`state`: int |
| `/champions/get_news_info` | ❌ missing | `ChampionsGetNewsInfo` | `race_num`: int | `news_race_id_array`: int[]<br>`news_trainer_info`: [ChampionsNewsTrainerInfo](#type-championsnewstrainerinfo)<br>`news_chara_info_array`: [ChampionsNewsCharaInfo](#type-championsnewscharainfo)[]<br>`news_chara_result_info_array`: [ChampionsNewsCharaResultInfo](#type-championsnewschararesultinfo)[] |
| `/champions/get_news_win_info` | ❌ missing | `ChampionsGetNewsWinInfo` | `race_num`: int | `news_win_info`: [ChampionsNewsWinInfo](#type-championsnewswininfo)<br>`news_chara_result_info`: [ChampionsNewsCharaResultInfo](#type-championsnewschararesultinfo) |
| `/champions/get_race_history_info` | ❌ missing | `ChampionsGetRaceHistoryInfo` | — | `race_history_info_array`: [ChampionsRaceHistoryInfo](#type-championsracehistoryinfo)[]<br>`own_race_history_chara_array`: [ChampionsRaceHistoryCharaResultInfo](#type-championsracehistorychararesultinfo)[] |
| `/champions/get_race_result_chart` | ❌ missing | `ChampionsGetRaceResultChart` | `race_num`: int | `room_user_array`: [ChampionsRoomUser](#type-championsroomuser)[]<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[] |
| `/champions/get_ranking_chara_info` | ❌ missing | `ChampionsGetRankingCharaInfo` | `target_viewer_id`: long<br>`team_member_id`: int | `trained_chara`: [TrainedChara](#type-trainedchara) |
| `/champions/get_reward_array` | ❌ missing | `ChampionsGetRewardArray` | — | `reward_array`: [ChampionsRewardInfo](#type-championsrewardinfo)[] |
| `/champions/index` | ❌ missing | `ChampionsIndex` | — | `champions_info`: [ChampionsInfo](#type-championsinfo)<br>`race_result_array`: [ChampionsRaceResult](#type-championsraceresult)[]<br>`entry_chara_array`: [ChampionsUserCharaTop](#type-championsusercharatop)[]<br>`last_entry_chara_array`: [ChampionsEntryChara](#type-championsentrychara)[]<br>`champions_mission_array`: [UserMission](#type-usermission)[]<br>`reward_array`: [ChampionsRewardInfo](#type-championsrewardinfo)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`first_check_round_flag`: int<br>`last_checked_time`: long<br>`news_rank_count_info_array`: [ChampionsNewsRankCountInfo](#type-championsnewsrankcountinfo)[] |
| `/champions/lobby` | ❌ missing | `ChampionsLobby` | — | `race_result_array`: [ChampionsRaceResult](#type-championsraceresult)[] |
| `/champions/paddock_index` | ❌ missing | `ChampionsPaddockIndex` | `race_num`: int | `news_title_id`: int |
| `/champions/poll` | ❌ missing | `ChampionsPoll` | `room_id_array`: long[] | `room_user_array`: [ChampionsRoomUser](#type-championsroomuser)[]<br>`state`: int |
| `/champions/race_end` | ❌ missing | `ChampionsRaceEnd` | — | `next_tier`: int<br>`state`: int |
| `/champions/race_entry` | ❌ missing | `ChampionsRaceEntry` | `start_time`: long | `room_info_array`: [ChampionsRoomInfo](#type-championsroominfo)[]<br>`room_user_array`: [ChampionsRoomUser](#type-championsroomuser)[]<br>`state`: int |
| `/champions/race_start` | ❌ missing | `ChampionsRaceStart` | — | `room_info`: [ChampionsRoomInfo](#type-championsroominfo)<br>`room_user_array`: [ChampionsRoomUser](#type-championsroomuser)[]<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[] |
| `/champions/round_end` | ❌ missing | `ChampionsRoundEnd` | `is_present`: int | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`state`: int |
| `/champions/select_league` | ❌ missing | `ChampionsSelectLeague` | `league_type`: int | `state`: int<br>`league_type`: int<br>`reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/champions/set_entry_chara` | ❌ missing | `ChampionsSetEntryChara` | `entry_chara_array`: [ChampionsEntryChara](#type-championsentrychara)[] | `state`: int |

<a id="prefix-champions-stamp"></a>
### champions_stamp

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/champions_stamp/poll` | ❌ missing | `ChampionsStampPoll` | `race_num`: int<br>`term_id`: int | `stamp_array`: [ChampionsStampInfo](#type-championsstampinfo)[] |
| `/champions_stamp/send_stamp` | ❌ missing | `ChampionsStampSendStamp` | `race_num`: int<br>`term_id`: int<br>`stamp_id`: int | `{}` (no fields) |

<a id="prefix-character-story"></a>
### character_story

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/character_story/first_clear` | ❌ missing | `CharacterStoryFirstClear` | `episode_id`: int | `character_story_data`: [CharacterStoryData](#type-characterstorydata)<br>`reward_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`release_item_flag`: int |

<a id="prefix-circle"></a>
### circle

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/circle/break_up` | ❌ missing | `CircleBreakUp` | — | `circle_user`: [CircleUser](#type-circleuser) |
| `/circle/check_join` | ❌ missing | `CircleCheckJoin` | — | `is_join_circle`: bool |
| `/circle/conditional_search` | ❌ missing | `CircleConditionalSearch` | `keyword`: string<br>`join_style`: int<br>`policy`: int<br>`member_num`: int | `circle_info_array`: [CircleInfo](#type-circleinfo)[]<br>`leader_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`circle_ranking_array`: [CircleRanking](#type-circleranking)[] |
| `/circle/detail` | ❌ missing | `CircleDetail` | `circle_id`: int<br>`no_join_user`: bool | `circle_info`: [CircleInfo](#type-circleinfo)<br>`circle_user_array`: [CircleUser](#type-circleuser)[]<br>`user_friend_array`: [UserFriend](#type-userfriend)[]<br>`circle_request_array`: [CircleRequest](#type-circlerequest)[]<br>`circle_scout_array`: [CircleScout](#type-circlescout)[]<br>`circle_ranking_this_month`: [CircleRanking](#type-circleranking)<br>`circle_ranking_last_month`: [CircleRanking](#type-circleranking)<br>`is_calculate`: bool<br>`summary_user_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[] |
| `/circle/get_post_partner_data` | ❌ missing | `CircleGetPostPartnerData` | — | `circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[] |
| `/circle/get_profile_card_info` | ❌ missing | `CircleGetProfileCardInfo` | — | `circle_profile_card_info`: [CircleProfileCardInfo](#type-circleprofilecardinfo)<br>`image_file_status`: int<br>`image_file_url`: string<br>`image_unique_id`: string<br>`circle_info`: [CircleInfo](#type-circleinfo)<br>`circle_ranking_last_month`: [CircleRanking](#type-circleranking) |
| `/circle/get_ranking_top` | ❌ missing | `CircleGetRankingTop` | `year`: string<br>`month`: string | `circle_info_array`: [CircleInfo](#type-circleinfo)[]<br>`leader_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`circle_ranking_array`: [CircleRanking](#type-circleranking)[]<br>`is_calculate`: bool |
| `/circle/list` | ❌ missing | `CircleList` | — | `recommend_circle_id_array`: int[]<br>`circle_request`: [CircleRequest](#type-circlerequest)<br>`circle_scout_array`: [CircleScout](#type-circlescout)[]<br>`circle_info_array`: [CircleInfo](#type-circleinfo)[]<br>`leader_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`circle_ranking_array`: [CircleRanking](#type-circleranking)[] |
| `/circle/make` | ❌ missing | `CircleMake` | `name`: string<br>`comment`: string<br>`join_style`: int<br>`policy`: int | `circle_info`: [CircleInfo](#type-circleinfo)<br>`circle_user`: [CircleUser](#type-circleuser) |
| `/circle/room_enter` | ❌ missing | `CircleRoomEnter` | — | `circle_info`: [CircleInfo](#type-circleinfo)<br>`circle_user_array`: [CircleUser](#type-circleuser)[]<br>`summary_user_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`change_leader`: bool<br>`is_scout_able`: bool<br>`is_show_ranking_result`: bool<br>`circle_chat_message_array`: [CircleChatMessage](#type-circlechatmessage)[]<br>`circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`daily_donated_count`: int<br>`circle_ranking_this_month`: [CircleRanking](#type-circleranking)<br>`circle_ranking_last_month`: [CircleRanking](#type-circleranking)<br>`is_calculate`: bool<br>`room_match_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`room_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`room_user_array`: [RoomMatchUser](#type-roommatchuser)[]<br>`circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[]<br>`daily_post_partner_count`: int<br>`chat_polling_interval`: int |
| `/circle/set_profile_card_info` | ❌ missing | `CircleSetProfileCardInfo` | `profile_card_info`: [CircleProfileCardInfo](#type-circleprofilecardinfo)<br>`image_file`: string<br>`name`: string<br>`comment`: string<br>`join_style`: int<br>`policy`: int | `circle_info`: [CircleInfo](#type-circleinfo) |
| `/circle/update` | ❌ missing | `CircleUpdate` | `name`: string<br>`comment`: string<br>`join_style`: int<br>`policy`: int | `circle_info`: [CircleInfo](#type-circleinfo) |

<a id="prefix-circle-chat"></a>
### circle_chat

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/circle_chat/invite_room_match` | ❌ missing | `CircleChatInviteRoomMatch` | `room_id`: int | `{}` (no fields) |
| `/circle_chat/polling` | ❌ missing | `CircleChatPolling` | — | `circle_chat_message_array`: [CircleChatMessage](#type-circlechatmessage)[]<br>`circle_chat_user_array`: [CircleChatUser](#type-circlechatuser)[]<br>`circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`room_match_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[]<br>`chat_polling_interval`: int |
| `/circle_chat/post_partner` | ❌ missing | `CircleChatPostPartner` | `trained_chara_id`: int<br>`comment`: string | `circle_chat_message_array`: [CircleChatMessage](#type-circlechatmessage)[]<br>`circle_chat_user_array`: [CircleChatUser](#type-circlechatuser)[]<br>`circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`room_match_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[]<br>`chat_polling_interval`: int |
| `/circle_chat/send_item_request` | ❌ missing | `CircleChatSendItemRequest` | `item_id`: int | `circle_chat_message_array`: [CircleChatMessage](#type-circlechatmessage)[]<br>`circle_chat_user_array`: [CircleChatUser](#type-circlechatuser)[]<br>`circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`room_match_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[]<br>`chat_polling_interval`: int<br>`item_request_end_time`: string |
| `/circle_chat/send_message` | ❌ missing | `CircleChatSendMessage` | `message`: string | `circle_chat_message_array`: [CircleChatMessage](#type-circlechatmessage)[]<br>`circle_chat_user_array`: [CircleChatUser](#type-circlechatuser)[]<br>`circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`room_match_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[]<br>`chat_polling_interval`: int |
| `/circle_chat/send_stamp` | ❌ missing | `CircleChatSendStamp` | `stamp_id`: int | `circle_chat_message_array`: [CircleChatMessage](#type-circlechatmessage)[]<br>`circle_chat_user_array`: [CircleChatUser](#type-circlechatuser)[]<br>`circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`room_match_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`circle_post_partner_array`: [CirclePostPartner](#type-circlepostpartner)[]<br>`chat_polling_interval`: int |

<a id="prefix-circle-item-request"></a>
### circle_item_request

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/circle_item_request/donate` | ❌ missing | `CircleItemRequestDonate` | `request_id`: int<br>`item_num`: int<br>`client_own_num`: int | `circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`daily_donated_count`: int<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/circle_item_request/donate_multiple` | ❌ missing | `CircleItemRequestDonateMultiple` | `request_id_array`: int[]<br>`client_item_data_array`: [UserItem](#type-useritem)[] | `circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`daily_donated_count`: int<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`current_item_data_array`: [UserItem](#type-useritem)[] |
| `/circle_item_request/get_request_data` | ❌ missing | `CircleItemRequestGetRequestData` | — | `circle_item_request_array`: [CircleItemRequest](#type-circleitemrequest)[]<br>`circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[] |
| `/circle_item_request/receive` | ❌ missing | `CircleItemRequestReceive` | — | `circle_item_donate_array`: [CircleItemDonate](#type-circleitemdonate)[]<br>`circle_user_array`: [CircleChatUser](#type-circlechatuser)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |

<a id="prefix-circle-user"></a>
### circle_user

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/circle_user/approve_join_request` | ❌ missing | `CircleUserApproveJoinRequest` | `target_viewer_id`: long | `circle_user`: [CircleUser](#type-circleuser) |
| `/circle_user/approve_scout` | ❌ missing | `CircleUserApproveScout` | `circle_id`: int | `circle_user`: [CircleUser](#type-circleuser) |
| `/circle_user/cancel_join_request` | ❌ missing | `CircleUserCancelJoinRequest` | `circle_id`: int | `{}` (no fields) |
| `/circle_user/cancel_scout` | ❌ missing | `CircleUserCancelScout` | `target_viewer_id`: long | `{}` (no fields) |
| `/circle_user/change_leader` | ❌ missing | `CircleUserChangeLeader` | `target_viewer_id`: long | `circle_user`: [CircleUser](#type-circleuser) |
| `/circle_user/change_sub_leader` | ❌ missing | `CircleUserChangeSubLeader` | `target_viewer_id`: long<br>`is_set`: bool | `{}` (no fields) |
| `/circle_user/checked_request` | ❌ missing | `CircleUserCheckedRequest` | — | `last_checked_time`: long |
| `/circle_user/decline_join_request` | ❌ missing | `CircleUserDeclineJoinRequest` | `target_viewer_id`: long | `{}` (no fields) |
| `/circle_user/get_profile` | ❌ missing | `CircleUserGetProfile` | — | `circle_info`: [CircleInfo](#type-circleinfo)<br>`circle_ranking_last_month`: [CircleRanking](#type-circleranking)<br>`chara_id`: int<br>`bg_id`: int<br>`recruit_comment`: string<br>`dress_id`: int |
| `/circle_user/get_profile_card_info` | ❌ missing | `CircleUserGetProfileCardInfo` | — | `profile_card_info`: [UserProfileCardInfo](#type-userprofilecardinfo) |
| `/circle_user/join_request` | ❌ missing | `CircleUserUserJoinRequest` | `circle_id`: int | `circle_user`: [CircleUser](#type-circleuser) |
| `/circle_user/kick` | ❌ missing | `CircleUserKick` | `target_viewer_id`: long | `{}` (no fields) |
| `/circle_user/leave` | ❌ missing | `CircleUserLeave` | — | `circle_user`: [CircleUser](#type-circleuser) |
| `/circle_user/scout` | ❌ missing | `CircleUserScout` | `target_viewer_id`: long | `is_scout_max`: bool |
| `/circle_user/set_profile` | ❌ missing | `CircleUserSetProfile` | `chara_id`: int<br>`bg_id`: int<br>`recruit_comment`: string<br>`dress_id`: int | `circle_info`: [CircleInfo](#type-circleinfo)<br>`circle_ranking_last_month`: [CircleRanking](#type-circleranking)<br>`chara_id`: int<br>`bg_id`: int<br>`recruit_comment`: string<br>`dress_id`: int |
| `/circle_user/set_profile_card_info` | ❌ missing | `CircleUserSetProfileCardInfo` | `profile_card_info`: [UserProfileCardInfo](#type-userprofilecardinfo) | `{}` (no fields) |

<a id="prefix-collect-event-map"></a>
### collect_event_map

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/collect_event_map/index` | ❌ missing | `CollectEventMapIndex` | — | `is_tapped`: int<br>`reward_position_id`: int<br>`login_bonus_total_count`: int |
| `/collect_event_map/tap_reward` | ❌ missing | `CollectEventMapTapReward` | — | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |

<a id="prefix-collect-raid"></a>
### collect_raid

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/collect_raid/index` | ❌ missing | `CollectRaidIndex` | — | `collect_item_info`: [CollectItemInfo](#type-collectiteminfo)<br>`checked_all_reward_id_array`: int[]<br>`gained_individual_reward_id_array`: int[]<br>`episode_id_array`: int[]<br>`event_status`: int<br>`raid_polling_interval`: int<br>`first_access_flag`: int<br>`mission_flag`: int |
| `/collect_raid/polling` | ❌ missing | `CollectRaidPolling` | — | `all_gained_collect_item_num`: long<br>`raid_polling_interval`: int |
| `/collect_raid/receive_individual_reward` | ❌ missing | `CollectRaidReceiveIndividualReward` | `individual_reward_id_array`: int[] | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/collect_raid/story_clear` | ❌ missing | `CollectRaidStoryClear` | `episode_id`: int | `{}` (no fields) |

<a id="prefix-cygames-id-external"></a>
### cygames_id_external

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/cygames_id_external/apply_pending_product` | ❌ missing | `CygamesIdExternalApplyPendingProduct` | — | `coin_info`: [CoinInfo](#type-coininfo)<br>`factor_order_pass_info`: [FactorOrderPassInfo](#type-factororderpassinfo) |

<a id="prefix-daily-legend-race"></a>
### daily_legend_race

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/daily_legend_race/get_reward_list` | ❌ missing | `DailyLegendRaceGetRewardList` | `daily_legend_race_id`: int | `reward_array`: [RaceRewardData](#type-racerewarddata)[] |
| `/daily_legend_race/index` | ❌ missing | `DailyLegendRaceIndex` | — | `daily_legend_race_record_array`: [DailyLegendRaceData](#type-dailylegendracedata)[]<br>`update_item_array`: [UserItem](#type-useritem)[] |
| `/daily_legend_race/race_entry` | ❌ missing | `DailyLegendRaceRaceEntry` | `daily_legend_race_id`: int<br>`trained_chara_id`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`state`: int<br>`trained_chara_id`: int |
| `/daily_legend_race/race_start` | ❌ missing | `DailyLegendRaceRaceStart` | `running_style`: int<br>`is_short`: int | `race_scenario`: string<br>`state`: int<br>`running_style`: int |
| `/daily_legend_race/reflect_item_effect` | ❌ missing | `DailyLegendRaceReflectItemEffect` | `item_id_array`: int[] | `weather`: int<br>`ground_condition`: int<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`state`: int |
| `/daily_legend_race/replay_check` | ❌ missing | `DailyLegendRaceReplayCheck` | — | `rank`: int<br>`first_clear_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`drop_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`victory_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`state`: int<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`campaign_walking_gauge_info`: [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo)<br>`factor_research_gauge_info`: [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo) |
| `/daily_legend_race/reset` | ❌ missing | `DailyLegendRaceReset` | — | `state`: int |
| `/daily_legend_race/resume` | ❌ missing | `DailyLegendRaceResume` | — | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`race_scenario`: string<br>`state`: int<br>`is_cleared`: int |

<a id="prefix-daily-race"></a>
### daily_race

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/daily_race/get_reward_list` | ❌ missing | `DailyRaceGetRewardList` | `daily_race_id`: int | `reward_array`: [RaceRewardData](#type-racerewarddata)[] |
| `/daily_race/index` | ❌ missing | `DailyRaceIndex` | — | `daily_race_record_array`: [DailyRaceData](#type-dailyracedata)[]<br>`purchase_num`: int |
| `/daily_race/pre_replay_check` | ❌ missing | `DailyRacePreReplayCheck` | — | `state`: int |
| `/daily_race/race_entry` | ❌ missing | `DailyRaceRaceEntry` | `daily_race_id`: int<br>`trained_chara_id`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`state`: int<br>`trained_chara_id`: int |
| `/daily_race/race_start` | ❌ missing | `DailyRaceRaceStart` | `running_style`: int<br>`is_short`: int | `race_scenario`: string<br>`state`: int<br>`running_style`: int |
| `/daily_race/recovery_ticket` | ❌ missing | `DailyRaceRecoveryTicket` | `client_coin_num`: int | `coin_info`: [CoinInfo](#type-coininfo)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`purchase_num`: int |
| `/daily_race/reflect_item_effect` | ❌ missing | `DailyRaceReflectItemEffect` | `item_id_array`: int[] | `weather`: int<br>`ground_condition`: int<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`state`: int |
| `/daily_race/replay_check` | ❌ missing | `DailyRaceReplayCheck` | `race_result_array`: [RaceResultData](#type-raceresultdata)[] | `rank`: int<br>`first_clear_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`normal_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`rare_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`bonus_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`state`: int<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`campaign_walking_gauge_info`: [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo)<br>`factor_research_gauge_info`: [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo) |
| `/daily_race/reset` | ❌ missing | `DailyRaceReset` | — | `state`: int |
| `/daily_race/resume` | ❌ missing | `DailyRaceResume` | — | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`race_scenario`: string<br>`state`: int<br>`purchase_num`: int<br>`is_cleared`: int |

<a id="prefix-daily-race-skip"></a>
### daily_race_skip

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/daily_race_skip/race_skip` | ❌ missing | `DailyRaceSkip` | `daily_race_id`: int<br>`trained_chara_id`: int<br>`race_skip_count`: int<br>`client_own_num`: int<br>`running_style`: int | `race_reward_array`: [RaceSkipReward](#type-raceskipreward)[]<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`campaign_walking_gauge_info`: [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo)<br>`factor_research_gauge_info`: [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo) |

<a id="prefix-debug"></a>
### debug

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/debug/call_payment_dummy` | ❌ missing | `PaymentDummy` | `payment`: [PaymentDummyFinishParam](#type-paymentdummyfinishparam) | `first_time`: bool<br>`purchased_times_data`: [PaymentPurchaseTimesData](#type-paymentpurchasetimesdata)<br>`purchase_id`: string<br>`before_paid_coin`: int<br>`before_free_coin`: int<br>`after_paid_coin`: int<br>`after_free_coin`: int<br>`season_pack_info`: [PaymentSeasonPackInfo](#type-paymentseasonpackinfo) |
| `/debug/circle_direct` | ❌ missing | `CircleDirect` | — | `reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`after_rank`: int<br>`best_team_evaluation_point`: int |
| `/debug/race_info_load` | ❌ missing | `DebugRaceInfoLoad` | — | `json_data`: string |
| `/debug/race_simulate` | ❌ missing | `DebugRaceSimulate` | `simulator_version`: string<br>`simulate_resource_version`: string<br>`race_instance_id`: int<br>`random_seed`: int<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`race_horse_data`: [RaceHorseData](#type-racehorsedata)[]<br>`race_type`: int<br>`self_evaluate`: int<br>`opponent_evaluate`: int<br>`score_calc_team_id`: int<br>`win_count`: int<br>`support_card_bonus`: int<br>`challenge_match_difficulty`: int<br>`challenge_match_retry_count`: int<br>`unlock_flags`: int | `race_scenario`: string<br>`result_array`: [RaceSimulateResult](#type-racesimulateresult)[]<br>`result_team`: [TeamStadiumResultTeam](#type-teamstadiumresultteam) |
| `/debug/race_simulate_direct` | ❌ missing | `DebugRaceSimulateDirect` | `simulator_version`: string<br>`simulate_resource_version`: string<br>`simulate_data`: string | `race_scenario`: string<br>`result_array`: [RaceSimulateResult](#type-racesimulateresult)[] |
| `/debug/single_mode_story_direct` | ❌ missing | `DebugSingleModeStoryDirect` | `event_contents_id`: int<br>`card_id`: int<br>`choice_number`: int | `event_gain`: [StoryDirectEventReward](#type-storydirecteventreward)[]<br>`skill_set`: [StoryDirectSkillSet](#type-storydirectskillset)[] |
| `/debug/tutorial_skip` | ❌ missing | `DebugTutorialSkip` | — | `step`: int |

<a id="prefix-extra-story"></a>
### extra_story

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/extra_story/first_clear` | ❌ missing | `ExtraStoryFirstClear` | `episode_id`: int | `extra_story_data`: [StoryExtraStoryData](#type-storyextrastorydata)<br>`reward_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`add_music_array`: [UserMusic](#type-usermusic)[] |

<a id="prefix-factor-research"></a>
### factor_research

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/factor_research/factor_update` | ❌ missing | `FactorResearchFactorUpdate` | `trained_chara_id`: int<br>`before_factor_id`: int<br>`after_factor_id`: int | `trained_chara`: [TrainedChara](#type-trainedchara)<br>`factor_update_item_array`: [ResponseItem](#type-responseitem) |
| `/factor_research/factor_update_index` | ❌ missing | `FactorResearchFactorUpdateIndex` | — | `{}` (no fields) |
| `/factor_research/index` | ❌ missing | `FactorResearchIndex` | — | `factor_research_event_id`: int<br>`factor_update_item_array`: [ResponseItem](#type-responseitem)<br>`box_id`: int<br>`box_item_num`: int<br>`box_info_array`: [FactorResearchBoxRewardInfo](#type-factorresearchboxrewardinfo)[]<br>`factor_research_gauge_info`: [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo)<br>`factor_research_reward_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`factor_research_display_reward`: [FactorResearchDisplayReward](#type-factorresearchdisplayreward) |

<a id="prefix-fan-raid"></a>
### fan_raid

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/fan_raid/index` | ❌ missing | `FanRaidIndex` | — | `fan_raid_fans_info`: [FanRaidFansInfo](#type-fanraidfansinfo)<br>`checked_fan_raid_all_reward_id_array`: int[]<br>`fan_raid_polling_interval`: int<br>`is_cleared_fan_raid_condition`: int |
| `/fan_raid/polling` | ❌ missing | `FanRaidPolling` | — | `all_gained_fans`: long<br>`fan_raid_polling_interval`: int |

<a id="prefix-friend"></a>
### friend

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/friend/follow` | ❌ missing | `FriendFollow` | `friend_viewer_id`: long | `friend_data`: [UserFriend](#type-userfriend) |
| `/friend/get_team_stadium_team_data` | ❌ missing | `FriendGetTeamStadiumTeamData` | `friend_viewer_id`: long | `team_data_array`: [TeamStadiumTeamDataAtFriend](#type-teamstadiumteamdataatfriend)[] |
| `/friend/index` | ❌ missing | `FriendLoad` | — | `friend_list`: [UserFriend](#type-userfriend)[]<br>`recommend_list`: [UserFriend](#type-userfriend)[]<br>`user_info_summary_list`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`follower_info_summary_list`: [UserInfoAtFollower](#type-userinfoatfollower)[]<br>`last_friend_checked_time`: string<br>`follower_num`: int |
| `/friend/renew_recommend_list` | ❌ missing | `FriendRenewRecommendList` | — | `recommend_list`: [UserFriend](#type-userfriend)[]<br>`user_info_summary_list`: [UserInfoAtFriend](#type-userinfoatfriend)[] |
| `/friend/search` | ❌ missing | `FriendSearch` | `friend_viewer_id`: long<br>`deleted_response_type`: int | `friend_info`: [UserFriend](#type-userfriend)<br>`user_info_summary`: [UserInfoAtFriend](#type-userinfoatfriend)<br>`practice_partner_info`: [TrainedChara](#type-trainedchara)<br>`directory_chara_info`: [TrainedChara](#type-trainedchara)[]<br>`directory_card_array`: [DirectoryCard](#type-directorycard)[]<br>`support_card_data`: [UserSupportCard](#type-usersupportcard)<br>`trophy_num_info`: [TrophyNumInfo](#type-trophynuminfo)<br>`release_num_info`: [ReleaseNumInfo](#type-releasenuminfo)<br>`team_stadium_user`: [TeamStadiumUser](#type-teamstadiumuser)<br>`follower_num`: int<br>`own_follow_num`: int<br>`enable_circle_scout`: int |
| `/friend/simple_search` | ❌ missing | `FriendSimpleSearch` | `friend_viewer_id`: long<br>`deleted_response_type`: int | `user_info_summary`: [UserInfoAtFriend](#type-userinfoatfriend) |
| `/friend/un_follow` | ❌ missing | `FriendUnFollow` | `friend_viewer_id`: long | `friend_data`: [UserFriend](#type-userfriend) |
| `/friend/un_follower` | ❌ missing | `FriendUnFollower` | `friend_viewer_id`: long | `friend_data`: [UserFriend](#type-userfriend) |

<a id="prefix-gacha"></a>
### gacha

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/gacha/exec` | ✅ implemented | `GachaExec` | `gacha_id`: int<br>`draw_type`: int<br>`draw_num`: int<br>`current_num`: int<br>`current_stock_num`: int<br>`item_id`: int | `gacha_result_list`: [GachaResultData](#type-gacharesultdata)[]<br>`bonus_item_array`: [ResponseItem](#type-responseitem)[]<br>`coin_info`: [CoinInfo](#type-coininfo)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`item_list`: [ResponseItem](#type-responseitem)[]<br>`limit_item_info`: [GachaLimitItemInfo](#type-gachalimititeminfo) |
| `/gacha/get_history` | ❌ missing | `GachaGetHistory` | — | `gacha_exec_history_array`: [GachaExecHistory](#type-gachaexechistory)[]<br>`gacha_reward_history_array`: [GachaRewardHistory](#type-gacharewardhistory)[] |
| `/gacha/get_prize_history` | ❌ missing | `GachaGetPrizeHistory` | `gacha_id`: int | `prize_history_array`: [GachaPrizeHistory](#type-gachaprizehistory)[] |
| `/gacha/index` | ✅ implemented | `GachaLoad` | — | `gacha_info_list`: [GachaInfoList](#type-gachainfolist)[]<br>`limit_item_info`: [GachaLimitInfo](#type-gachalimitinfo) |
| `/gacha/limit_exchange` | ❌ missing | `GachaLimitExchange` | `gacha_id`: int<br>`card_type`: int<br>`card_id`: int<br>`current_num`: int | `exchange_result`: [GachaResultData](#type-gacharesultdata)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`limit_item_info`: [GachaLimitItemInfo](#type-gachalimititeminfo) |
| `/gacha/select_prize` | ❌ missing | `GachaSelectPrize` | `gacha_id`: int<br>`card_type`: int<br>`card_id`: int | `{}` (no fields) |

<a id="prefix-gallery"></a>
### gallery

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/gallery/play_event` | ❌ missing | `GalleryPlayEvent` | `story_id`: int | `event_id`: int<br>`chara_id`: int<br>`story_id`: int<br>`event_contents_info`: [GalleryEventContentsInfo](#type-galleryeventcontentsinfo) |
| `/gallery/save_gallery_data` | ❌ missing | `GallerySaveGalleryData` | — | `{}` (no fields) |

<a id="prefix-heroes"></a>
### heroes

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/heroes/final_check_race` | ❌ missing | `HeroesFinalCheckRace` | `group_id`: int<br>`race_num`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`next_play_info`: [HeroesFinalNextPlayInfo](#type-heroesfinalnextplayinfo) |
| `/heroes/final_edit_team` | ❌ missing | `HeroesFinalEditTeam` | `entry_chara_array`: [HeroesEntryChara](#type-heroesentrychara)[]<br>`auto_edit_flag`: int | `{}` (no fields) |
| `/heroes/final_get_race_list` | ❌ missing | `HeroesFinalGetRaceList` | — | `race_info_array_1`: [HeroesFinalRaceInfo](#type-heroesfinalraceinfo)[]<br>`race_info_array_2`: [HeroesFinalRaceInfo](#type-heroesfinalraceinfo)[] |
| `/heroes/final_get_race_replay` | ❌ missing | `HeroesFinalGetRaceReplay` | `next_play_info`: [HeroesFinalNextPlayInfo](#type-heroesfinalnextplayinfo) | `race_result_info`: [HeroesFinalRaceResultInfo](#type-heroesfinalraceresultinfo)<br>`first_access_race_tips_flag`: int |
| `/heroes/final_get_umaine` | ❌ missing | `HeroesFinalGetUmaine` | — | `race_info_array_1`: [HeroesFinalRaceInfo](#type-heroesfinalraceinfo)[]<br>`race_info_array_2`: [HeroesFinalRaceInfo](#type-heroesfinalraceinfo)[]<br>`received_reward_group_array`: int[]<br>`first_access_umaine_tips_flag`: int |
| `/heroes/final_set_umaine` | ❌ missing | `HeroesFinalSetUmaine` | `group_id`: int<br>`race_num`: int<br>`setting_array`: [HeroesFinalUmaineSetting](#type-heroesfinalumainesetting)[] | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`received_reward_group_array`: int[] |
| `/heroes/get_past_race_replay` | ❌ missing | `HeroesGetPastRaceReplay` | `heroes_id`: int | `group_id`: int<br>`race_num`: int<br>`race_result_info`: [HeroesFinalRaceResultInfo](#type-heroesfinalraceresultinfo) |
| `/heroes/get_past_results` | ❌ missing | `HeroesGetPastResults` | — | `past_results`: [HeroesPastResult](#type-heroespastresult)[] |
| `/heroes/get_ranking` | ❌ missing | `HeroesGetRanking` | — | `ranking_array1`: [HeroesRankingRecord](#type-heroesrankingrecord)[]<br>`ranking_array2`: [HeroesRankingRecord](#type-heroesrankingrecord)[]<br>`ranking_array3`: [HeroesRankingRecord](#type-heroesrankingrecord)[] |
| `/heroes/get_ranking_chara_info` | ❌ missing | `HeroesGetRankingCharaInfo` | `target_snapshot_id`: long<br>`target_viewer_id`: long<br>`team_member_id`: int | `user_name`: string<br>`trained_chara`: [TrainedChara](#type-trainedchara)<br>`chara_race_stats`: [HeroesCharaRaceStats](#type-heroeschararacestats) |
| `/heroes/index` | ❌ missing | `HeroesIndex` | — | `heroes_id`: int<br>`own_team_info`: [HeroesTeamInfo](#type-heroesteaminfo)<br>`own_chara_result_array`: [HeroesCharaRaceStats](#type-heroeschararacestats)[]<br>`stage`: int<br>`stage_step`: int<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`stage1_resume_state`: int<br>`stage1_resume_round_num`: int<br>`honor_chara_id`: int<br>`first_access_flags`: int<br>`first_access_stage_step_flag`: int<br>`first_access_final_stage1_result_flag`: int<br>`first_access_final_stage1_ranking_flag`: int<br>`first_access_final_get_honor_flag`: int<br>`first_access_final_get_nickname_flag`: int<br>`hero_gauge`: int<br>`hero_skill_id`: int<br>`option_deny_final_stage_flag`: int<br>`final_info`: [HeroesFinalIndexInfo](#type-heroesfinalindexinfo) |
| `/heroes/stage1_check_hero_skill` | ❌ missing | `HeroesStage1CheckHeroSkill` | — | `{}` (no fields) |
| `/heroes/stage1_check_opponent_teams` | ❌ missing | `HeroesStage1CheckOpponentTeams` | — | `{}` (no fields) |
| `/heroes/stage1_check_round` | ❌ missing | `HeroesStage1CheckRound` | `stage1_resume_round_num`: int | `{}` (no fields) |
| `/heroes/stage1_edit_team` | ❌ missing | `HeroesStage1EditTeam` | `entry_chara_array`: [HeroesEntryChara](#type-heroesentrychara)[]<br>`auto_edit_flag`: int | `team_edit_reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/heroes/stage1_edit_team_name` | ❌ missing | `HeroesStage1EditTeamName` | `name`: string | `name`: string |
| `/heroes/stage1_finish_set` | ❌ missing | `HeroesStage1FinishSet` | — | `stage1_finish_set`: [HeroesResponseStage1FinishSet](#type-heroesresponsestage1finishset) |
| `/heroes/stage1_get_opponent_teams` | ❌ missing | `HeroesStage1GetOpponentTeams` | — | `get_opponent_team_info`: [HeroesResponseStage1GetOpponentTeamInfo](#type-heroesresponsestage1getopponentteaminfo) |
| `/heroes/stage1_grand_result` | ❌ missing | `HeroesStage1GrandResult` | — | `stage1_grand_result`: [HeroesResponseStage1GrandResult](#type-heroesresponsestage1grandresult)<br>`stage1_finish_set`: [HeroesResponseStage1FinishSet](#type-heroesresponsestage1finishset) |
| `/heroes/stage1_honor_select_chara` | ❌ missing | `HeroesStage1HonorSelectChara` | `chara_id`: int | `stage1_resume_state`: int |
| `/heroes/stage1_honor_select_chara_list` | ❌ missing | `HeroesStage1HonorSelectCharaList` | — | `selectable_chara_list`: [HeroesHonorSelectCharaData](#type-heroeshonorselectcharadata)[]<br>`unselectable_chara_list`: [HeroesHonorSelectCharaData](#type-heroeshonorselectcharadata)[]<br>`select_honor_chara_id`: int |
| `/heroes/stage1_resume` | ❌ missing | `HeroesStage1Resume` | — | `stage1_resume_state`: int<br>`stage1_resume_round_num`: int<br>`get_opponent_team_info`: [HeroesResponseStage1GetOpponentTeamInfo](#type-heroesresponsestage1getopponentteaminfo)<br>`start_set_info`: [HeroesResponseStage1StartSet](#type-heroesresponsestage1startset)<br>`stage1_grand_result`: [HeroesResponseStage1GrandResult](#type-heroesresponsestage1grandresult) |
| `/heroes/stage1_set_option` | ❌ missing | `HeroesStage1SetOption` | `option_deny_final_stage_flag`: int | `{}` (no fields) |
| `/heroes/stage1_start_set` | ❌ missing | `HeroesStage1StartSet` | `item_id_array`: int[] | `start_set_info`: [HeroesResponseStage1StartSet](#type-heroesresponsestage1startset) |

<a id="prefix-honor"></a>
### honor

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/honor/change_honor` | ❌ missing | `HonorChangeHonor` | `honor_id`: int | `{}` (no fields) |
| `/honor/index` | ❌ missing | `HonorList` | — | `honor_list`: [HonorData](#type-honordata)[]<br>`last_checked_time`: long<br>`mission_list`: [UserMission](#type-usermission)[]<br>`story_event_mission_list`: [UserMission](#type-usermission)[] |

<a id="prefix-idle-single-mode"></a>
### idle_single_mode

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/idle_single_mode/check_progress_log` | ❌ missing | `IdleSingleModeCheckProgressLog` | — | `{}` (no fields) |
| `/idle_single_mode/end` | ❌ missing | `IdleSingleModeEnd` | — | `progress_log_info`: [IdleSingleModeProgressLogInfo](#type-idlesinglemodeprogressloginfo)<br>`end_info`: [IdleSingleModeEndInfo](#type-idlesinglemodeendinfo) |
| `/idle_single_mode/multi_race_reserve_deck` | ❌ missing | `IdleSingleModeMultiRaceReserveDeck` | `scenario_id`: int<br>`multi_race_reserve_deck`: [SingleModeMultiRaceReserveDeck](#type-singlemodemultiracereservedeck) | `reserved_race_info`: [SingleModeReservedRaceInfo](#type-singlemodereservedraceinfo) |
| `/idle_single_mode/pre_start` | ❌ missing | `IdleSingleModePreStart` | `scenario_id`: int | `reserved_race_info`: [SingleModeReservedRaceInfo](#type-singlemodereservedraceinfo)<br>`last_idle_single_mode_start_info`: [IdleSingleModeStartInfo](#type-idlesinglemodestartinfo) |
| `/idle_single_mode/result` | ❌ missing | `IdleSingleModeResult` | — | `progress_log_info`: [IdleSingleModeProgressLogInfo](#type-idlesinglemodeprogressloginfo)<br>`end_info`: [IdleSingleModeEndInfo](#type-idlesinglemodeendinfo) |
| `/idle_single_mode/start` | ❌ missing | `IdleSingleModeStart` | `single_mode_start_request_common`: [SingleModeStartRequestCommon](#type-singlemodestartrequestcommon)<br>`start_info`: [IdleSingleModeStartInfo](#type-idlesinglemodestartinfo) | `progress_info`: [IdleSingleModeProgressInfo](#type-idlesinglemodeprogressinfo)<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`user_item_array`: [UserItem](#type-useritem)[]<br>`mission_list`: [UserMission](#type-usermission)[]<br>`story_event_mission_list`: [UserMission](#type-usermission)[]<br>`story_event_chara_bonus_list`: [StoryEventCharaBonus](#type-storyeventcharabonus)[]<br>`add_trained_chara_array`: [TrainedChara](#type-trainedchara)[] |
| `/idle_single_mode/status` | ❌ missing | `IdleSingleModeStatus` | — | `progress_info`: [IdleSingleModeProgressInfo](#type-idlesinglemodeprogressinfo) |

<a id="prefix-item"></a>
### item

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/item/check_aniv_shop` | ❌ missing | `ItemCheckAnivShop` | — | `{}` (no fields) |
| `/item/exchange` | ❌ missing | `ItemExchange` | `exchange_id`: int<br>`count`: int<br>`current_num`: int<br>`get_list_time`: string | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`coin_info`: [CoinInfo](#type-coininfo)<br>`use_item_info`: [UserItem](#type-useritem) |
| `/item/exchange_multi` | ❌ missing | `ItemExchangeMulti` | `exchange_item_info_array`: [ExchangeItemInfo](#type-exchangeiteminfo)[]<br>`use_item_info_array`: [UserItem](#type-useritem)[]<br>`get_list_time`: string | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`coin_info`: [CoinInfo](#type-coininfo)<br>`use_item_info_array`: [UserItem](#type-useritem)[] |
| `/item/manual_close` | ❌ missing | `ItemManualClose` | — | `limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo) |
| `/item/sell` | ❌ missing | `ItemSell` | `item_id`: int<br>`count`: int<br>`client_own_num`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`use_item_info`: [UserItem](#type-useritem)[] |
| `/item/show_exchange` | ❌ missing | `ItemShowExchange` | — | `limit_list`: [ItemExchangeLimit](#type-itemexchangelimit)[]<br>`disabled_id_array`: int[]<br>`release_id_array`: int[]<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`limited_goods_info_array`: [LimitedGoodsInfo](#type-limitedgoodsinfo)[]<br>`new_aniv_shop_flag`: int<br>`check_aniv_shop_time_latest`: string |
| `/item/use_recovery_item` | ❌ missing | `ItemUseRecoveryItem` | `item_id`: int<br>`client_own_num`: int<br>`item_num`: int | `rp_info`: [RpInfo](#type-rpinfo)<br>`tp_info`: [TpInfo](#type-tpinfo) |

<a id="prefix-jukebox"></a>
### jukebox

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/jukebox/change_play_music` | ❌ missing | `JukeboxChangePlayMusic` | `play_music_flag`: int | `{}` (no fields) |
| `/jukebox/change_random_request` | ❌ missing | `JukeboxChangeRandomRequest` | `random_request_flag`: int | `{}` (no fields) |
| `/jukebox/change_user_request` | ❌ missing | `JukeboxChangeUserRequest` | `user_request_flag`: int | `{}` (no fields) |
| `/jukebox/draw_random_request` | ✅ implemented | `JukeboxDrawRandomRequest` | — | `request_history`: [JukeboxRequest](#type-jukeboxrequest)<br>`next_random_request_time`: string<br>`add_music_array`: [UserMusic](#type-usermusic)[] |
| `/jukebox/exec_like` | ❌ missing | `JukeboxExecLike` | `request_viewer_id`: ulong<br>`request_id`: int | `{}` (no fields) |
| `/jukebox/history` | ❌ missing | `JukeboxHistory` | — | `like_array`: [JukeboxLike](#type-jukeboxlike)[]<br>`latest_request_history`: [JukeboxRequest](#type-jukeboxrequest)<br>`request_history_array`: [JukeboxRequest](#type-jukeboxrequest)[]<br>`summary_user_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[] |
| `/jukebox/index` | ✅ implemented | `JukeboxIndex` | — | `request_history`: [JukeboxRequest](#type-jukeboxrequest)<br>`like_count`: int<br>`summary_user_info`: [UserInfoAtFriend](#type-userinfoatfriend)<br>`is_liked`: bool |
| `/jukebox/play_user_request` | ❌ missing | `JukeboxPlayUserRequest` | `music_id`: int<br>`music_size`: int | `request_id`: int |

<a id="prefix-kids-web-service"></a>
### kids_web_service

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/kids_web_service/get_email_info` | ❌ missing | `CabinedAccountGetMailInfo` | — | `email`: string |
| `/kids_web_service/register_email_address` | ❌ missing | `CabinedAccountSendAuthCode` | `one_time_password`: string | `email`: string |
| `/kids_web_service/request_register_email_address` | ❌ missing | `CabinedAccountRegisterEmailAddress` | `email`: string | `expired_time`: long |
| `/kids_web_service/send_verification_url` | ❌ missing | `CabinedAccountSendVerificationUrl` | — | `email`: string |

<a id="prefix-legend-race"></a>
### legend_race

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/legend_race/get_reward_list` | ❌ missing | `LegendRaceGetRewardList` | `legend_race_id`: int | `reward_array`: [RaceRewardData](#type-racerewarddata)[] |
| `/legend_race/index` | ❌ missing | `LegendRaceIndex` | — | `legend_race_record_array`: [LegendRaceData](#type-legendracedata)[]<br>`purchase_num`: int<br>`update_item_array`: [UserItem](#type-useritem)[]<br>`legend_race_mission_num`: int |
| `/legend_race/race_entry` | ❌ missing | `LegendRaceRaceEntry` | `legend_race_id`: int<br>`trained_chara_id`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`state`: int<br>`trained_chara_id`: int |
| `/legend_race/race_start` | ❌ missing | `LegendRaceRaceStart` | `running_style`: int<br>`is_short`: int | `race_scenario`: string<br>`state`: int<br>`running_style`: int |
| `/legend_race/recovery_ticket` | ❌ missing | `LegendRaceRecoveryTicket` | `client_coin_num`: int | `coin_info`: [CoinInfo](#type-coininfo)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`purchase_num`: int |
| `/legend_race/reflect_item_effect` | ❌ missing | `LegendRaceReflectItemEffect` | `item_id_array`: int[] | `weather`: int<br>`ground_condition`: int<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`state`: int |
| `/legend_race/replay_check` | ❌ missing | `LegendRaceReplayCheck` | `race_result_array`: [RaceResultData](#type-raceresultdata)[] | `rank`: int<br>`first_clear_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`drop_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`victory_reward_array`: [RaceRewardData](#type-racerewarddata)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`state`: int<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo) |
| `/legend_race/reset` | ❌ missing | `LegendRaceReset` | — | `state`: int |
| `/legend_race/resume` | ❌ missing | `LegendRaceResume` | — | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`random_seed`: int<br>`race_instance_id`: int<br>`race_scenario`: string<br>`state`: int<br>`purchase_num`: int<br>`is_cleared`: int |

<a id="prefix-live"></a>
### live

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/live/live_start` | ❌ missing | `LiveLiveStart` | `music_id`: int<br>`member_info_array`: [LiveTheaterMemberInfo](#type-livetheatermemberinfo)[]<br>`live_theater_setting_info`: [LiveTheaterSettingInfo](#type-livetheatersettinginfo)<br>`live_theater_vocal_chara_id_array`: int[] | `{}` (no fields) |

<a id="prefix-live-theater"></a>
### live_theater

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/live_theater/index` | ❌ missing | `LiveTheaterIndex` | — | `live_theater_save_info_array`: [LiveTheaterSaveInfo](#type-livetheatersaveinfo)[]<br>`live_theater_last_checked_time`: long |
| `/live_theater/live_start` | ❌ missing | `LiveTheaterLiveStart` | `live_theater_save_info`: [LiveTheaterSaveInfo](#type-livetheatersaveinfo)<br>`live_theater_setting_info`: [LiveTheaterSettingInfo](#type-livetheatersettinginfo)<br>`live_theater_vocal_chara_id_array`: int[] | `live_theater_save_info`: [LiveTheaterSaveInfo](#type-livetheatersaveinfo) |

<a id="prefix-live-theater-performers-preset"></a>
### live_theater_performers_preset

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/live_theater_performers_preset/index` | ❌ missing | `LiveTheaterPerformersPresetIndex` | — | `preset_array`: [LiveTheaterPerformersPreset](#type-livetheaterperformerspreset)[] |
| `/live_theater_performers_preset/update` | ❌ missing | `LiveTheaterPerformersPresetUpdate` | `preset`: [LiveTheaterPerformersPreset](#type-livetheaterperformerspreset) | `{}` (no fields) |

<a id="prefix-load"></a>
### load

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/load/index` | ✅ implemented | `Login` | `adid`: string | `common_define`: [CommonDefine](#type-commondefine)<br>`user_info`: [UserInfo](#type-userinfo)<br>`coin_info`: [CoinInfo](#type-coininfo)<br>`trained_chara`: [TrainedChara](#type-trainedchara)[]<br>`trained_chara_favorite_array`: [TrainedCharaFavorite](#type-trainedcharafavorite)[]<br>`chara_list`: [UserChara](#type-userchara)[]<br>`card_list`: [UserCard](#type-usercard)[]<br>`support_card_list`: [UserSupportCard](#type-usersupportcard)[]<br>`support_card_deck_array`: [UserSupportCardDeck](#type-usersupportcarddeck)[]<br>`last_select_support_card_deck_id`: int<br>`item_list`: [UserItem](#type-useritem)[]<br>`piece_list`: [PieceData](#type-piecedata)[]<br>`cloth_list`: [UserCloth](#type-usercloth)[]<br>`card_dress_array`: [UserCardDress](#type-usercarddress)[]<br>`music_list`: [UserMusic](#type-usermusic)[]<br>`res_version`: string<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`rp_info`: [RpInfo](#type-rpinfo)<br>`gacha_banner_info`: [GachaBannerInfo](#type-gachabannerinfo)[]<br>`gacha_campaign_info_array`: [GachaCampaignInfo](#type-gachacampaigninfo)[]<br>`user_last_checked_time_list`: [LastCheckedTime](#type-lastcheckedtime)[]<br>`menu_badge_info`: [MenuBadgeInfo](#type-menubadgeinfo)<br>`payment_purchased_times_list`: [PaymentPurchasedTimes](#type-paymentpurchasedtimes)[]<br>`user_birth`: string<br>`recheck_dmm_jewel`: string<br>`main_story_data_list`: [MainStoryData](#type-mainstorydata)[]<br>`character_story_data_list`: [CharacterStoryData](#type-characterstorydata)[]<br>`circle_data`: [CircleAtLoad](#type-circleatload)<br>`single_mode_chara_light`: [SingleModeCharaLight](#type-singlemodecharalight)<br>`home_position_info`: [HomeCharacterDressInfo](#type-homecharacterdressinfo)<br>`is_linkage`: int<br>`season_pack_info`: [PaymentSeasonPackInfo](#type-paymentseasonpackinfo)<br>`event_data_array`: [NoteDataForDisplay](#type-notedatafordisplay)[]<br>`chara_profile_array`: [CharaProfileData](#type-charaprofiledata)[]<br>`login_bonus_list`: [LoginBonusData](#type-loginbonusdata)[]<br>`team_data_array`: [TeamStadiumTeamData](#type-teamstadiumteamdata)[]<br>`directory_card_num`: int<br>`add_friend_point`: int<br>`support_user_num`: int<br>`team_stadium_user`: [TeamStadiumUser](#type-teamstadiumuser)<br>`daily_race_playing_info`: [DailyRacePlayingInfo](#type-dailyraceplayinginfo)<br>`legend_race_playing_info`: [LegendRacePlayingInfo](#type-legendraceplayinginfo)<br>`daily_legend_race_playing_info`: [DailyLegendRacePlayingInfo](#type-dailylegendraceplayinginfo)<br>`single_mode_scenario_id_array`: int[]<br>`single_mode_rental_succession_num`: int<br>`single_mode_succession_free_rental_time`: long<br>`single_mode_difficulty_info_array`: [SingleModeDifficultyInfo](#type-singlemodedifficultyinfo)[]<br>`honor_info`: [HonorInfo](#type-honorinfo)<br>`login_trophy_info_array`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)[]<br>`team_stadium_race_status`: int<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`release_item_flag`: int<br>`home_story_data_array`: [HomeStoryDataForDisplay](#type-homestorydatafordisplay)[]<br>`short_episode_data_array`: [ShortEpisodeDataForDisplay](#type-shortepisodedatafordisplay)[]<br>`home_poster_data_array`: [HomePosterDataForDisplay](#type-homeposterdatafordisplay)[]<br>`home_banner_data_array`: [HomeBannerDataForDisplay](#type-homebannerdatafordisplay)[]<br>`ranking`: [TeamStadiumRanking](#type-teamstadiumranking)<br>`border_line`: [TeamStadiumBorderLine](#type-teamstadiumborderline)<br>`tutorial_guide_data_array`: [TutorialGuideDataForDisplay](#type-tutorialguidedatafordisplay)[]<br>`last_information_update_time`: string<br>`champions_info`: [ChampionsInfo](#type-championsinfo)<br>`release_card_array`: int[]<br>`unread_announce_id_array`: int[]<br>`released_episode_data_array`: [ReleasedEpisodeDataForDisplay](#type-releasedepisodedatafordisplay)[]<br>`stadium_race_chara_id_array`: int[]<br>`extra_story_data_list`: [ExtraStoryData](#type-extrastorydata)<br>`story_event_id`: int<br>`story_event_first_flag`: bool<br>`story_event_mission_list`: [UserMission](#type-usermission)[]<br>`story_event_roulette_coin_num`: int<br>`notice_data`: [UserNoticeData](#type-usernoticedata)<br>`transfer_event_info`: [TransferEventInfo](#type-transfereventinfo)<br>`added_gacha_stock_info`: [AddedGachaStockInfo](#type-addedgachastockinfo)<br>`practice_partner_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`practice_partner_owner_info_array`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo)[]<br>`practice_race_state`: int<br>`jukebox_info`: [JukeboxInfo](#type-jukeboxinfo)<br>`jukebox_request_history`: [JukeboxRequest](#type-jukeboxrequest)<br>`training_challenge_user_info`: [TrainingChallengeUserInfo](#type-trainingchallengeuserinfo)<br>`training_challenge_exam_infos`: [TrainingChallengeExamInfo](#type-trainingchallengeexaminfo)[]<br>`valentine_campaign_received_array`: [ValentineReceivedData](#type-valentinereceiveddata)<br>`valentine_campaign_special_received_array`: [ValentineSpecialReceivedData](#type-valentinespecialreceiveddata)<br>`challenge_match_load_info`: [ChallengeMatchLoadInfo](#type-challengematchloadinfo)<br>`talk_gallery_list`: [TalkGalleryList](#type-talkgallerylist)[]<br>`fan_raid_id`: int<br>`fan_raid_first_flag`: bool<br>`team_building_load_info`: [TeamBuildingLoadInfo](#type-teambuildingloadinfo)<br>`story_favorite_array`: [StoryFavorite](#type-storyfavorite)[]<br>`team_rank_reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`before_team_rank`: int<br>`after_team_rank`: int<br>`campaign_walking_load_info`: [CampaignWalkingLoadInfo](#type-campaignwalkingloadinfo)<br>`payment_maintenance_flag`: bool<br>`collect_raid_login_info`: [CollectRaidLoginInfo](#type-collectraidlogininfo)<br>`raffle_campaign_response_data`: [RaffleCampaignResponseData](#type-rafflecampaignresponsedata)<br>`user_campaign_info_array`: [UserCampaignInfo](#type-usercampaigninfo)[]<br>`map_event_load_info`: [MapEventLoadInfo](#type-mapeventloadinfo)<br>`factor_research_load_info`: [FactorResearchLoadInfo](#type-factorresearchloadinfo)<br>`heroes_load_info`: [HeroesLoadInfo](#type-heroesloadinfo)<br>`factor_order_pass_info`: [FactorOrderPassInfo](#type-factororderpassinfo)<br>`option_info_array`: [OptionInfo](#type-optioninfo)[]<br>`optin_user_birth`: int<br>`dma_state`: int<br>`country_type`: int<br>`parental_consent`: int<br>`cygames_id_apply_product_flag`: bool<br>`cygames_id_serial_code_reward_info_array`: [SerialCodeRewardInfo](#type-serialcoderewardinfo)[]<br>`idle_single_mode_load_info`: [IdleSingleModeLoadInfo](#type-idlesinglemodeloadinfo) |

<a id="prefix-main-story"></a>
### main_story

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/main_story/first_clear` | ❌ missing | `MainStoryFirstClear` | `episode_id`: int | `main_story_data`: [MainStoryData](#type-mainstorydata)<br>`reward_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`add_music_array`: [UserMusic](#type-usermusic)[]<br>`release_item_flag`: int |

<a id="prefix-main-story-race"></a>
### main_story_race

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/main_story_race/get_entry_list` | ❌ missing | `MainStoryRaceGetEntryList` | `episode_id`: int | `entry_chara_array`: [MainStoryRaceEntryChara](#type-mainstoryraceentrychara)[] |
| `/main_story_race/get_race_table` | ❌ missing | `MainStoryRaceGetRaceTable` | `episode_id`: int<br>`trained_chara_id`: int | `race_horse_data`: [RaceHorseData](#type-racehorsedata)[] |
| `/main_story_race/race_end` | ❌ missing | `MainStoryRaceRaceEnd` | `episode_id`: int | `main_story_data_list`: [MainStoryData](#type-mainstorydata)[]<br>`reward_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/main_story_race/race_start` | ❌ missing | `MainStoryRaceRaceStart` | `episode_id`: int<br>`trained_chara_id`: int<br>`running_style`: int | `race_result_info`: [RaceResultInfo](#type-raceresultinfo)<br>`running_style`: int<br>`is_match_gimmick`: int |

<a id="prefix-map-event"></a>
### map_event

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/map_event/ending_read` | ❌ missing | `MapEventEndingRead` | — | `{}` (no fields) |
| `/map_event/flavor_text_read` | ❌ missing | `MapEventFlavorTextRead` | `flavor_text_id`: int | `{}` (no fields) |
| `/map_event/index` | ❌ missing | `MapEventIndex` | — | `gauge`: int<br>`arrival_map_point_id`: int<br>`current_area_id`: int<br>`is_area_open`: int<br>`login_update_flag`: int<br>`enable_map_point_id_array`: int[]<br>`ending_read_type`: int<br>`read_flavor_text_id_array`: int[]<br>`read_next_episode_id_array`: int[]<br>`playlist_link`: string |
| `/map_event/movie_trailer_dialog_read` | ❌ missing | `MapEventMovieTrailerDialogRead` | `next_episode_id`: int | `{}` (no fields) |
| `/map_event/point_exec` | ❌ missing | `MapEventPointExec` | `map_point_id`: int | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`story_id_array`: int[]<br>`ending_read_type`: int<br>`movie_release_time`: string |

<a id="prefix-mission"></a>
### mission

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/mission/index` | ✅ implemented | `MissionLoad` | — | `mission_list`: [UserMission](#type-usermission)[] |
| `/mission/receive` | ✅ implemented | `MissionReceive` | `mission_id_array`: int[] | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`updated_mission_array`: [UserMission](#type-usermission)[] |

<a id="prefix-note"></a>
### note

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/note/get_directory_card` | ❌ missing | `NoteGetDirectoryCard` | `card_id`: int | `directory_card_array`: [DirectoryCard](#type-directorycard)[] |
| `/note/get_new_chara_data` | ❌ missing | `NoteGetNewCharaData` | `chara_id`: int | `voice_data_array`: [NoteDataForDisplay](#type-notedatafordisplay)[]<br>`dress_id`: int<br>`mini_dress_id`: int<br>`chara_walking_act_array`: [NoteDataForDisplay](#type-notedatafordisplay)[]<br>`valentine_special_data_array`: [NoteDataForDisplay](#type-notedatafordisplay)[]<br>`update_user_chara_array`: [UserChara](#type-userchara)[]<br>`new_chara_profile_array`: [CharaProfileData](#type-charaprofiledata)[] |
| `/note/get_nickname_data` | ❌ missing | `NoteGetNicknameData` | `chara_id`: int | `nickname_id_array`: int[] |
| `/note/get_scenario_record` | ❌ missing | `NoteGetScenarioRecord` | `scenario_id`: int | `scenario_record_array`: [ScenarioRecord](#type-scenariorecord)[] |
| `/note/index` | ❌ missing | `NoteLoad` | `add_voice_data_array`: [NoteDataForRegist](#type-notedataforregist)[]<br>`add_home_story_data_array`: [HomeStoryDataForRegist](#type-homestorydataforregist)[]<br>`request_directory_card`: bool | `reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`before_directory_level`: int<br>`rank_score`: int<br>`release_card_array`: int[]<br>`score_summary`: [DirectoryScoreSummary](#type-directoryscoresummary)<br>`scenario_record_highest_score_array`: [ScenarioRecordHighestScore](#type-scenariorecordhighestscore)[]<br>`directory_card_array`: [DirectoryCard](#type-directorycard)[] |
| `/note/save_chara_data` | ❌ missing | `NoteSaveCharaData` | `chara_id`: int<br>`dress_id`: int<br>`mini_dress_id`: int | `{}` (no fields) |
| `/note/save_note_data` | ❌ missing | `NoteSaveNoteData` | — | `{}` (no fields) |
| `/note/save_voice` | ✅ implemented | `NoteSaveVoice` | `add_voice_data_array`: [NoteDataForRegist](#type-notedataforregist)[] | `{}` (no fields) |
| `/note/trainer_note` | ❌ missing | `NoteTrainerNote` | — | `update_user_chara_array`: [UserChara](#type-userchara)[]<br>`new_chara_profile_array`: [CharaProfileData](#type-charaprofiledata)[] |
| `/note/use_gallery_key` | ❌ missing | `NoteUseGalleryKey` | `gallery_type`: int<br>`client_own_num`: int<br>`story_id_array`: int[] | `item_info_array`: [UserItem](#type-useritem)[]<br>`event_data_array`: [NoteDataForDisplay](#type-notedatafordisplay)[]<br>`home_story_data_array`: [HomeStoryDataForDisplay](#type-homestorydatafordisplay)[] |

<a id="prefix-option"></a>
### option

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/option/change_option` | ✅ implemented | `OptionChangeOption` | `option_info_array`: [OptionInfo](#type-optioninfo)[] | `option_info_array`: [OptionInfo](#type-optioninfo)[] |

<a id="prefix-payment"></a>
### payment

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/payment/cancel` | ❌ missing | `PaymentCancel` | `payment`: [PaymentStartParam](#type-paymentstartparam) | `{}` (no fields) |
| `/payment/finish` | ❌ missing | `PaymentFinish` | `payment`: [PaymentFinishParam](#type-paymentfinishparam) | `first_time`: bool<br>`purchased_times_data`: [PaymentPurchaseTimesData](#type-paymentpurchasetimesdata)<br>`purchase_id`: string<br>`before_paid_coin`: int<br>`before_free_coin`: int<br>`after_paid_coin`: int<br>`after_free_coin`: int<br>`season_pack_info`: [PaymentSeasonPackInfo](#type-paymentseasonpackinfo) |
| `/payment/get_coin_break_down_info` | ❌ missing | `PaymentGetCoinBreakDownInfo` | — | `coin_break_down_info_array`: [PaymentCoinBreakDownInfo](#type-paymentcoinbreakdowninfo)[] |
| `/payment/item_list` | ✅ implemented | `PaymentItemList` | — | `data`: [PaymentPurchaseItemParam](#type-paymentpurchaseitemparam)[]<br>`season_pack_info`: [PaymentSeasonPackInfo](#type-paymentseasonpackinfo)<br>`last_checked_time`: int |
| `/payment/send_log` | ✅ implemented | `PaymentSendLog` | `log_key`: int<br>`log_message`: string | `{}` (no fields) |
| `/payment/start` | ❌ missing | `PaymentStart` | `payment`: [PaymentStartParam](#type-paymentstartparam)<br>`isalertagree`: int<br>`isalertactive`: int | `dmm_point_balance`: int<br>`is_refund_caution`: int |
| `/payment/update_birth` | ✅ implemented | `PaymentUpdateBirth` | `user_birth`: int | `user_birth`: string |

<a id="prefix-photo"></a>
### photo

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/photo/library` | ❌ missing | `PhotoLibrary` | — | `unique_id`: string<br>`unique_id_circle`: string |
| `/photo/set_activity` | ❌ missing | `PhotoSetActivity` | `action_type`: int | `{}` (no fields) |

<a id="prefix-practice-race"></a>
### practice_race

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/practice_race/change_favorite_race` | ❌ missing | `PracticeRaceChangeFavoriteRace` | `practice_race_id`: int<br>`is_favorite`: int | `practice_race_id`: int<br>`is_favorite`: int |
| `/practice_race/change_preset_name` | ❌ missing | `PracticeRaceChangePresetName` | `preset_id`: int<br>`name`: string | `preset_info`: [PracticeRacePresetInfo](#type-practiceracepresetinfo) |
| `/practice_race/create_partner_id` | ❌ missing | `PracticeRaceCreatePartnerId` | `target_trained_chara_id`: int | `partner_id`: int<br>`register_time`: string<br>`is_reach_partner_id_create_num_max`: int |
| `/practice_race/delete_partner` | ❌ missing | `PracticeRaceDeletePartner` | `target_trained_chara_id_array`: int[] | `practice_partner_chara_array`: [TrainedChara](#type-trainedchara)[] |
| `/practice_race/delete_race` | ❌ missing | `PracticeRaceDeleteRace` | `practice_race_id`: int | `state`: int |
| `/practice_race/get_follow_user_data` | ❌ missing | `PracticeRaceGetFollowUserData` | — | `follow_user_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`practice_partner_owner_info_array`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo)[] |
| `/practice_race/get_partner_id` | ❌ missing | `PracticeRaceGetPartnerId` | `target_trained_chara_id`: int | `partner_id`: int<br>`register_time`: string<br>`is_reach_partner_id_create_num_max`: int<br>`is_exist_used_history`: int<br>`daily_post_partner_count`: int<br>`is_already_circle_post_chara`: int |
| `/practice_race/get_partner_info` | ❌ missing | `PracticeRaceGetPartnerInfo` | `partner_id`: int<br>`register_time`: string | `practice_partner_info`: [TrainedChara](#type-trainedchara)<br>`practice_partner_owner_info`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo) |
| `/practice_race/get_preset_array` | ❌ missing | `PracticeRaceGetPresetArray` | — | `preset_info_array`: [PracticeRacePresetInfo](#type-practiceracepresetinfo)[] |
| `/practice_race/get_saved_race_list` | ❌ missing | `PracticeRaceGetSavedRaceList` | — | `saved_race_array`: [PracticeRaceSavedRaceInfo](#type-practiceracesavedraceinfo)[] |
| `/practice_race/index` | ❌ missing | `PracticeRaceIndex` | — | `state`: int<br>`practice_race_id`: int |
| `/practice_race/race_end` | ❌ missing | `PracticeRaceRaceEnd` | `is_save`: int<br>`overwrite_race_id`: int | `state`: int |
| `/practice_race/race_replay` | ❌ missing | `PracticeRaceRaceReplay` | `practice_race_id`: int | `trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`race_result_info`: [RaceResultInfo](#type-raceresultinfo)<br>`entry_info_array`: [PracticeRaceEntryInfo](#type-practiceraceentryinfo)[]<br>`before_season`: int<br>`before_weather`: int<br>`before_ground_condition`: int<br>`before_motivation`: int<br>`practice_partner_owner_info_array`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo)[] |
| `/practice_race/race_start` | ❌ missing | `PracticeRaceRaceStart` | `race_instance_id`: int<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`race_time`: int<br>`motivation`: int<br>`entry_num`: int<br>`entry_chara_array`: [PracticeRaceEntryChara](#type-practiceraceentrychara)[] | `trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`race_result_info`: [RaceResultInfo](#type-raceresultinfo)<br>`entry_info_array`: [PracticeRaceEntryInfo](#type-practiceraceentryinfo)[]<br>`practice_race_id`: int<br>`state`: int<br>`practice_partner_owner_info_array`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo)[] |
| `/practice_race/save_partner` | ❌ missing | `PracticeRaceSavePartner` | `target_viewer_id`: long<br>`target_trained_chara_id`: int | `add_partner_info`: [TrainedChara](#type-trainedchara)<br>`practice_partner_owner_info`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo) |
| `/practice_race/save_preset` | ❌ missing | `PracticeRaceSavePreset` | `preset_info_array`: [PracticeRacePresetInfoForSave](#type-practiceracepresetinfoforsave)[] | `add_partner_info_array`: [TrainedChara](#type-trainedchara)[]<br>`practice_partner_owner_info_array`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo)[]<br>`preset_info_array`: [PracticeRacePresetInfo](#type-practiceracepresetinfo)[]<br>`is_excluded_flag`: int |
| `/practice_race/search_partner` | ❌ missing | `PracticeRaceSearchPartner` | `is_first`: int | `circle_user_partner_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`recommend_partner_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`practice_partner_owner_info_array`: [PracticePartnerOwnerInfo](#type-practicepartnerownerinfo)[] |
| `/practice_race/used_history` | ❌ missing | `PracticeRaceUsedHistory` | `target_trained_chara_id`: int | `practice_used_history_array`: [PracticePartnerUsedHistory](#type-practicepartnerusedhistory)[]<br>`used_count_total`: int |

<a id="prefix-pre-single-mode"></a>
### pre_single_mode

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/pre_single_mode/friend_support_card_reload` | ✅ implemented | `PreSingleModeFriendSupportCardReload` | `exclude_viewer_id_array`: long[] | `summary_user_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`support_card_data_array`: [UserSupportCard](#type-usersupportcard)[] |
| `/pre_single_mode/index` | ✅ implemented | `PreSingleModeIndex` | — | `friend_support_card_data`: [SingleModeFriendSupportCard](#type-singlemodefriendsupportcard)<br>`succession_trained_chara_data`: [SingleModeSuccessionTrainedChara](#type-singlemodesuccessiontrainedchara)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`event_succession_trained_chara_data`: [SingleModeSuccessionTrainedChara](#type-singlemodesuccessiontrainedchara)<br>`support_card_ranking_state`: int<br>`scenario_record_highest_score_array`: [ScenarioRecordHighestScore](#type-scenariorecordhighestscore)[]<br>`default_running_style_array`: [DefaultRunningStyle](#type-defaultrunningstyle)[] |

<a id="prefix-present"></a>
### present

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/present/history` | ❌ missing | `PresentHistory` | `category_filter_type`: int[]<br>`offset`: int<br>`limit`: int<br>`is_asc`: bool | `present_array`: [PresentData](#type-presentdata)[] |
| `/present/index` | ✅ implemented | `PresentIndex` | `time_filter_type`: int<br>`category_filter_type`: int[]<br>`offset`: int<br>`limit`: int<br>`is_asc`: bool | `present_array`: [PresentData](#type-presentdata)[]<br>`no_receive_present_num`: [NoReceivePresentNum](#type-noreceivepresentnum) |
| `/present/receive` | ✅ implemented | `PresentReceive` | `present_id`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`receive_present_num`: int<br>`rest_present_num`: int<br>`no_receive_support_card_count`: int<br>`no_receive_item_flg`: bool |
| `/present/receive_all` | ✅ implemented | `PresentReceiveAll` | `time_filter_type`: int<br>`category_filter_type`: int[]<br>`is_asc`: bool<br>`current_rest_present_num`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`receive_present_num`: int<br>`rest_present_num`: int<br>`no_receive_support_card_count`: int<br>`no_receive_item_flg`: bool |

<a id="prefix-raffle"></a>
### raffle

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/raffle/activate` | ❌ missing | `RaffleActivate` | — | `response_data`: [RaffleCampaignResponseData](#type-rafflecampaignresponsedata)<br>`user_campaign_info_array`: [UserCampaignInfo](#type-usercampaigninfo)[] |
| `/raffle/index` | ❌ missing | `RaffleIndex` | — | `response_data`: [RaffleCampaignResponseData](#type-rafflecampaignresponsedata) |

<a id="prefix-read-info"></a>
### read_info

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/read_info/index` | ✅ implemented | `ReadInfo` | `add_home_story_data_array`: [HomeStoryDataForRegist](#type-homestorydataforregist)[]<br>`add_short_episode_data_array`: [ShortEpisodeDataForRegist](#type-shortepisodedataforregist)[]<br>`add_home_poster_data_array`: [HomePosterDataForRegist](#type-homeposterdataforregist)[]<br>`add_tutorial_guide_data_array`: [TutorialGuideDataForRegist](#type-tutorialguidedataforregist)[]<br>`add_released_episode_data_array`: [ReleasedEpisodeDataForRegist](#type-releasedepisodedataforregist)[]<br>`add_home_banner_data_array`: [HomeBannerDataForRegist](#type-homebannerdataforregist)[]<br>`add_campaign_walking_data`: [CampaignWalkingDataForRegist](#type-campaignwalkingdataforregist)<br>`add_viewed_story_array`: [LogStoryView](#type-logstoryview)[] | `home_story_data_array`: [HomeStoryDataForDisplay](#type-homestorydatafordisplay)[]<br>`short_episode_data_array`: [ShortEpisodeDataForDisplay](#type-shortepisodedatafordisplay)[]<br>`home_poster_data_array`: [HomePosterDataForDisplay](#type-homeposterdatafordisplay)[]<br>`tutorial_guide_data_array`: [TutorialGuideDataForDisplay](#type-tutorialguidedatafordisplay)[]<br>`released_episode_data_array`: [ReleasedEpisodeDataForDisplay](#type-releasedepisodedatafordisplay)[]<br>`home_banner_data_array`: [HomeBannerDataForDisplay](#type-homebannerdatafordisplay)[]<br>`talk_gallery_data_array`: [TalkGalleryList](#type-talkgallerylist)[] |

<a id="prefix-room-match"></a>
### room_match

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/room_match/change_allow_display` | ❌ missing | `RoomMatchChangeAllowDisplay` | `room_id`: int<br>`is_allow_display`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo) |
| `/room_match/change_lock_race_result` | ❌ missing | `RoomMatchChangeLockRaceResult` | `saved_room_id`: int<br>`register_id`: ulong<br>`lock_flag`: int | `saved_room_id`: int<br>`register_id`: ulong<br>`is_locked`: int |
| `/room_match/change_preset_name` | ❌ missing | `RoomMatchRaceChangePresetName` | `preset_id`: int<br>`name`: string | `preset_info`: [PresetInfo](#type-presetinfo) |
| `/room_match/create_room` | ❌ missing | `RoomMatchCreateRoom` | `race_instance_id`: int<br>`room_name`: string<br>`message`: string<br>`entry_num`: int<br>`start_time_type`: int<br>`is_allow_watching`: int<br>`private_entry_type`: int<br>`private_entry_num`: int<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`race_time`: int<br>`motivation`: int<br>`restriction`: int<br>`restriction_type`: int<br>`entry_chara_array`: [RoomMatchEntryChara](#type-roommatchentrychara)[]<br>`exec_time`: long<br>`restrict_chara_info_array`: [RoomMatchRestrictCharaInfo](#type-roommatchrestrictcharainfo)[]<br>`is_allow_display_flag`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_detail_array`: [RoomMatchUserDetail](#type-roommatchuserdetail)[]<br>`polling_interval`: int |
| `/room_match/create_room_simple` | ❌ missing | `RoomMatchCreateRoomSimple` | `race_instance_id`: int<br>`room_name`: string<br>`message`: string<br>`entry_chara_array`: [RoomMatchEntryChara](#type-roommatchentrychara)[]<br>`exec_time`: long | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_detail_array`: [RoomMatchUserDetail](#type-roommatchuserdetail)[]<br>`polling_interval`: int |
| `/room_match/delete_race_result` | ❌ missing | `RoomMatchDeleteRaceResult` | `saved_room_id`: int<br>`register_id`: ulong | `{}` (no fields) |
| `/room_match/destroy_room` | ❌ missing | `RoomMatchDestroyRoom` | `room_id`: int | `{}` (no fields) |
| `/room_match/edit_room` | ❌ missing | `RoomMatchEditRoom` | `room_id`: int<br>`room_name`: string<br>`message`: string | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo) |
| `/room_match/enter_waiting_room` | ❌ missing | `RoomMatchEnterWaitingRoom` | `room_id`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_detail_array`: [RoomMatchUserDetail](#type-roommatchuserdetail)[]<br>`polling_interval`: int |
| `/room_match/entry_room` | ❌ missing | `RoomMatchEntryRoom` | `room_id`: int<br>`entry_chara_array`: [RoomMatchEntryChara](#type-roommatchentrychara)[] | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_detail_array`: [RoomMatchUser](#type-roommatchuser)[] |
| `/room_match/force_race_start` | ❌ missing | `RoomMatchForceRaceStart` | `room_id`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo) |
| `/room_match/get_entry_room_list` | ❌ missing | `RoomMatchGetEntryRoomList` | — | `room_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`room_user_array`: [RoomMatchUser](#type-roommatchuser)[] |
| `/room_match/get_friend_list` | ❌ missing | `RoomMatchGetFriendList` | `room_id`: int | `summary_user_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[] |
| `/room_match/get_preset_array` | ❌ missing | `RoomMatchRaceGetPresetArray` | — | `preset_info_array`: [PresetInfo](#type-presetinfo)[] |
| `/room_match/get_saved_race_result` | ❌ missing | `RoomMatchGetSavedRaceResult` | `saved_room_id`: int<br>`register_id`: ulong | `race_result`: [RoomMatchSavedRoomInfo](#type-roommatchsavedroominfo)<br>`race_scenario`: string<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int |
| `/room_match/get_saved_race_result_list` | ❌ missing | `RoomMatchGetSavedRaceResultList` | — | `race_result_array`: [RoomMatchSavedRoomInfo](#type-roommatchsavedroominfo)[]<br>`room_user_array`: [RoomMatchUser](#type-roommatchuser)[] |
| `/room_match/index` | ❌ missing | `RoomMatchIndex` | — | `join_watch_room_num`: int |
| `/room_match/leave_room` | ❌ missing | `RoomMatchLeaveRoom` | `room_id`: int | `{}` (no fields) |
| `/room_match/leave_watching` | ❌ missing | `RoomMatchLeaveWatching` | `room_id`: int | `{}` (no fields) |
| `/room_match/polling` | ❌ missing | `RoomMatchPolling` | `room_id`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_detail_array`: [RoomMatchUserDetail](#type-roommatchuserdetail)[]<br>`polling_interval`: int |
| `/room_match/race_end_result` | ❌ missing | `RoomMatchRaceEndResult` | `room_id`: int<br>`is_save_result`: int<br>`saved_room_id`: int<br>`register_id`: ulong<br>`exec_time`: long | `{}` (no fields) |
| `/room_match/race_start` | ❌ missing | `RoomMatchRaceStart` | `room_id`: int | `race_scenario`: string<br>`random_seed`: int<br>`race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`season`: int<br>`weather`: int<br>`ground_condition`: int<br>`start_time_type`: int |
| `/room_match/room_detail` | ❌ missing | `RoomMatchRoomDetail` | `room_id`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_detail_array`: [RoomMatchUserDetail](#type-roommatchuserdetail)[] |
| `/room_match/room_list` | ❌ missing | `RoomMatchRoomList` | — | `room_info_array`: [RoomMatchRoomInfo](#type-roommatchroominfo)[]<br>`room_user_array`: [RoomMatchUser](#type-roommatchuser)[]<br>`join_watch_room_num`: int |
| `/room_match/room_search` | ❌ missing | `RoomMatchRoomSearch` | `room_id`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo)<br>`room_user_array`: [RoomMatchUser](#type-roommatchuser)[]<br>`join_watch_room_num`: int |
| `/room_match/save_preset` | ❌ missing | `RoomMatchRaceSavePreset` | `preset_info_array`: [PresetInfo](#type-presetinfo)[] | `preset_info_array`: [PresetInfo](#type-presetinfo)[] |
| `/room_match/watch_room` | ❌ missing | `RoomMatchWatchRoom` | `room_id`: int | `room_info`: [RoomMatchRoomInfo](#type-roommatchroominfo) |

<a id="prefix-serial-code"></a>
### serial_code

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/serial_code/register` | ❌ missing | `SerialCodeRegister` | `serial_code`: string | `reward_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`campaign_name`: string |

<a id="prefix-single-mode"></a>
### single_mode

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/single_mode/change_running_style` | ✅ implemented | `SingleModeChangeRunningStyle` | `program_id`: int<br>`running_style`: int<br>`current_turn`: int | `{}` (no fields) |
| `/single_mode/change_short_cut` | ✅ implemented | `SingleModeChangeShortCut` | `short_cut_state`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/check_event` | ✅ implemented | `SingleModeCheckEvent` | `event_id`: int<br>`chara_id`: int<br>`choice_number`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`event_effected_factor_array`: [SuccessionEffectedFactor](#type-successioneffectedfactor)[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_running_style`: int<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/continue` | ✅ implemented | `SingleModeContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`user_item`: [UserItem](#type-useritem)<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/exec_command` | ✅ implemented | `SingleModeExecCommand` | `command_type`: int<br>`command_id`: int<br>`command_group_id`: int<br>`select_id`: int<br>`current_turn`: int<br>`current_vital`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`command_result`: [SingleModeCommandResult](#type-singlemodecommandresult)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/factor_lottery` | ✅ implemented | `SingleModeFactorLottery` | `lottery_count`: int<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`use_tp`: int | `single_mode_factor_lottery_common`: [SingleModeFactorLotteryCommon](#type-singlemodefactorlotterycommon) |
| `/single_mode/factor_select` | ✅ implemented | `SingleModeFactorSelect` | `current_turn`: int<br>`skill_id_array`: int[] | `single_mode_factor_select_common`: [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `/single_mode/finish` | ✅ implemented | `SingleModeFinish` | `is_force_delete`: bool<br>`current_turn`: int<br>`factor_lottery_id`: int | `single_mode_finish_common`: [SingleModeFinishCommon](#type-singlemodefinishcommon) |
| `/single_mode/gain_skills` | ✅ implemented | `SingleModeGainSkills` | `gain_skill_info_array`: [GainSkillInfo](#type-gainskillinfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/get_choice_reward` | ✅ implemented | `SingleModeGetChoiceReward` | `event_id`: int | `choice_reward_array`: [EventChoiceReward](#type-eventchoicereward)[] |
| `/single_mode/load` | ✅ implemented | `SingleModeLoad` | — | `single_mode_load_common`: [SingleModeLoadCommon](#type-singlemodeloadcommon)<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/minigame_end` | ❌ missing | `SingleModeMinigameEnd` | `result`: [MinigameResult](#type-minigameresult)<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/multi_race_reserve` | ❌ missing | `SingleModeMultiRaceReserve` | `deck_num`: int<br>`deck_name`: string<br>`add_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[]<br>`cancel_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[] | `reserved_race_array`: [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |
| `/single_mode/race_analyze` | ✅ implemented | `RaceAnalyze` | `program_id`: int<br>`current_turn`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[] |
| `/single_mode/race_end` | ✅ implemented | `SingleModeRaceEnd` | `current_turn`: int | `race_reward_info`: [CharaRaceReward](#type-chararacereward)<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`add_music`: [UserMusic](#type-usermusic)<br>`race_history`: [SingleRaceHistory](#type-singleracehistory)[]<br>`win_saddle_id_array`: int[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/race_entry` | ✅ implemented | `SingleModeRaceEntry` | `program_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/race_out` | ✅ implemented | `SingleModeRaceOut` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |
| `/single_mode/race_start` | ✅ implemented | `SingleModeRaceStart` | `is_short`: int<br>`current_turn`: int | `race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_scenario`: string |
| `/single_mode/start` | ✅ implemented | `SingleModeStart` | `start_chara`: [SingleModeStartChara](#type-singlemodestartchara)<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`use_tp`: int<br>`current_money`: int<br>`current_succession_rank_point`: int | `single_mode_start_common`: [SingleModeStartCommon](#type-singlemodestartcommon)<br>`ura_data_set`: [SingleModeUraDataSet](#type-singlemodeuradataset) |

<a id="prefix-single-mode-free"></a>
### single_mode_free

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/single_mode_free/change_running_style` | ❌ missing | `SingleModeFreeChangeRunningStyle` | `program_id`: int<br>`running_style`: int<br>`current_turn`: int | `{}` (no fields) |
| `/single_mode_free/change_short_cut` | ❌ missing | `SingleModeFreeChangeShortCut` | `short_cut_state`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/check_event` | ❌ missing | `SingleModeFreeCheckEvent` | `event_id`: int<br>`chara_id`: int<br>`choice_number`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`event_effected_factor_array`: [SuccessionEffectedFactor](#type-successioneffectedfactor)[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_running_style`: int<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/continue` | ❌ missing | `SingleModeFreeContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`user_item`: [UserItem](#type-useritem)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/exec_command` | ❌ missing | `SingleModeFreeExecCommand` | `command_type`: int<br>`command_id`: int<br>`command_group_id`: int<br>`select_id`: int<br>`current_turn`: int<br>`current_vital`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`command_result`: [SingleModeCommandResult](#type-singlemodecommandresult)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/factor_lottery` | ❌ missing | `SingleModeFreeFactorLottery` | `lottery_count`: int<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`use_tp`: int | `single_mode_factor_lottery_common`: [SingleModeFactorLotteryCommon](#type-singlemodefactorlotterycommon) |
| `/single_mode_free/factor_select` | ❌ missing | `SingleModeFreeFactorSelect` | `current_turn`: int<br>`skill_id_array`: int[] | `single_mode_factor_select_common`: [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `/single_mode_free/finish` | ❌ missing | `SingleModeFreeFinish` | `is_force_delete`: bool<br>`current_turn`: int<br>`factor_lottery_id`: int | `single_mode_finish_common`: [SingleModeFinishCommon](#type-singlemodefinishcommon) |
| `/single_mode_free/gain_skills` | ❌ missing | `SingleModeFreeGainSkills` | `gain_skill_info_array`: [GainSkillInfo](#type-gainskillinfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/get_choice_reward` | ❌ missing | `SingleModeFreeChoiceReward` | `event_id`: int | `choice_reward_array`: [EventChoiceReward](#type-eventchoicereward)[] |
| `/single_mode_free/load` | ❌ missing | `SingleModeFreeLoad` | — | `single_mode_load_common`: [SingleModeLoadCommon](#type-singlemodeloadcommon)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/minigame_end` | ❌ missing | `SingleModeFreeMinigameEnd` | `result`: [MinigameResult](#type-minigameresult)<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/multi_item_exchange` | ❌ missing | `SingleModeFreeMultiItemExchange` | `exchange_item_info_array`: [SingleModeFreeExchangeItemInfo](#type-singlemodefreeexchangeiteminfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/multi_item_exchange_2` | ❌ missing | `SingleModeFreeMultiItemExchange2` | `exchange_item_info_array`: [SingleModeFreeExchangeItemInfo](#type-singlemodefreeexchangeiteminfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/multi_item_use` | ❌ missing | `SingleModeFreeMultiItemUse` | `use_item_info_array`: [SingleModeFreeUseItemInfo](#type-singlemodefreeuseiteminfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/multi_race_reserve` | ❌ missing | `SingleModeFreeMultiRaceReserve` | `deck_num`: int<br>`deck_name`: string<br>`add_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[]<br>`cancel_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[] | `reserved_race_array`: [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |
| `/single_mode_free/race_analyze` | ❌ missing | `SingleModeFreeRaceAnalyze` | `program_id`: int<br>`current_turn`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[] |
| `/single_mode_free/race_end` | ❌ missing | `SingleModeFreeRaceEnd` | `current_turn`: int | `race_reward_info`: [CharaRaceReward](#type-chararacereward)<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`add_music`: [UserMusic](#type-usermusic)<br>`race_history`: [SingleRaceHistory](#type-singleracehistory)[]<br>`win_saddle_id_array`: int[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/race_entry` | ❌ missing | `SingleModeFreeRaceEntry` | `program_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/race_out` | ❌ missing | `SingleModeFreeRaceOut` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |
| `/single_mode_free/race_start` | ❌ missing | `SingleModeFreeRaceStart` | `is_short`: int<br>`current_turn`: int | `race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_scenario`: string |
| `/single_mode_free/start` | ❌ missing | `SingleModeFreeStart` | `start_chara`: [SingleModeStartChara](#type-singlemodestartchara)<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`current_money`: int<br>`use_tp`: int<br>`current_succession_rank_point`: int | `single_mode_start_common`: [SingleModeStartCommon](#type-singlemodestartcommon)<br>`free_data_set`: [SingleModeFreeDataSet](#type-singlemodefreedataset) |

<a id="prefix-single-mode-live"></a>
### single_mode_live

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/single_mode_live/change_running_style` | ❌ missing | `SingleModeLiveChangeRunningStyle` | `program_id`: int<br>`running_style`: int<br>`current_turn`: int | `{}` (no fields) |
| `/single_mode_live/change_short_cut` | ❌ missing | `SingleModeLiveChangeShortCut` | `short_cut_state`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/check_event` | ❌ missing | `SingleModeLiveCheckEvent` | `event_id`: int<br>`chara_id`: int<br>`choice_number`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`event_effected_factor_array`: [SuccessionEffectedFactor](#type-successioneffectedfactor)[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_running_style`: int<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/continue` | ❌ missing | `SingleModeLiveContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`user_item`: [UserItem](#type-useritem)<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/exec_command` | ❌ missing | `SingleModeLiveExecCommand` | `command_type`: int<br>`command_id`: int<br>`command_group_id`: int<br>`select_id`: int<br>`current_turn`: int<br>`current_vital`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`command_result`: [SingleModeCommandResult](#type-singlemodecommandresult)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/factor_lottery` | ❌ missing | `SingleModeLiveFactorLottery` | `lottery_count`: int<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`use_tp`: int | `single_mode_factor_lottery_common`: [SingleModeFactorLotteryCommon](#type-singlemodefactorlotterycommon) |
| `/single_mode_live/factor_select` | ❌ missing | `SingleModeLiveFactorSelect` | `current_turn`: int<br>`skill_id_array`: int[] | `single_mode_factor_select_common`: [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `/single_mode_live/finish` | ❌ missing | `SingleModeLiveFinish` | `is_force_delete`: bool<br>`factor_lottery_id`: int<br>`current_turn`: int | `single_mode_finish_common`: [SingleModeFinishCommon](#type-singlemodefinishcommon) |
| `/single_mode_live/gain_skills` | ❌ missing | `SingleModeLiveGainSkills` | `gain_skill_info_array`: [GainSkillInfo](#type-gainskillinfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/get_choice_reward` | ❌ missing | `SingleModeLiveGetChoiceReward` | `event_id`: int | `choice_reward_array`: [EventChoiceReward](#type-eventchoicereward)[] |
| `/single_mode_live/live_start` | ❌ missing | `SingleModeLiveLiveStart` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset)<br>`add_music`: [UserMusic](#type-usermusic) |
| `/single_mode_live/load` | ❌ missing | `SingleModeLiveLoad` | — | `single_mode_load_common`: [SingleModeLoadCommon](#type-singlemodeloadcommon)<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/lottery_square` | ❌ missing | `SingleModeLiveLotterySquare` | `square_id`: int<br>`current_turn`: int | `live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/master_square` | ❌ missing | `SingleModeLiveMasterSquare` | `square_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/minigame_end` | ❌ missing | `SingleModeLiveMinigameEnd` | `result`: [MinigameResult](#type-minigameresult)<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/multi_race_reserve` | ❌ missing | `SingleModeLiveMultiRaceReserve` | `deck_num`: int<br>`deck_name`: string<br>`add_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[]<br>`cancel_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[] | `reserved_race_array`: [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |
| `/single_mode_live/race_analyze` | ❌ missing | `SingleModeLiveRaceAnalyze` | `program_id`: int<br>`current_turn`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[] |
| `/single_mode_live/race_end` | ❌ missing | `SingleModeLiveRaceEnd` | `current_turn`: int | `race_reward_info`: [CharaRaceReward](#type-chararacereward)<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`add_music`: [UserMusic](#type-usermusic)<br>`race_history`: [SingleRaceHistory](#type-singleracehistory)[]<br>`win_saddle_id_array`: int[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/race_entry` | ❌ missing | `SingleModeLiveRaceEntry` | `program_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/race_out` | ❌ missing | `SingleModeLiveRaceOut` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |
| `/single_mode_live/race_start` | ❌ missing | `SingleModeLiveRaceStart` | `is_short`: int<br>`current_turn`: int | `race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_scenario`: string |
| `/single_mode_live/reserve_square` | ❌ missing | `SingleModeLiveReserveSquare` | `square_id`: int<br>`current_turn`: int | `{}` (no fields) |
| `/single_mode_live/start` | ❌ missing | `SingleModeLiveStart` | `start_chara`: [SingleModeStartChara](#type-singlemodestartchara)<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`current_money`: int<br>`use_tp`: int<br>`current_succession_rank_point`: int | `single_mode_start_common`: [SingleModeStartCommon](#type-singlemodestartcommon)<br>`live_data_set`: [SingleModeLiveDataSet](#type-singlemodelivedataset) |

<a id="prefix-single-mode-team"></a>
### single_mode_team

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/single_mode_team/change_running_style` | ❌ missing | `SingleModeTeamChangeRunningStyle` | `program_id`: int<br>`running_style`: int<br>`current_turn`: int | `{}` (no fields) |
| `/single_mode_team/change_short_cut` | ❌ missing | `SingleModeTeamChangeShortCut` | `short_cut_state`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/check_event` | ❌ missing | `SingleModeTeamCheckEvent` | `event_id`: int<br>`chara_id`: int<br>`choice_number`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`event_effected_factor_array`: [SuccessionEffectedFactor](#type-successioneffectedfactor)[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_running_style`: int<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/continue` | ❌ missing | `SingleModeTeamContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`user_item`: [UserItem](#type-useritem)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/exec_command` | ❌ missing | `SingleModeTeamExecCommand` | `command_type`: int<br>`command_id`: int<br>`command_group_id`: int<br>`select_id`: int<br>`current_turn`: int<br>`current_vital`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`command_result`: [SingleModeCommandResult](#type-singlemodecommandresult)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/factor_lottery` | ❌ missing | `SingleModeTeamFactorLottery` | `lottery_count`: int<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`use_tp`: int | `single_mode_factor_lottery_common`: [SingleModeFactorLotteryCommon](#type-singlemodefactorlotterycommon) |
| `/single_mode_team/factor_select` | ❌ missing | `SingleModeTeamFactorSelect` | `current_turn`: int<br>`skill_id_array`: int[] | `single_mode_factor_select_common`: [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `/single_mode_team/finish` | ❌ missing | `SingleModeTeamFinish` | `is_force_delete`: bool<br>`current_turn`: int<br>`factor_lottery_id`: int | `single_mode_finish_common`: [SingleModeFinishCommon](#type-singlemodefinishcommon) |
| `/single_mode_team/gain_skills` | ❌ missing | `SingleModeTeamGainSkills` | `gain_skill_info_array`: [GainSkillInfo](#type-gainskillinfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/get_choice_reward` | ❌ missing | `SingleModeTeamGetChoiceReward` | `event_id`: int | `choice_reward_array`: [EventChoiceReward](#type-eventchoicereward)[] |
| `/single_mode_team/load` | ❌ missing | `SingleModeTeamLoad` | — | `single_mode_load_common`: [SingleModeLoadCommon](#type-singlemodeloadcommon)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/minigame_end` | ❌ missing | `SingleModeTeamMinigameEnd` | `result`: [MinigameResult](#type-minigameresult)<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/multi_race_reserve` | ❌ missing | `SingleModeTeamMultiRaceReserve` | `deck_num`: int<br>`deck_name`: string<br>`add_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[]<br>`cancel_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[] | `reserved_race_array`: [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |
| `/single_mode_team/opponent_list` | ❌ missing | `SingleModeTeamOpponentList` | `current_turn`: int | `team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/race_analyze` | ❌ missing | `SingleModeTeamRaceAnalyze` | `program_id`: int<br>`current_turn`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[] |
| `/single_mode_team/race_end` | ❌ missing | `SingleModeTeamRaceEnd` | `current_turn`: int | `race_reward_info`: [CharaRaceReward](#type-chararacereward)<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`add_music`: [UserMusic](#type-usermusic)<br>`race_history`: [SingleRaceHistory](#type-singleracehistory)[]<br>`win_saddle_id_array`: int[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/race_entry` | ❌ missing | `SingleModeTeamRaceEntry` | `program_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/race_out` | ❌ missing | `SingleModeTeamRaceOut` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/race_start` | ❌ missing | `SingleModeTeamRaceStart` | `is_short`: int<br>`current_turn`: int | `race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_scenario`: string |
| `/single_mode_team/save_team_edit_flag` | ❌ missing | `SingleModeTeamSaveTeamEditFlag` | `team_edit_flag`: int<br>`current_turn`: int | `team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/start` | ❌ missing | `SingleModeTeamStart` | `start_chara`: [SingleModeStartChara](#type-singlemodestartchara)<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`current_money`: int<br>`use_tp`: int<br>`current_succession_rank_point`: int | `single_mode_start_common`: [SingleModeStartCommon](#type-singlemodestartcommon)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/team_edit` | ❌ missing | `SingleModeTeamTeamEdit` | `team_data_array`: [SingleModeTeamData](#type-singlemodeteamdata)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/team_race_analyze` | ❌ missing | `SingleModeTeamTeamRaceAnalyze` | `race_set_id`: int<br>`current_turn`: int | `analyze_mark_array`: [SingleModeTeamAnalyzeMarkArray](#type-singlemodeteamanalyzemarkarray)[] |
| `/single_mode_team/team_race_continue` | ❌ missing | `SingleModeTeamTeamRaceContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`user_item`: [UserItem](#type-useritem)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/team_race_end` | ❌ missing | `SingleModeTeamTeamRaceEnd` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset)<br>`add_music`: [UserMusic](#type-usermusic) |
| `/single_mode_team/team_race_end_out` | ❌ missing | `SingleModeTeamTeamRaceEndOut` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset)<br>`add_music`: [UserMusic](#type-usermusic)<br>`tmp_team_rank`: int<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[] |
| `/single_mode_team/team_race_out` | ❌ missing | `SingleModeTeamTeamRaceOut` | `current_turn`: int | `tmp_team_rank`: int<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |
| `/single_mode_team/team_race_start` | ❌ missing | `SingleModeTeamTeamRaceStart` | `team_race_set_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`team_data_set`: [SingleModeTeamDataSet](#type-singlemodeteamdataset) |

<a id="prefix-single-mode-venus"></a>
### single_mode_venus

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/single_mode_venus/change_running_style` | ❌ missing | `SingleModeVenusChangeRunningStyle` | `program_id`: int<br>`running_style`: int<br>`current_turn`: int | `{}` (no fields) |
| `/single_mode_venus/change_short_cut` | ❌ missing | `SingleModeVenusChangeShortCut` | `short_cut_state`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/check_event` | ❌ missing | `SingleModeVenusCheckEvent` | `event_id`: int<br>`chara_id`: int<br>`choice_number`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`event_effected_factor_array`: [SuccessionEffectedFactor](#type-successioneffectedfactor)[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_running_style`: int<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/continue` | ❌ missing | `SingleModeVenusContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`user_item`: [UserItem](#type-useritem)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/exec_command` | ❌ missing | `SingleModeVenusExecCommand` | `command_type`: int<br>`command_id`: int<br>`command_group_id`: int<br>`select_id`: int<br>`current_turn`: int<br>`current_vital`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`not_up_parameter_info`: [NotUpParameterInfo](#type-notupparameterinfo)<br>`not_down_parameter_info`: [NotDownParameterInfo](#type-notdownparameterinfo)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`command_result`: [SingleModeCommandResult](#type-singlemodecommandresult)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/factor_lottery` | ❌ missing | `SingleModeVenusFactorLottery` | `lottery_count`: int<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`use_tp`: int | `single_mode_factor_lottery_common`: [SingleModeFactorLotteryCommon](#type-singlemodefactorlotterycommon) |
| `/single_mode_venus/factor_select` | ❌ missing | `SingleModeVenusFactorSelect` | `current_turn`: int<br>`skill_id_array`: int[] | `single_mode_factor_select_common`: [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `/single_mode_venus/finish` | ❌ missing | `SingleModeVenusFinish` | `is_force_delete`: bool<br>`current_turn`: int<br>`factor_lottery_id`: int | `single_mode_finish_common`: [SingleModeFinishCommon](#type-singlemodefinishcommon) |
| `/single_mode_venus/gain_skills` | ❌ missing | `SingleModeVenusGainSkills` | `gain_skill_info_array`: [GainSkillInfo](#type-gainskillinfo)[]<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/get_choice_reward` | ❌ missing | `SingleModeVenusGetChoiceReward` | `event_id`: int | `choice_reward_array`: [EventChoiceReward](#type-eventchoicereward)[] |
| `/single_mode_venus/load` | ❌ missing | `SingleModeVenusLoad` | — | `single_mode_load_common`: [SingleModeLoadCommon](#type-singlemodeloadcommon)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/minigame_end` | ❌ missing | `SingleModeVenusMinigameEnd` | `result`: [MinigameResult](#type-minigameresult)<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/multi_race_reserve` | ❌ missing | `SingleModeVenusMultiRaceReserve` | `deck_num`: int<br>`deck_name`: string<br>`add_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[]<br>`cancel_race_array`: [SingleModeReservedRace](#type-singlemodereservedrace)[] | `reserved_race_array`: [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/race_analyze` | ❌ missing | `SingleModeVenusRaceAnalyze` | `program_id`: int<br>`current_turn`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[] |
| `/single_mode_venus/race_end` | ❌ missing | `SingleModeVenusRaceEnd` | `current_turn`: int | `race_reward_info`: [CharaRaceReward](#type-chararacereward)<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`add_music`: [UserMusic](#type-usermusic)<br>`race_history`: [SingleRaceHistory](#type-singleracehistory)[]<br>`win_saddle_id_array`: int[]<br>`race_condition_array`: [SingleModeRaceCondition](#type-singlemoderacecondition)[]<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/race_entry` | ❌ missing | `SingleModeVenusRaceEntry` | `program_id`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/race_out` | ❌ missing | `SingleModeVenusRaceOut` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/race_start` | ❌ missing | `SingleModeVenusRaceStart` | `is_short`: int<br>`current_turn`: int | `race_start_info`: [SingleRaceStartInfo](#type-singleracestartinfo)<br>`race_scenario`: string |
| `/single_mode_venus/spirit_history` | ❌ missing | `SingleModeVenusVenusSpiritHistory` | `current_turn`: int | `spirit_history_info_array`: [SingleModeVenusSpiritHistoryInfo](#type-singlemodevenusspirithistoryinfo)[] |
| `/single_mode_venus/spirit_use` | ❌ missing | `SingleModeVenusSpiritUse` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/start` | ❌ missing | `SingleModeVenusStart` | `start_chara`: [SingleModeStartChara](#type-singlemodestartchara)<br>`tp_info`: [TpInfo](#type-tpinfo)<br>`current_money`: int<br>`use_tp`: int<br>`current_succession_rank_point`: int | `single_mode_start_common`: [SingleModeStartCommon](#type-singlemodestartcommon)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/venus_race_continue` | ❌ missing | `SingleModeVenusVenusRaceContinue` | `continue_type`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`home_info`: [SingleModeHomeInfo](#type-singlemodehomeinfo)<br>`user_item`: [UserItem](#type-useritem)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/venus_race_end` | ❌ missing | `SingleModeVenusVenusRaceEnd` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`race_add_reward_info`: [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[]<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset)<br>`add_trophy_info`: [LoginUserTrophyInfo](#type-loginusertrophyinfo)<br>`trophy_reward_info`: [RaceRewardData](#type-racerewarddata)<br>`win_saddle_id_array`: int[]<br>`race_history`: [SingleRaceHistory](#type-singleracehistory)[] |
| `/single_mode_venus/venus_race_entry` | ❌ missing | `SingleModeVenusVenusRaceEntry` | `current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/venus_race_out` | ❌ missing | `SingleModeVenusVenusRaceOut` | `current_turn`: int | `unchecked_event_array`: [SingleModeEventInfo](#type-singlemodeeventinfo)[]<br>`chara_info`: [SingleModeChara](#type-singlemodechara)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |
| `/single_mode_venus/venus_race_start` | ❌ missing | `SingleModeVenusVenusRaceStart` | `is_short`: int<br>`current_turn`: int | `chara_info`: [SingleModeChara](#type-singlemodechara)<br>`venus_data_set`: [SingleModeVenusDataSet](#type-singlemodevenusdataset) |

<a id="prefix-story-event"></a>
### story_event

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/story_event/announce` | ❌ missing | `StoryEventAnnounce` | — | `content`: string |
| `/story_event/index` | ❌ missing | `StoryEventIndex` | — | `event_id`: int<br>`event_user_info`: [StoryEventUserInfo](#type-storyeventuserinfo)<br>`mission_list`: [UserMission](#type-usermission)[]<br>`story_data_list`: [StoryEventStoryData](#type-storyeventstorydata)[]<br>`new_story_id_list`: int[]<br>`first_access_flag`: bool |
| `/story_event/receive_mission` | ❌ missing | `StoryEventReceiveMission` | `mission_id_array`: int[] | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`updated_mission_array`: [UserMission](#type-usermission)[]<br>`add_event_point`: int<br>`add_roulette_coin_num`: int<br>`new_story_id_list`: int[]<br>`get_all_point_reward`: bool |
| `/story_event/roulette` | ❌ missing | `StoryEventRoulette` | — | `event_user_info`: [StoryEventUserInfo](#type-storyeventuserinfo)<br>`user_roulette_order_list`: int[]<br>`roulette_reward_list`: [StoryEventRouletteReward](#type-storyeventroulettereward)[]<br>`bingo_info`: [StoryEventBingoData](#type-storyeventbingodata)[]<br>`first_access_flag`: bool<br>`roulette_exec_count`: int |
| `/story_event/roulette_change_sheet` | ❌ missing | `StoryEventRouletteChangeSheet` | — | `change_sheet_num`: int<br>`change_roulette_reward_list`: [StoryEventRouletteReward](#type-storyeventroulettereward)[] |
| `/story_event/roulette_exec` | ❌ missing | `StoryEventRouletteExec` | `roulette_coin_num`: int<br>`continuous_setting`: int | `order_list`: int[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`roulette_reward_list`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`new_bingo_line_array`: int[]<br>`bingo_reward_list`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`change_sheet_num`: int<br>`change_roulette_reward_list`: [StoryEventRouletteReward](#type-storyeventroulettereward)[]<br>`roulette_exec_count`: int<br>`roulette_stop_type`: int |
| `/story_event/story_clear` | ❌ missing | `StoryEventStoryClear` | `episode_id`: int | `story_data`: [StoryEventStoryData](#type-storyeventstorydata)<br>`reward_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`new_story_id_list`: int[]<br>`add_music_array`: [UserMusic](#type-usermusic)[] |

<a id="prefix-support-card"></a>
### support_card

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/support_card/change_lock` | ✅ implemented | `SupportCardChangeLock` | `support_card_id`: int<br>`lock_flag`: int | `support_card_id`: int<br>`is_locked`: int |
| `/support_card/get_support_card_event_skill` | ✅ implemented | `SupportCardGetSupportCardEventSkill` | `support_card_id`: int | `event_skill_list`: [EventSkill](#type-eventskill)[] |
| `/support_card/limit_break` | ✅ implemented | `SupportCardLimitBreak` | `support_card_id`: int<br>`material_support_card_num`: int | `support_card_data`: [UserSupportCard](#type-usersupportcard) |
| `/support_card/limit_break_item` | ✅ implemented | `SupportCardLimitBreakItem` | `support_card_id`: int<br>`limit_break_item_id`: int<br>`limit_break_count`: int | `support_card_data`: [UserSupportCard](#type-usersupportcard)<br>`item_data_array`: [UserItem](#type-useritem)[] |
| `/support_card/sell` | ❌ missing | `SupportCardSell` | `sell_support_card_info_array`: [SellSupportCardInfo](#type-sellsupportcardinfo)[] | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `/support_card/strengthen` | ✅ implemented | `SupportCardStrengthen` | `support_card_id`: int<br>`use_global_exp`: int<br>`current_global_exp`: int<br>`use_money`: int<br>`current_money`: int | `support_card_data`: [UserSupportCard](#type-usersupportcard)<br>`item_data_array`: [UserItem](#type-useritem)[] |

<a id="prefix-support-card-deck"></a>
### support_card_deck

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/support_card_deck/change_name` | ✅ implemented | `SupportCardDeckChangeName` | `deck_id`: int<br>`name`: string | `support_card_deck`: [UserSupportCardDeck](#type-usersupportcarddeck) |
| `/support_card_deck/change_party` | ✅ implemented | `SupportCardDeckChangeParty` | `support_card_deck_array`: [UserSupportCardDeckForUpdateParty](#type-usersupportcarddeckforupdateparty)[] | `support_card_deck_array`: [UserSupportCardDeck](#type-usersupportcarddeck)[] |

<a id="prefix-support-card-ranking"></a>
### support_card_ranking

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/support_card_ranking/get_ranking` | ❌ missing | `SupportCardRankingGetRanking` | — | `groups`: [SupportCardRankingGroup](#type-supportcardrankinggroup)[]<br>`is_counting`: bool<br>`first_access_flag`: bool |

<a id="prefix-talk-gallery"></a>
### talk_gallery

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/talk_gallery/index` | ❌ missing | `TalkGalleryIndex` | — | `{}` (no fields) |

<a id="prefix-team-building"></a>
### team_building

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/team_building/change_captain` | ❌ missing | `TeamBuildingChangeCaptain` | `trained_chara_id`: int<br>`running_style`: int | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`team_score`: int |
| `/team_building/change_running_style` | ❌ missing | `TeamBuildingChangeRunningStyle` | `running_style_info_array`: [TeamBuildingRunningStyleInfo](#type-teambuildingrunningstyleinfo)[] | `{}` (no fields) |
| `/team_building/change_team_name` | ❌ missing | `TeamBuildingChangeTeamName` | `name`: string | `name`: string |
| `/team_building/get_ranking` | ❌ missing | `TeamBuildingGetRanking` | — | `scout_ranking_user_list`: [TeamBuildingScoutRankUser](#type-teambuildingscoutrankuser)[] |
| `/team_building/index` | ❌ missing | `TeamBuildingIndex` | — | `own_team_info`: [TeamBuidingTeamInfo](#type-teambuidingteaminfo)<br>`race_rotation_info`: [RaceRotationInfo](#type-racerotationinfo)<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`total_race_count`: int<br>`total_win_count`: int<br>`straight_win_count`: int<br>`best_team_score`: int<br>`state`: int<br>`purchase_ticket_num`: int<br>`collection_chara_array`: [TeamBuildingCollectionChara](#type-teambuildingcollectionchara)[]<br>`collection_group_id_array`: int[]<br>`new_collection_group_id_array`: int[]<br>`is_season_change`: int<br>`mission_badge_num`: int<br>`daily_continue_num`: int<br>`scout_ranking_state`: int<br>`special_race_info`: [TeamBuildingSpecialRaceInfo](#type-teambuildingspecialraceinfo) |
| `/team_building/make_team` | ❌ missing | `TeamBuildingMakeTeam` | `trained_chara_id`: int<br>`running_style`: int<br>`name`: string | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`participate_reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`team_score`: int<br>`state`: int |
| `/team_building/opponent_array` | ❌ missing | `TeamBuildingOpponentArray` | — | `opponent_array`: [TeamBuidingTeamInfo](#type-teambuidingteaminfo)[]<br>`expectation_scout_point_array`: [TeamBuildingExpectationScoutPointInfo](#type-teambuildingexpectationscoutpointinfo)[] |
| `/team_building/opponent_array_special` | ❌ missing | `TeamBuildingOpponentArraySpecial` | — | `opponent_special_array`: [TeamBuildingTeamInfoSpecial](#type-teambuildingteaminfospecial)[]<br>`expectation_scout_point_array`: [TeamBuildingExpectationScoutPointInfo](#type-teambuildingexpectationscoutpointinfo)[]<br>`special_race_condition`: [RaceConditionInfo](#type-raceconditioninfo) |
| `/team_building/race_continue` | ❌ missing | `TeamBuildingRaceContinue` | `client_daily_continue_num`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`random_seed`: int<br>`state`: int<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`continue_num`: int<br>`daily_continue_num`: int |
| `/team_building/race_entry` | ❌ missing | `TeamBuildingRaceEntry` | `team_id`: int | `race_horse_data_array`: [RaceHorseData](#type-racehorsedata)[]<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`random_seed`: int<br>`state`: int |
| `/team_building/race_result` | ❌ missing | `TeamBuildingRaceResult` | — | `race_rotation_info`: [RaceRotationInfo](#type-racerotationinfo)<br>`team_score`: int<br>`scout_point_info`: [TeamBuildingScoutPointInfo](#type-teambuildingscoutpointinfo)<br>`basic_reward_array`: [ResponseItem](#type-responseitem)[]<br>`win_reward_array`: [ResponseItem](#type-responseitem)[]<br>`team_score_reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`add_collection_chara_array`: [TeamBuildingCollectionChara](#type-teambuildingcollectionchara)[]<br>`add_collection_group_id_array`: int[]<br>`state`: int |
| `/team_building/race_start` | ❌ missing | `TeamBuildingRaceStart` | `is_short`: int | `race_scenario`: string<br>`state`: int |
| `/team_building/recovery_ticket` | ❌ missing | `TeamBuildingRecoveryTicket` | `count`: int<br>`client_own_num`: int | `coin_info`: [CoinInfo](#type-coininfo)<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`purchase_ticket_num`: int |
| `/team_building/resume` | ❌ missing | `TeamBuildingResume` | — | `opponent_team_info`: [TeamBuidingTeamInfo](#type-teambuidingteaminfo)<br>`race_result_info`: [RaceResultInfo](#type-raceresultinfo)<br>`state`: int<br>`continue_num`: int |
| `/team_building/save_collection` | ❌ missing | `TeamBuildingSaveCollection` | `check_chara_flag`: int<br>`check_skill_flag`: int | `{}` (no fields) |
| `/team_building/scout` | ❌ missing | `TeamBuildingScout` | `own_team_member_id`: int<br>`opponent_team_member_id`: int<br>`running_style`: int | `reward_array`: [ResponseItem](#type-responseitem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`team_score`: int<br>`item_data_array`: [UserItem](#type-useritem)[]<br>`state`: int |
| `/team_building/use_recovery_item` | ❌ missing | `TeamBuildingUseRecoveryItem` | `item_id`: int<br>`client_own_num`: int<br>`item_num`: int | `item_info_array`: [UserItem](#type-useritem)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`purchase_ticket_num`: int |

<a id="prefix-team-stadium"></a>
### team_stadium

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/team_stadium/all_race_end` | ✅ implemented | `TeamStadiumAllRaceEnd` | — | `add_friend_point`: int<br>`add_fan_info_array`: [TeamStadiumAddFanInfo](#type-teamstadiumaddfaninfo)[]<br>`add_love_point`: int<br>`update_user_chara_array`: [UserChara](#type-userchara)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`winning_reward_content_array`: [TeamStadiumWinningRewardContent](#type-teamstadiumwinningrewardcontent)[]<br>`total_score_info`: [TeamStadiumTotalScoreInfo](#type-teamstadiumtotalscoreinfo)<br>`final_win_type`: int<br>`is_update_high_score`: int<br>`ranking_rank`: int<br>`mvp_chara_id`: int<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`circle_point`: ulong<br>`new_chara_profile_array`: [CharaProfileData](#type-charaprofiledata)[]<br>`ranking`: [TeamStadiumRanking](#type-teamstadiumranking)<br>`border_line`: [TeamStadiumBorderLine](#type-teamstadiumborderline)<br>`campaign_id_array`: int[]<br>`campaign_walking_gauge_info`: [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo)<br>`map_event_gauge_info`: [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo)<br>`factor_research_gauge_info`: [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo) |
| `/team_stadium/decide_frame_order` | ✅ implemented | `TeamStadiumDecideFrameOrder` | `opponent_info`: [TeamStadiumOpponent](#type-teamstadiumopponent) | `frame_order_info_array`: [TeamStadiumFrameOrder](#type-teamstadiumframeorder)[]<br>`user_team_data_array_copy`: [TeamStadiumTeamData](#type-teamstadiumteamdata)[]<br>`user_trained_chara_array_copy`: [TrainedChara](#type-trainedchara)[]<br>`opponent_info_copy`: [TeamStadiumOpponent](#type-teamstadiumopponent)<br>`opponent_chara_info_array_latest_copy`: [TrainedChara](#type-trainedchara)[]<br>`winning_reward_guarantee_status`: int |
| `/team_stadium/index` | ✅ implemented | `TeamStadiumIndex` | — | `team_stadium_id`: int<br>`team_stadium_user`: [TeamStadiumUser](#type-teamstadiumuser)<br>`ranking`: [TeamStadiumRanking](#type-teamstadiumranking)<br>`border_line`: [TeamStadiumBorderLine](#type-teamstadiumborderline)<br>`team_class_change_state`: int<br>`reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`race_status`: int<br>`term_state`: int |
| `/team_stadium/opponent_list` | ✅ implemented | `TeamStadiumOpponentList` | — | `opponent_info_array`: [TeamStadiumOpponent](#type-teamstadiumopponent)[] |
| `/team_stadium/ranking` | ❌ missing | `TeamStadiumRanking` | `ranking_type`: int | `ranking_array`: [TeamStadiumRanking](#type-teamstadiumranking)[]<br>`summary_user_info_array`: [UserInfoAtFriend](#type-userinfoatfriend)[]<br>`user_friend_array`: [UserFriend](#type-userfriend)[] |
| `/team_stadium/replay_check` | ✅ implemented | `TeamStadiumReplayCheck` | `round`: int | `last_checked_round`: int |
| `/team_stadium/start` | ✅ implemented | `TeamStadiumStart` | `item_id_array`: int[] | `use_item_id_array`: int[]<br>`race_start_params_array`: [TeamStadiumRaceStartParams](#type-teamstadiumracestartparams)[]<br>`race_result_array`: [TeamStadiumRaceResult](#type-teamstadiumraceresult)[]<br>`rp_info`: [RpInfo](#type-rpinfo)<br>`item_info_array`: [UserItem](#type-useritem)[]<br>`is_include_unsupported_race`: bool<br>`winning_reward_info_array`: [TeamStadiumWinningRewardInfo](#type-teamstadiumwinningrewardinfo)[]<br>`winning_reward_guarantee_status`: int<br>`last_checked_round`: int<br>`support_card_bonus`: int<br>`user_team_data_array_copy`: [TeamStadiumTeamData](#type-teamstadiumteamdata)[]<br>`user_trained_chara_array_copy`: [TrainedChara](#type-trainedchara)[]<br>`opponent_info_copy`: [TeamStadiumOpponent](#type-teamstadiumopponent)<br>`opponent_chara_info_array_latest_copy`: [TrainedChara](#type-trainedchara)[] |
| `/team_stadium/team_edit` | ✅ implemented | `TeamStadiumTeamEdit` | `team_data_array`: [TeamStadiumTeamData](#type-teamstadiumteamdata)[]<br>`team_evaluation_point`: int | `reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`before_rank`: int<br>`after_rank`: int |
| `/team_stadium/user_detail` | ❌ missing | `TeamStadiumUserDetail` | `target_viewer_id`: long | `team_data_array`: [TeamStadiumTeamData](#type-teamstadiumteamdata)[]<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[] |

<a id="prefix-tool"></a>
### tool

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/tool/device_attest` | ❌ missing | `ToolDeviceAttest` | `credential`: string<br>`error_code`: int<br>`error_message`: string<br>`attestation_type`: int | `{}` (no fields) |
| `/tool/get_pre_download_resource_version` | ✅ implemented | `ToolGetPreDownloadResourceVersion` | — | `resource_version`: string |
| `/tool/get_verify_token` | ❌ missing | `ToolGetVerifyToken` | — | `token`: string |
| `/tool/pre_signup` | ✅ implemented | `ToolPreSignup` | `attestation_type`: int<br>`device_token`: string | `nonce`: string<br>`attest`: bool<br>`country_list`: [CountryInfo](#type-countryinfo)[] |
| `/tool/signup` | ✅ implemented | `ToolSignup` | `credential`: string<br>`error_code`: int<br>`error_message`: string<br>`attestation_type`: int<br>`optin_user_birth`: int<br>`dma_state`: int<br>`country`: string | `auth_key`: string |
| `/tool/start_session` | ✅ implemented | `ToolStartSession` | `attestation_type`: int<br>`device_token`: string | `is_tutorial`: bool<br>`resource_version`: string<br>`attest`: bool<br>`nonce`: string<br>`terms_updated`: bool<br>`auth_key`: string<br>`country_type`: int |
| `/tool/update_force_display_status` | ❌ missing | `UpdateForceDisplayStatus` | `event_id`: int | `{}` (no fields) |

<a id="prefix-trained-chara"></a>
### trained_chara

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/trained_chara/change_lock_multi` | ❌ missing | `TrainedCharaChangeLockMulti` | `trained_chara_id_array`: int[]<br>`lock_flag`: int<br>`icon_type`: int | `{}` (no fields) |
| `/trained_chara/change_memo` | ❌ missing | `TrainedCharaChangeMemo` | `trained_chara_id`: int<br>`memo`: string | `{}` (no fields) |
| `/trained_chara/change_nickname` | ❌ missing | `TrainedCharaChangeNickname` | `trained_chara_id`: int<br>`nickname_id`: int | `trained_chara_info`: [TrainedChara](#type-trainedchara) |
| `/trained_chara/get_succession_history_array` | ✅ implemented | `TrainedCharaGetSuccessionHistoryArray` | `target_viewer_id`: long<br>`target_trained_chara_id`: int | `succession_history_array`: [SuccessionHistory](#type-successionhistory)[] |
| `/trained_chara/load` | ✅ implemented | `TrainedCharaLoad` | — | `trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`trained_chara_favorite_array`: [TrainedCharaFavorite](#type-trainedcharafavorite)[]<br>`room_match_entry_chara_id_array`: int[] |
| `/trained_chara/remove` | ❌ missing | `TrainedCharaRemove` | `trained_chara_id_array`: int[] | `trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`transfer_event_info`: [TransferEventInfo](#type-transfereventinfo) |

<a id="prefix-training-challenge"></a>
### training_challenge

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/training_challenge/exam_select` | ❌ missing | `TrainingChallengeExamSelect` | `exam_id`: int | `{}` (no fields) |
| `/training_challenge/get_ranking` | ❌ missing | `TrainingChallengeGetRanking` | — | `ranking_user_list`: [TrainingChallengeRankUser](#type-trainingchallengerankuser)[] |
| `/training_challenge/index` | ❌ missing | `TrainingChallengeIndex` | — | `event_id`: int<br>`event_user_info`: [TrainingChallengeUserInfo](#type-trainingchallengeuserinfo)<br>`exam_infos`: [TrainingChallengeExamInfo](#type-trainingchallengeexaminfo)[]<br>`ranking_state`: int<br>`support_card_ranking_state`: int<br>`first_access_flag`: bool |

<a id="prefix-transfer"></a>
### transfer

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/transfer/detail` | ❌ missing | `TransferDetail` | `transfer_event_id`: int<br>`transfer_detail_id`: int | `transfer_event_reward_info`: [TransferEventRewardInfo](#type-transfereventrewardinfo)[]<br>`room_match_entry_chara_id_array`: int[] |
| `/transfer/exec_multi` | ❌ missing | `TransferExecMulti` | `transfer_event_id`: int<br>`transfer_detail_id`: int<br>`trained_chara_ids`: int[] | `rank`: int<br>`reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`trained_chara_array`: [TrainedChara](#type-trainedchara)[]<br>`transfer_event_info`: [TransferEventInfo](#type-transfereventinfo) |
| `/transfer/index` | ❌ missing | `TransferIndex` | `load_flag`: bool | `transfer_event_id`: int<br>`transfer_event_detail_array`: [TransferEventDetailInfo](#type-transfereventdetailinfo)[] |

<a id="prefix-tutorial"></a>
### tutorial

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/tutorial/single_mode_finish` | ✅ implemented | `TutorialSingleModeFinish` | — | `trained_chara`: [TrainedChara](#type-trainedchara)[]<br>`directory_card_array`: [DirectoryCard](#type-directorycard)[]<br>`directory_ranking`: int<br>`trained_chara_id`: int<br>`love_point_info`: [LovePointInfo](#type-lovepointinfo)<br>`reward_item_info`: [RewardSummaryInfo](#type-rewardsummaryinfo)<br>`support_card_data_array`: [UserSupportCard](#type-usersupportcard)[]<br>`limited_shop_info`: [LimitedShopInfo](#type-limitedshopinfo)<br>`update_user_chara_info`: [UserChara](#type-userchara)<br>`new_chara_profile_array`: [CharaProfileData](#type-charaprofiledata)[] |
| `/tutorial/skip` | ✅ implemented | `TutorialSkip` | — | `step`: int |
| `/tutorial/team_edit` | ✅ implemented | `TutorialTeamEdit` | `team_data_array`: [TeamStadiumTeamData](#type-teamstadiumteamdata)[]<br>`team_evaluation_point`: int | `reward_info_array`: [DisplayRewardInfo](#type-displayrewardinfo)[]<br>`before_rank`: int<br>`after_rank`: int |
| `/tutorial/update_step` | ✅ implemented | `Tutorial` | `step`: int | `{}` (no fields) |

<a id="prefix-user"></a>
### user

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/user/change_card_dress` | ❌ missing | `UserChangeCardDress` | `card_id`: int<br>`dress_id`: int | `{}` (no fields) |
| `/user/change_comment` | ❌ missing | `changeComment` | `comment`: string | `user_info`: [UserInfo](#type-userinfo) |
| `/user/change_dma_state` | ❌ missing | `UserChangeDmaState` | `target_viewer_id`: long<br>`dma_state`: int | `{}` (no fields) |
| `/user/change_favorite_character` | ❌ missing | `UserChangeFavoriteCharacter` | `set_position_info`: [HomeCharacterDressInfo](#type-homecharacterdressinfo) | `home_position_info`: [HomeCharacterDressInfo](#type-homecharacterdressinfo) |
| `/user/change_leader_card` | ❌ missing | `changeLeaderCard` | `chara_id`: int<br>`dress_id`: int | `user_info`: [UserInfo](#type-userinfo) |
| `/user/change_name` | ✅ implemented | `ChangeName` | `name`: string | `user_info`: [UserInfo](#type-userinfo) |
| `/user/change_practice_partner` | ❌ missing | `changePracticePartner` | `trained_chara_id`: int | `user_info`: [UserInfo](#type-userinfo) |
| `/user/change_sex` | ✅ implemented | `UserChangeSex` | `sex`: int | `user_info`: [UserInfo](#type-userinfo) |
| `/user/change_story_favorite` | ❌ missing | `UserChangeStoryFavorite` | `story_favorite_array`: [StoryFavorite](#type-storyfavorite)[] | `story_favorite_array`: [StoryFavorite](#type-storyfavorite)[] |
| `/user/change_support_card` | ❌ missing | `UserChangeSupportCard` | `support_card_id`: int | `user_info`: [UserInfo](#type-userinfo) |
| `/user/get_profile_card_info` | ❌ missing | `UserGetProfileCardInfo` | — | `profile_card_info`: [UserProfileCardInfo](#type-userprofilecardinfo)<br>`image_file_status`: int<br>`image_file_url`: string<br>`image_unique_id`: string |
| `/user/get_profile_info` | ✅ implemented | `UserGetProfileInfo` | `add_voice_data_array`: [NoteDataForRegist](#type-notedataforregist)[]<br>`add_home_story_data_array`: [HomeStoryDataForRegist](#type-homestorydataforregist)[] | `voice_num`: int<br>`act_num`: int<br>`good_end_num`: int<br>`team_stadium_win_count`: int<br>`single_mode_play_count`: int<br>`rank_score`: int<br>`chara_event_num`: int<br>`support_event_num`: int<br>`scenario_event_num`: int<br>`home_event_num`: int<br>`main_story_num`: int<br>`chara_story_num`: int<br>`highest_rank_score`: int |
| `/user/get_trophy_detail` | ❌ missing | `GetTrophyDetail` | `trophy_id`: int | `user_trophy_info`: [UserTrophyInfo](#type-usertrophyinfo) |
| `/user/get_trophy_info` | ❌ missing | `GetTrophyInfo` | — | `user_trophy_info_array`: [UserTrophyInfo](#type-usertrophyinfo)[]<br>`last_checked_time`: long |
| `/user/recovery_race_point` | ❌ missing | `RecoveryRacePoint` | `count`: int<br>`client_own_num`: int | `coin_info`: [CoinInfo](#type-coininfo)<br>`rp_info`: [RpInfo](#type-rpinfo) |
| `/user/recovery_trainer_point` | ❌ missing | `RecoveryTrainerPoint` | `count`: int<br>`client_own_num`: int | `coin_info`: [CoinInfo](#type-coininfo)<br>`tp_info`: [TpInfo](#type-tpinfo) |
| `/user/reset_all_card_dress` | ❌ missing | `UserResetAllCardDress` | — | `{}` (no fields) |
| `/user/reset_card_dress` | ❌ missing | `UserResetCardDress` | `card_id`: int | `{}` (no fields) |
| `/user/set_birth_day` | ❌ missing | `UserSetBirthDay` | `birth_day`: string | `user_info`: [UserInfo](#type-userinfo) |
| `/user/set_profile_card_info` | ❌ missing | `UserSetProfileCardInfo` | `profile_card_info`: [UserProfileCardInfo](#type-userprofilecardinfo)<br>`image_file`: string<br>`trained_chara_id`: int<br>`support_card_id`: int<br>`honor_id`: int | `user_info`: [UserInfo](#type-userinfo) |

<a id="prefix-valentine"></a>
### valentine

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `/valentine/index` | ❌ missing | `ValentineIndex` | `card_id`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `/valentine/special` | ❌ missing | `ValentineSpecial` | `card_id`: int | `reward_summary_info`: [RewardSummaryInfo](#type-rewardsummaryinfo) |

<a id="prefix--unresolved-"></a>
### (unresolved)

| Path | Status | Client class | Request fields | Response `data` fields |
|---|---|---|---|---|
| `?` | ❌ missing | `ItemExchangeAddFrame` | `exchange_id`: int<br>`count`: int<br>`current_num`: int<br>`get_list_time`: string | `updated_user_info`: [UserInfo](#type-userinfo)<br>`use_item_info`: [UserItem](#type-useritem) |

## Shared data types

Every class, struct and enum reachable from a request or response field. Inherited fields are flattened in.

<a id="type-addmatchpointdata"></a>
#### AddMatchPointData

| Field | Type |
|---|---|
| `add_match_point_total` | int |
| `add_match_point_base` | int |
| `add_match_point_match_bonus_skill` | int |
| `point_detail_array` | [ChallengeMatchResultPoint](#type-challengematchresultpoint)[] |

<a id="type-addedgachastockinfo"></a>
#### AddedGachaStockInfo

| Field | Type |
|---|---|
| `gacha_stock_id` | int |
| `remain_stock_count` | int |
| `expiration_time` | string |

<a id="type-campaignwalkingdataforregist"></a>
#### CampaignWalkingDataForRegist

| Field | Type |
|---|---|
| `id` | int |
| `last_checked_time` | long |

<a id="type-campaignwalkinggaugeinfo"></a>
#### CampaignWalkingGaugeInfo

| Field | Type |
|---|---|
| `before_gauge` | int |
| `after_gauge` | int |

<a id="type-campaignwalkingloadinfo"></a>
#### CampaignWalkingLoadInfo

| Field | Type |
|---|---|
| `walking_gauge` | int |
| `today_walking_num` | int |
| `show_login_bonus` | bool |
| `show_tips` | bool |
| `resume_state` | int |
| `resume_chara_id` | int |
| `resume_location_id` | int |

<a id="type-campaignwalkingresult"></a>
#### CampaignWalkingResult

| Field | Type |
|---|---|
| `chara_id` | int |
| `love_point_info` | [LovePointInfo](#type-lovepointinfo) |
| `reward_list` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `new_walking_act` | [NoteDataForDisplay](#type-notedatafordisplay) |
| `new_chara_profile_array` | [CharaProfileData](#type-charaprofiledata)[] |

<a id="type-campaignwalkingreward"></a>
#### CampaignWalkingReward

| Field | Type |
|---|---|
| `reward_id` | int |
| `exchange_count` | int |

<a id="type-challengematchloadinfo"></a>
#### ChallengeMatchLoadInfo

| Field | Type |
|---|---|
| `challenge_match_id` | int |
| `match_point` | int |
| `resume_state` | int |
| `resume_trained_chara_id` | int |

<a id="type-challengematchracedata"></a>
#### ChallengeMatchRaceData

| Field | Type |
|---|---|
| `challenge_match_race_id` | int |
| `is_cleared` | int |
| `boss_data` | [RaceHorseData](#type-racehorsedata) |
| `race_reward_limit_array` | [ChallengeMatchRaceRewardLimit](#type-challengematchracerewardlimit)[] |

<a id="type-challengematchracerewardlimit"></a>
#### ChallengeMatchRaceRewardLimit

| Field | Type |
|---|---|
| `item_category` | int |
| `item_id` | int |
| `item_num` | int |
| `current_count` | int |
| `limit_count` | int |

<a id="type-challengematchresultpoint"></a>
#### ChallengeMatchResultPoint

| Field | Type |
|---|---|
| `raw_point_id` | int |
| `num` | int |
| `point` | int |
| `point_bonus` | int |

<a id="type-championschararesult"></a>
#### ChampionsCharaResult

| Field | Type |
|---|---|
| `viewer_id` | long |
| `team_member_id` | int |
| `rank` | int |

<a id="type-championsentrychara"></a>
#### ChampionsEntryChara

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `running_style` | int |
| `team_member_id` | int |

<a id="type-championsinfo"></a>
#### ChampionsInfo

| Field | Type |
|---|---|
| `champions_id` | int |
| `league_type` | int |
| `entry_times` | int |
| `free_entry_times` | int |
| `round_id` | int |
| `next_tier` | int |
| `state` | int |
| `entry_trained_chara_id_array` | int[] |

<a id="type-championsnewscharainfo"></a>
#### ChampionsNewsCharaInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `team_id` | int |
| `team_member_id` | int |
| `news_chara_id_array` | int[] |
| `news_chara_comment_id` | int |

<a id="type-championsnewschararacehistory"></a>
#### ChampionsNewsCharaRaceHistory

| Field | Type |
|---|---|
| `round_id` | int |
| `set_num` | int |
| `race_num` | int |
| `rank` | int |
| `finish_time` | int |
| `frame_order` | int |
| `popularity` | int |
| `race_horse_num` | int |

<a id="type-championsnewschararesultinfo"></a>
#### ChampionsNewsCharaResultInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `team_id` | int |
| `team_member_id` | int |
| `rank_count_1` | int |
| `rank_count_2` | int |
| `rank_count_3` | int |
| `rank_count_unplaced` | int |
| `race_win_5` | int |
| `news_chara_race_history_array` | [ChampionsNewsCharaRaceHistory](#type-championsnewschararacehistory)[] |

<a id="type-championsnewsrankcountinfo"></a>
#### ChampionsNewsRankCountInfo

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `rank_count_1` | int |
| `rank_count_2` | int |
| `rank_count_3` | int |
| `rank_count_unplaced` | int |

<a id="type-championsnewstrainerinfo"></a>
#### ChampionsNewsTrainerInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `total_win` | int |
| `total_race_count` | int |
| `race_win_5` | int |
| `news_trainer_id_array` | int[] |

<a id="type-championsnewswininfo"></a>
#### ChampionsNewsWinInfo

| Field | Type |
|---|---|
| `news_win_title_id` | int |
| `news_win_comment_id` | int |
| `news_win_id_array` | int[] |

<a id="type-championsracehistorychararesultinfo"></a>
#### ChampionsRaceHistoryCharaResultInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `team_id` | int |
| `team_member_id` | int |
| `card_id` | int |
| `rarity` | int |
| `final_grade` | int |
| `talent_level` | int |
| `race_cloth_id` | int |
| `rank` | int |

<a id="type-championsracehistoryinfo"></a>
#### ChampionsRaceHistoryInfo

| Field | Type |
|---|---|
| `race_num` | int |
| `room_info` | [ChampionsRoomInfo](#type-championsroominfo) |
| `race_history_chara_result_array` | [ChampionsRaceHistoryCharaResultInfo](#type-championsracehistorychararesultinfo)[] |

<a id="type-championsraceresult"></a>
#### ChampionsRaceResult

| Field | Type |
|---|---|
| `race_num` | int |
| `result` | int |
| `user_rank` | int |

<a id="type-championsrankingentrycharainfo"></a>
#### ChampionsRankingEntryCharaInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `team_member_id` | int |
| `card_id` | int |
| `final_grade` | int |
| `rarity` | int |
| `talent_level` | int |
| `race_cloth_id` | int |
| `running_style` | int |

<a id="type-championsrankinginfo"></a>
#### ChampionsRankingInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `last_round_id` | int |
| `rank` | int |
| `is_same_final` | int |

<a id="type-championsrankinguserinfo"></a>
#### ChampionsRankingUserInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `leader_chara_id` | int |
| `leader_chara_dress_id` | int |

<a id="type-championsrewardinfo"></a>
#### ChampionsRewardInfo

| Field | Type |
|---|---|
| `league_type` | int |
| `round_id` | int |
| `win_count` | int |
| `ranking` | int |
| `item_array` | [ResponseItem](#type-responseitem)[] |

<a id="type-championsroominfo"></a>
#### ChampionsRoomInfo

| Field | Type |
|---|---|
| `room_id` | long |
| `user_entry_num` | int |
| `race_start_time` | string |
| `race_instance_id` | int |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `random_seed` | int |
| `race_scenario` | string |

<a id="type-championsroomuser"></a>
#### ChampionsRoomUser

| Field | Type |
|---|---|
| `room_id` | long |
| `viewer_id` | long |
| `name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `team_id` | int |
| `entry_chara_array` | [ChampionsUserChara](#type-championsuserchara)[] |

<a id="type-championsstampinfo"></a>
#### ChampionsStampInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `stamp_id` | int |
| `send_time` | long |

<a id="type-championsuserchara"></a>
#### ChampionsUserChara

| Field | Type |
|---|---|
| `chara_id` | int |
| `race_cloth_id` | int |
| `nick_name_id` | int |
| `team_member_id` | int |

<a id="type-championsusercharatop"></a>
#### ChampionsUserCharaTop

| Field | Type |
|---|---|
| `card_id` | int |
| `chara_id` | int |
| `race_cloth_id` | int |
| `nick_name_id` | int |
| `team_member_id` | int |

<a id="type-charaeffectlog"></a>
#### CharaEffectLog

| Field | Type |
|---|---|
| `chara_effect_id` | int |
| `is_active` | bool |

<a id="type-charaprofiledata"></a>
#### CharaProfileData

| Field | Type |
|---|---|
| `chara_id` | int |
| `data_id` | int |
| `new_flag` | int |

<a id="type-chararacereward"></a>
#### CharaRaceReward

| Field | Type |
|---|---|
| `result_rank` | int |
| `result_time` | int |
| `race_reward` | [RaceRewardData](#type-racerewarddata)[] |
| `race_reward_bonus` | [RaceRewardData](#type-racerewarddata)[] |
| `race_reward_plus_bonus` | [RaceRewardData](#type-racerewarddata)[] |
| `race_reward_bonus_win` | [RaceRewardData](#type-racerewarddata)[] |
| `race_reward_limit` | [RaceRewardLimitData](#type-racerewardlimitdata)[] |
| `gained_fans` | int |
| `campaign_id_array` | int[] |

<a id="type-characterstorydata"></a>
#### CharacterStoryData

| Field | Type |
|---|---|
| `episode_id` | int |
| `state` | int |

<a id="type-choicearray"></a>
#### ChoiceArray

| Field | Type |
|---|---|
| `select_index` | int |
| `receive_item_id` | int |
| `target_race_id` | int |
| `gain_select_id_index` | int |
| `select_icon` | int |

<a id="type-circleatload"></a>
#### CircleAtLoad

| Field | Type |
|---|---|
| `circle_info` | [CircleInfoAtFriend](#type-circleinfoatfriend) |
| `circle_user` | [CircleUser](#type-circleuser) |

<a id="type-circlechatmessage"></a>
#### CircleChatMessage

| Field | Type |
|---|---|
| `post_id` | int |
| `viewer_id` | long |
| `message_type` | int |
| `message_id` | int |
| `message_data` | string |
| `create_time` | string |

<a id="type-circlechatuser"></a>
#### CircleChatUser

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `leader_chara_id` | int |
| `leader_chara_dress_id` | int |

<a id="type-circleinfo"></a>
#### CircleInfo

| Field | Type |
|---|---|
| `circle_id` | int |
| `leader_viewer_id` | long |
| `name` | string |
| `comment` | string |
| `member_num` | int |
| `join_style` | int |
| `policy` | int |
| `make_time` | string |

<a id="type-circleinfoatfriend"></a>
#### CircleInfoAtFriend

| Field | Type |
|---|---|
| `circle_id` | int |
| `name` | string |
| `monthly_rank` | int |

<a id="type-circleitemdonate"></a>
#### CircleItemDonate

| Field | Type |
|---|---|
| `donate_id` | int |
| `request_id` | int |
| `viewer_id` | long |
| `item_num` | int |
| `state` | int |
| `create_time` | string |

<a id="type-circleitemrequest"></a>
#### CircleItemRequest

| Field | Type |
|---|---|
| `request_id` | int |
| `viewer_id` | long |
| `item_id` | int |
| `end_time` | string |
| `state` | int |

<a id="type-circlepostpartner"></a>
#### CirclePostPartner

| Field | Type |
|---|---|
| `practice_partner_info` | [TrainedChara](#type-trainedchara) |
| `post_comment_id` | int |
| `post_time` | string |

<a id="type-circleprofilecardinfo"></a>
#### CircleProfileCardInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `dress_id` | int |
| `bg_id` | int |
| `card_bg_id` | int |
| `theme_id` | int |
| `support_card_id` | int |
| `illustration_type` | int |
| `comment` | string |
| `is_circle_info_aligned_right` | bool |
| `image_offset_x` | int |
| `image_offset_y` | int |
| `image_rotate` | int |
| `image_scale` | int |
| `image_file_hash` | string |

<a id="type-circleranking"></a>
#### CircleRanking

| Field | Type |
|---|---|
| `circle_id` | int |
| `point` | ulong |
| `monthly` | int |
| `rank` | int |

<a id="type-circlerequest"></a>
#### CircleRequest

| Field | Type |
|---|---|
| `circle_id` | int |
| `viewer_id` | long |
| `update_time` | string |

<a id="type-circlescout"></a>
#### CircleScout

| Field | Type |
|---|---|
| `circle_id` | int |
| `viewer_id` | long |

<a id="type-circleuser"></a>
#### CircleUser

| Field | Type |
|---|---|
| `viewer_id` | long |
| `circle_id` | int |
| `membership` | int |
| `join_time` | string |
| `penalty_end_time` | string |
| `item_request_end_time` | string |

<a id="type-coininfo"></a>
#### CoinInfo

| Field | Type |
|---|---|
| `coin` | int |
| `fcoin` | int |

<a id="type-collectiteminfo"></a>
#### CollectItemInfo

| Field | Type |
|---|---|
| `all_gained_collect_item_num` | long |
| `individual_gained_collect_item_info` | [ResponseItem](#type-responseitem) |

<a id="type-collectraidinfo"></a>
#### CollectRaidInfo

| Field | Type |
|---|---|
| `collect_raid_id` | int |
| `collect_item_info` | [CollectItemInfo](#type-collectiteminfo) |
| `add_collect_item_reward_array` | [ResponseItem](#type-responseitem)[] |

<a id="type-collectraidlogininfo"></a>
#### CollectRaidLoginInfo

| Field | Type |
|---|---|
| `collect_raid_id` | int |
| `first_access_flag` | int |
| `complete_individual_reward_flag` | int |
| `unreceived_individual_reward_flag` | int |
| `add_collect_item_reward_array` | [ResponseItem](#type-responseitem)[] |
| `episode_id_array` | int[] |

<a id="type-commondefine"></a>
#### CommonDefine

| Field | Type |
|---|---|
| `change_date_hour` | int |
| `trained_chara_default_save_num` | int |
| `max_circle_member_num` | int |
| `max_circle_scout_num` | int |
| `item_request_expire` | int |
| `max_donate_num_total` | int |
| `max_donate_num_for_request` | int |
| `max_donate_count_day` | int |
| `max_trainer_point` | int |
| `trainer_point_recovery_time` | int |
| `trainer_point_recovery_unit_value` | int |
| `trainer_point_recovery_calc_base` | int |
| `max_race_point` | int |
| `race_point_recovery_time` | int |
| `race_point_recovery_unit_value` | int |
| `race_point_recovery_calc_base` | int |
| `single_mode_trainer_point_use_value` | int |
| `single_mode_trained_chara_rental_max_num` | int |
| `new_single_mode_trained_chara_rental_max_num` | int |
| `coefficient_money_required_strength` | int |
| `max_follow_num` | int |
| `max_follower_num` | int |
| `present_history_limit` | int |
| `team_stadium_reload_interval_ms` | int |
| `team_stadium_support_card_bonus_max` | int |
| `daily_race_ticket_max_num` | int |
| `legend_race_ticket_max_num` | int |
| `daily_legend_race_ticket_max_num` | int |
| `need_team_rank_play_daily_race` | int |
| `need_team_rank_play_circle` | int |
| `need_team_rank_play_champions` | int |
| `champions_open_league_rank_max` | int |
| `champions_entry_cost_num` | int |
| `champions_polling_interval` | int |
| `champions_entry_reset_time` | int |
| `champions_stamp_polling_interval` | int |
| `champions_stamp_max_display_num` | int |
| `champions_matching_max_retry_num` | int |
| `serial_code_restrict_release_sec` | int |
| `room_match_force_start_time_sec` | int |
| `room_match_entry_limit_time` | int |
| `room_match_max_saved_race_num` | int |
| `room_match_max_join_watch_num` | int |
| `need_team_rank_play_room_match` | int |
| `need_team_rank_play_practice_race` | int |
| `room_match_min_entry_num` | int |
| `room_match_reload_interval_ms` | int |
| `room_match_change_lock_reload_interval_ms` | int |
| `room_match_preset_num_max` | int |
| `room_match_preset_entry_num_max` | int |
| `practice_recommend_list_reload_interval_ms` | int |
| `max_practice_partner_num` | int |
| `practice_race_entry_chara_num_min` | int |
| `practice_race_entry_same_chara_num_max` | int |
| `practice_race_save_race_num_max` | int |
| `practice_race_sns_share_partner_expire_hour` | int |
| `practice_race_create_partner_id_daily_max_count` | int |
| `circle_chat_post_partner_hold_count` | int |
| `circle_chat_post_partner_daily_max_count` | int |
| `practice_race_used_history_expire_day_count` | int |
| `practice_race_used_history_list_count_max` | int |
| `practice_race_preset_num_max` | int |
| `practice_race_preset_entry_num_max` | int |
| `skill_upgrade_max_level` | int |
| `charm_add_evaluation` | int |
| `featured_stock_add_evaluation` | int |
| `dress_change_open_date` | string |
| `story_event_max_total_bonus` | int |
| `team_building_purchase_limit_num` | int |
| `team_building_coin_pay_cost` | int |
| `team_building_free_continue_num` | int |
| `live_theater_performers_preset_max` | int |
| `single_mode_factor_use_tp_value` | int |
| `update_relation_point_open_date` | string |
| `valentine_love_rank` | int |
| `race_top_open_date` | string |
| `limited_sale_2nd_anniv_open_date` | string |
| `circle_profile_card_open_date` | string |
| `choice_reward_preview_open_date` | string |
| `cygames_id_open_date` | string |
| `cygames_id_resign_url` | string |
| `is_cygames_id_open` | bool |
| `save_running_style_open_date` | string |
| `idle_single_mode_open_date` | string |
| `is_talk_birthday_open` | bool |

<a id="type-countryinfo"></a>
#### CountryInfo

| Field | Type |
|---|---|
| `country` | string |
| `country_type` | int |

<a id="type-dailylegendracedata"></a>
#### DailyLegendRaceData

| Field | Type |
|---|---|
| `daily_legend_race_id` | int |
| `is_cleared` | int |
| `is_played` | int |
| `boss_data` | [RaceHorseData](#type-racehorsedata) |

<a id="type-dailylegendraceplayinginfo"></a>
#### DailyLegendRacePlayingInfo

| Field | Type |
|---|---|
| `state` | int |
| `trained_chara_id` | int |
| `daily_legend_race_record` | [DailyLegendRaceData](#type-dailylegendracedata) |
| `new_flag` | int |

<a id="type-dailyracedata"></a>
#### DailyRaceData

| Field | Type |
|---|---|
| `daily_race_id` | int |
| `is_cleared` | int |
| `is_played` | int |

<a id="type-dailyraceplayinginfo"></a>
#### DailyRacePlayingInfo

| Field | Type |
|---|---|
| `state` | int |
| `trained_chara_id` | int |
| `daily_race_record_array` | [DailyRaceData](#type-dailyracedata)[] |

<a id="type-defaultrunningstyle"></a>
#### DefaultRunningStyle

| Field | Type |
|---|---|
| `card_id` | int |
| `running_style` | int |

<a id="type-directorycard"></a>
#### DirectoryCard

| Field | Type |
|---|---|
| `card_id` | int |
| `directory_ranking` | int |
| `trained_chara` | [TrainedChara](#type-trainedchara) |

<a id="type-directorycategoryscoresummary"></a>
#### DirectoryCategoryScoreSummary

| Field | Type |
|---|---|
| `score` | int |
| `number` | int |

<a id="type-directoryscoresummary"></a>
#### DirectoryScoreSummary

| Field | Type |
|---|---|
| `directory_card` | int |
| `album` | [DirectoryCategoryScoreSummary](#type-directorycategoryscoresummary) |
| `story` | [DirectoryCategoryScoreSummary](#type-directorycategoryscoresummary) |
| `act` | [DirectoryCategoryScoreSummary](#type-directorycategoryscoresummary) |
| `voice` | [DirectoryCategoryScoreSummary](#type-directorycategoryscoresummary) |
| `nickname` | [DirectoryCategoryScoreSummary](#type-directorycategoryscoresummary) |
| `gallery` | [DirectoryCategoryScoreSummary](#type-directorycategoryscoresummary) |

<a id="type-displayrewardinfo"></a>
#### DisplayRewardInfo

| Field | Type |
|---|---|
| `item_type` | int |
| `item_id` | int |
| `item_num` | int |

<a id="type-entrymobchara"></a>
#### EntryMobChara

| Field | Type |
|---|---|
| `npc_id` | int |
| `rank` | int |
| `rank_score` | int |
| `running_style` | int |

<a id="type-evaluationinfo"></a>
#### EvaluationInfo

| Field | Type |
|---|---|
| `target_id` | int |
| `evaluation` | int |
| `is_outing` | int |
| `story_step` | int |
| `is_appear` | int |
| `group_outing_info_array` | [GroupOutingInfo](#type-groupoutinginfo)[] |

<a id="type-eventchoicereward"></a>
#### EventChoiceReward

| Field | Type |
|---|---|
| `select_index` | int |
| `gain_param_array` | [EventChoiceRewardGainParam](#type-eventchoicerewardgainparam)[] |

<a id="type-eventchoicerewardgainparam"></a>
#### EventChoiceRewardGainParam

| Field | Type |
|---|---|
| `display_id` | int |
| `effect_value_0` | int |
| `effect_value_1` | int |
| `effect_value_2` | int |

<a id="type-eventcontentsinfo"></a>
#### EventContentsInfo

| Field | Type |
|---|---|
| `support_card_id` | int |
| `show_clear` | int |
| `show_clear_sort_id` | int |
| `choice_array` | [ChoiceArray](#type-choicearray)[] |
| `is_effected_multi_chara` | bool |
| `tips_training_partner_id` | int |

<a id="type-eventskill"></a>
#### EventSkill

| Field | Type |
|---|---|
| `story_id` | int |
| `skill_id_array` | int[] |

<a id="type-exchangeiteminfo"></a>
#### ExchangeItemInfo

| Field | Type |
|---|---|
| `exchange_id` | int |
| `count` | int |
| `ex_param` | [ExchangeItemInfoExParam](#type-exchangeiteminfoexparam) |

<a id="type-exchangeiteminfoexparam"></a>
#### ExchangeItemInfoExParam

| Field | Type |
|---|---|
| `open_count` | int |

<a id="type-extrastorydata"></a>
#### ExtraStoryData

| Field | Type |
|---|---|
| `story_event` | [StoryEventStoryData](#type-storyeventstorydata)[] |
| `story_extra` | [StoryExtraStoryData](#type-storyextrastorydata)[] |

<a id="type-factorextend"></a>
#### FactorExtend

| Field | Type |
|---|---|
| `position_id` | int |
| `base_factor_id` | int |
| `factor_id` | int |
| `register_time` | string |

<a id="type-factorinfo"></a>
#### FactorInfo

| Field | Type |
|---|---|
| `factor_id` | int |
| `level` | int |

<a id="type-factororderpassinfo"></a>
#### FactorOrderPassInfo

| Field | Type |
|---|---|
| `pass_end_time` | long |
| `repurchase_time` | long |
| `notice_status` | int |

<a id="type-factorresearchboxrewardinfo"></a>
#### FactorResearchBoxRewardInfo

| Field | Type |
|---|---|
| `factor_research_box_reward_id` | int |
| `remain_num` | int |

<a id="type-factorresearchdisplayreward"></a>
#### FactorResearchDisplayReward

| Field | Type |
|---|---|
| `box_id` | int |
| `reward_array` | [DisplayRewardInfo](#type-displayrewardinfo)[] |

<a id="type-factorresearchgaugeinfo"></a>
#### FactorResearchGaugeInfo

| Field | Type |
|---|---|
| `before_gauge` | int |
| `after_gauge` | int |
| `before_gauge_stock_num` | int |
| `after_gauge_stock_num` | int |
| `is_gauge_stock_limit` | int |

<a id="type-factorresearchloadinfo"></a>
#### FactorResearchLoadInfo

| Field | Type |
|---|---|
| `factor_research_event_id` | int |
| `factor_research_event_first_flag` | bool |
| `factor_research_gauge_info` | [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo) |

<a id="type-factorselectinfo"></a>
#### FactorSelectInfo

| Field | Type |
|---|---|
| `lottery_id` | int |
| `factor_info_array` | [FactorInfo](#type-factorinfo)[] |

<a id="type-fanraidfansinfo"></a>
#### FanRaidFansInfo

| Field | Type |
|---|---|
| `all_gained_fans` | long |
| `individual_gained_fans` | int |

<a id="type-fanraidsinglemoderesult"></a>
#### FanRaidSingleModeResult

| Field | Type |
|---|---|
| `fan_raid_id` | int |
| `gain_fans` | int |
| `bonus_gain_fans` | int |
| `total_gain_fans` | int |
| `fan_raid_fans_info` | [FanRaidFansInfo](#type-fanraidfansinfo) |
| `get_all_individual_reward` | bool |
| `individual_reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `individual_reward_list` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `individual_reward_id_list` | int[] |

<a id="type-gachabannerinfo"></a>
#### GachaBannerInfo

| Field | Type |
|---|---|
| `id` | int |

<a id="type-gachacampaigninfo"></a>
#### GachaCampaignInfo

| Field | Type |
|---|---|
| `id` | int |
| `is_campaign_draw_enable_single` | int |
| `is_campaign_draw_enable_multi` | int |

<a id="type-gachaexechistory"></a>
#### GachaExecHistory

| Field | Type |
|---|---|
| `exec_history_id` | int |
| `gacha_id` | int |
| `gacha_card_type` | int |
| `draw_type` | int |
| `draw_num` | int |
| `cost_id` | int |
| `cost_count` | int |
| `create_time` | string |

<a id="type-gachainfolist"></a>
#### GachaInfoList

| Field | Type |
|---|---|
| `id` | int |
| `is_daily_draw_end` | int |
| `prize_selected_card_type` | int |
| `prize_selected_card_id` | int |
| `is_campaign_draw_enable_single` | int |
| `is_campaign_draw_enable_multi` | int |
| `remain_stock_num_single` | int |
| `remain_stock_num_multi` | int |
| `web_text` | string |

<a id="type-gachalimitinfo"></a>
#### GachaLimitInfo

| Field | Type |
|---|---|
| `limit_item_list` | [GachaLimitItemInfo](#type-gachalimititeminfo)[] |
| `expired_limit_item_list` | [GachaLimitItemInfo](#type-gachalimititeminfo)[] |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |

<a id="type-gachalimititeminfo"></a>
#### GachaLimitItemInfo

| Field | Type |
|---|---|
| `gacha_id` | int |
| `num` | int |
| `converted_item_num` | int |

<a id="type-gachaprizehistory"></a>
#### GachaPrizeHistory

| Field | Type |
|---|---|
| `result_info_array` | [GachaPrizeResultInfo](#type-gachaprizeresultinfo)[] |
| `exec_time` | string |

<a id="type-gachaprizeresultinfo"></a>
#### GachaPrizeResultInfo

| Field | Type |
|---|---|
| `place` | int |
| `num` | int |

<a id="type-gacharesultdata"></a>
#### GachaResultData

| Field | Type |
|---|---|
| `card_type` | int |
| `card_id` | int |
| `piece_id` | int |
| `common_item_category` | int |
| `common_item_id` | int |
| `convert_piece_num` | int |
| `convert_common_item_num` | int |
| `additional_piece_num` | int |
| `new_flag` | int |
| `win_prize` | int |

<a id="type-gacharewardhistory"></a>
#### GachaRewardHistory

| Field | Type |
|---|---|
| `exec_history_id` | int |
| `disp_order` | int |
| `card_type` | int |
| `card_id` | int |
| `piece_id` | int |
| `common_item_category` | int |
| `common_item_id` | int |
| `convert_piece_num` | int |
| `convert_common_item_num` | int |
| `additional_piece_num` | int |

<a id="type-gainskillinfo"></a>
#### GainSkillInfo

| Field | Type |
|---|---|
| `skill_id` | int |
| `level` | int |

<a id="type-galleryeventcontentsinfo"></a>
#### GalleryEventContentsInfo

| Field | Type |
|---|---|
| `support_card_id` | int |
| `choice_array` | [ChoiceArray](#type-choicearray)[] |
| `month` | int |
| `race_id` | int |

<a id="type-groupoutinginfo"></a>
#### GroupOutingInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `is_outing` | int |
| `story_step` | int |

<a id="type-guestoutinginfo"></a>
#### GuestOutingInfo

| Field | Type |
|---|---|
| `support_card_id` | int |
| `story_step` | int |
| `group_outing_info_array` | [GroupOutingInfo](#type-groupoutinginfo)[] |

<a id="type-heroeschararacehistory"></a>
#### HeroesCharaRaceHistory

| Field | Type |
|---|---|
| `league_rank` | int |
| `race_num` | int |
| `rank` | int |
| `finish_time` | int |
| `frame_order` | int |
| `popularity` | int |
| `race_horse_num` | int |

<a id="type-heroeschararacestats"></a>
#### HeroesCharaRaceStats

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `race_history_array` | [HeroesCharaRaceHistory](#type-heroeschararacehistory)[] |
| `rank_count_1` | int |
| `rank_count_2` | int |
| `rank_count_3` | int |
| `rank_count_unplaced` | int |

<a id="type-heroesentrychara"></a>
#### HeroesEntryChara

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `running_style` | int |
| `team_member_id` | int |

<a id="type-heroesfinalchararesult"></a>
#### HeroesFinalCharaResult

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `frame_order` | int |
| `rank` | int |
| `finish_time` | int |
| `horse_length` | int |

<a id="type-heroesfinalindexcharainfo"></a>
#### HeroesFinalIndexCharaInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `card_id` | int |
| `rarity` | int |
| `rank` | int |
| `nickname_id` | int |
| `team_name` | string |
| `group_id` | int |
| `race_num` | int |

<a id="type-heroesfinalindexinfo"></a>
#### HeroesFinalIndexInfo

| Field | Type |
|---|---|
| `stage1_rank` | int |
| `race_group_id` | int |
| `race_num` | int |
| `next_play_info` | [HeroesFinalNextPlayInfo](#type-heroesfinalnextplayinfo) |
| `honor_data` | [HonorData](#type-honordata) |
| `team_edit_change_flag` | int |
| `index_chara_array` | [HeroesFinalIndexCharaInfo](#type-heroesfinalindexcharainfo)[] |
| `received_reward_group_array` | int[] |

<a id="type-heroesfinalloadindexinfo"></a>
#### HeroesFinalLoadIndexInfo

| Field | Type |
|---|---|
| `first_access_final_stage1_ranking_flag` | int |
| `next_play_info` | [HeroesFinalNextPlayInfo](#type-heroesfinalnextplayinfo) |
| `received_reward_group_array` | int[] |
| `race_group_id` | int |
| `race_num` | int |
| `team_edit_change_flag` | int |

<a id="type-heroesfinalnextplayinfo"></a>
#### HeroesFinalNextPlayInfo

| Field | Type |
|---|---|
| `group_id` | int |
| `race_num` | int |

<a id="type-heroesfinalracehorseinfo"></a>
#### HeroesFinalRaceHorseInfo

| Field | Type |
|---|---|
| `race_horse_data` | [RaceHorseData](#type-racehorsedata) |
| `stage1_rank` | int |

<a id="type-heroesfinalraceinfo"></a>
#### HeroesFinalRaceInfo

| Field | Type |
|---|---|
| `race_num` | int |
| `set_info` | [HeroesSetInfo](#type-heroessetinfo) |
| `race_horse_info_array` | [HeroesFinalRaceHorseInfo](#type-heroesfinalracehorseinfo)[] |
| `team_info_array` | [HeroesTeamInfo](#type-heroesteaminfo)[] |
| `umaine_array` | int[] |
| `is_played` | int |
| `chara_result_array` | [HeroesFinalCharaResult](#type-heroesfinalchararesult)[] |

<a id="type-heroesfinalraceresultinfo"></a>
#### HeroesFinalRaceResultInfo

| Field | Type |
|---|---|
| `race_info` | [HeroesFinalRaceInfo](#type-heroesfinalraceinfo) |
| `race_scenario` | string |
| `random_seed` | int |

<a id="type-heroesfinalumainesetting"></a>
#### HeroesFinalUmaineSetting

| Field | Type |
|---|---|
| `frame_num` | int |
| `enable` | int |

<a id="type-heroeshonorselectcharadata"></a>
#### HeroesHonorSelectCharaData

| Field | Type |
|---|---|
| `chara_id` | int |
| `score` | int |

<a id="type-heroesloadinfo"></a>
#### HeroesLoadInfo

| Field | Type |
|---|---|
| `heroes_id` | int |
| `stage` | int |
| `stage_step` | int |
| `resume_state` | int |
| `team_trained_chara_id_array` | int[] |
| `entry_trained_chara_id_array` | int[] |
| `league_score` | int |
| `final_load_index_info` | [HeroesFinalLoadIndexInfo](#type-heroesfinalloadindexinfo) |

<a id="type-heroesmember"></a>
#### HeroesMember

| Field | Type |
|---|---|
| `trained_chara` | [TrainedChara](#type-trainedchara) |
| `team_member_id` | int |

<a id="type-heroespastresult"></a>
#### HeroesPastResult

| Field | Type |
|---|---|
| `heroes_id` | int |
| `league_rank` | int |
| `league_score` | int |
| `is_finalist` | int |

<a id="type-heroesrankingchara"></a>
#### HeroesRankingChara

| Field | Type |
|---|---|
| `team_member_id` | int |
| `trained_chara_id` | int |
| `card_id` | int |
| `final_grade` | int |
| `rarity` | int |
| `talent_level` | int |
| `race_cloth_id` | int |
| `running_style` | int |

<a id="type-heroesrankingrecord"></a>
#### HeroesRankingRecord

| Field | Type |
|---|---|
| `rank` | int |
| `league_score` | int |
| `viewer_id` | long |
| `snapshot_id` | long |
| `team_name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `team_member_array` | [HeroesRankingChara](#type-heroesrankingchara)[] |
| `leader_chara_id` | int |
| `leader_chara_dress_id` | int |

<a id="type-heroesresponsestage1finishset"></a>
#### HeroesResponseStage1FinishSet

| Field | Type |
|---|---|
| `reward_array` | [ResponseItem](#type-responseitem)[] |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `hero_gauge` | int |
| `hero_skill_id` | int |

<a id="type-heroesresponsestage1getopponentteaminfo"></a>
#### HeroesResponseStage1GetOpponentTeamInfo

| Field | Type |
|---|---|
| `set_info` | [HeroesSetInfo](#type-heroessetinfo) |
| `round_info_array` | [HeroesRoundInfo](#type-heroesroundinfo)[] |
| `race_item_info_array` | [UserItem](#type-useritem)[] |

<a id="type-heroesresponsestage1grandresult"></a>
#### HeroesResponseStage1GrandResult

| Field | Type |
|---|---|
| `before_league_score` | int |
| `after_league_score` | int |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `before_hero_gauge` | int |
| `after_hero_gauge` | int |
| `own_chara_race_stats_array` | [HeroesCharaRaceStats](#type-heroeschararacestats)[] |

<a id="type-heroesresponsestage1startset"></a>
#### HeroesResponseStage1StartSet

| Field | Type |
|---|---|
| `set_info` | [HeroesSetInfo](#type-heroessetinfo) |
| `round_result_array` | [HeroesRoundResult](#type-heroesroundresult)[] |
| `item_info_array` | [UserItem](#type-useritem)[] |

<a id="type-heroesroundinfo"></a>
#### HeroesRoundInfo

| Field | Type |
|---|---|
| `round` | int |
| `race_horse_data_array` | [RaceHorseData](#type-racehorsedata)[] |
| `opponent_team_info` | [HeroesTeamInfo](#type-heroesteaminfo) |

<a id="type-heroesroundresult"></a>
#### HeroesRoundResult

| Field | Type |
|---|---|
| `round_info` | [HeroesRoundInfo](#type-heroesroundinfo) |
| `race_scenario` | string |
| `random_seed` | int |
| `gained_league_score` | int |
| `gained_hero_gauge` | int |

<a id="type-heroessetinfo"></a>
#### HeroesSetInfo

| Field | Type |
|---|---|
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `race_instance_id` | int |

<a id="type-heroesteaminfo"></a>
#### HeroesTeamInfo

| Field | Type |
|---|---|
| `team_id` | int |
| `viewer_id` | long |
| `user_name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `team_name` | string |
| `league_score` | int |
| `member_array` | [HeroesMember](#type-heroesmember)[] |
| `chara_race_stats_array` | [HeroesCharaRaceStats](#type-heroeschararacestats)[] |

<a id="type-homebannerdatafordisplay"></a>
#### HomeBannerDataForDisplay

| Field | Type |
|---|---|
| `id` | int |

<a id="type-homebannerdataforregist"></a>
#### HomeBannerDataForRegist

| Field | Type |
|---|---|
| `id` | int |

<a id="type-homecharacterdressinfo"></a>
#### HomeCharacterDressInfo

| Field | Type |
|---|---|
| `position1_chara_id` | int |
| `position2_chara_id` | int |
| `position3_chara_id` | int |
| `position4_chara_id` | int |
| `position1_cloth_id` | int |
| `position2_cloth_id` | int |
| `position3_cloth_id` | int |
| `position4_cloth_id` | int |

<a id="type-homeposterdatafordisplay"></a>
#### HomePosterDataForDisplay

| Field | Type |
|---|---|
| `id` | int |

<a id="type-homeposterdataforregist"></a>
#### HomePosterDataForRegist

| Field | Type |
|---|---|
| `id` | int |

<a id="type-homestorydatafordisplay"></a>
#### HomeStoryDataForDisplay

| Field | Type |
|---|---|
| `id` | int |

<a id="type-homestorydataforregist"></a>
#### HomeStoryDataForRegist

| Field | Type |
|---|---|
| `id` | int |

<a id="type-honordata"></a>
#### HonorData

| Field | Type |
|---|---|
| `honor_id` | int |
| `step` | int |
| `create_time` | string |

<a id="type-honorinfo"></a>
#### HonorInfo

| Field | Type |
|---|---|
| `honor_list` | [HonorData](#type-honordata)[] |
| `last_checked_time` | long |

<a id="type-idlesinglemodeendinfo"></a>
#### IdleSingleModeEndInfo

| Field | Type |
|---|---|
| `chara_info` | [SingleModeChara](#type-singlemodechara) |
| `race_condition_array` | [SingleModeRaceCondition](#type-singlemoderacecondition)[] |
| `unchecked_event_array` | [SingleModeEventInfo](#type-singlemodeeventinfo)[] |
| `home_info` | [SingleModeHomeInfo](#type-singlemodehomeinfo) |
| `win_saddle_id_array` | int[] |
| `effected_factor_array` | [SuccessionEffectedFactor](#type-successioneffectedfactor)[] |
| `race_start_info` | [SingleRaceStartInfo](#type-singleracestartinfo) |
| `race_scenario` | string |
| `add_trophy_info` | [LoginUserTrophyInfo](#type-loginusertrophyinfo) |
| `trophy_reward_info` | [RaceRewardData](#type-racerewarddata) |
| `prev_chara_grade` | int |
| `race_add_reward_info` | [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[] |
| `reserved_race_info` | [SingleModeReservedRaceInfo](#type-singlemodereservedraceinfo) |
| `mission_list` | [UserMission](#type-usermission)[] |
| `story_event_mission_list` | [UserMission](#type-usermission)[] |
| `start_dress_info` | [SingleModeStartDressInfo](#type-singlemodestartdressinfo) |
| `story_event_chara_bonus_list` | [StoryEventCharaBonus](#type-storyeventcharabonus)[] |
| `resume_factor_select` | [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `race_random_program_array` | [SingleModeRaceRandomProgram](#type-singlemoderacerandomprogram)[] |
| `race_reward_limit_more_list` | [RaceRewardLimitMoreData](#type-racerewardlimitmoredata)[] |
| `skill_filter_setting_array` | [SingleModeSkillFilterSet](#type-singlemodeskillfilterset)[] |
| `is_umaplan` | bool |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |

<a id="type-idlesinglemodegaininfo"></a>
#### IdleSingleModeGainInfo

| Field | Type |
|---|---|
| `speed` | [IdleSingleModeSignedInt](#type-idlesinglemodesignedint) |
| `stamina` | [IdleSingleModeSignedInt](#type-idlesinglemodesignedint) |
| `power` | [IdleSingleModeSignedInt](#type-idlesinglemodesignedint) |
| `wiz` | [IdleSingleModeSignedInt](#type-idlesinglemodesignedint) |
| `guts` | [IdleSingleModeSignedInt](#type-idlesinglemodesignedint) |
| `max_speed` | int |
| `max_stamina` | int |
| `max_power` | int |
| `max_wiz` | int |
| `max_guts` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `skill_point` | int |
| `skill_tips_array` | [SkillTips](#type-skilltips)[] |

<a id="type-idlesinglemodeloadinfo"></a>
#### IdleSingleModeLoadInfo

| Field | Type |
|---|---|
| `single_mode_chara_light` | [SingleModeCharaLight](#type-singlemodecharalight) |
| `playing_state` | int |
| `start_time` | string |
| `end_time` | string |

<a id="type-idlesinglemodepriorityskill"></a>
#### IdleSingleModePrioritySkill

| Field | Type |
|---|---|
| `priority` | int |
| `skill_id` | int |

<a id="type-idlesinglemodeprogressinfo"></a>
#### IdleSingleModeProgressInfo

| Field | Type |
|---|---|
| `chara_info` | [SingleModeChara](#type-singlemodechara) |
| `start_time` | string |
| `end_time` | string |
| `story_event_mission_list` | [UserMission](#type-usermission)[] |
| `story_event_chara_bonus_list` | [StoryEventCharaBonus](#type-storyeventcharabonus)[] |

<a id="type-idlesinglemodeprogressloginfo"></a>
#### IdleSingleModeProgressLogInfo

| Field | Type |
|---|---|
| `chara_effect_log_array` | [CharaEffectLog](#type-charaeffectlog)[] |
| `support_card_gain_info_array` | [IdleSingleModeSupportCardGainInfo](#type-idlesinglemodesupportcardgaininfo)[] |
| `event_gain_info` | [IdleSingleModeGainInfo](#type-idlesinglemodegaininfo) |
| `succession_gain_info` | [IdleSingleModeGainInfo](#type-idlesinglemodegaininfo) |
| `succession_factor_gain_array` | [IdleSingleModeSuccessionFactorGainInfo](#type-idlesinglemodesuccessionfactorgaininfo)[] |
| `race_history_array` | [IdleSingleModeRaceHistory](#type-idlesinglemoderacehistory)[] |
| `gain_skill_id_array` | int[] |
| `total_skill_point` | int |

<a id="type-idlesinglemoderacehistory"></a>
#### IdleSingleModeRaceHistory

| Field | Type |
|---|---|
| `race_history` | [SingleRaceHistory](#type-singleracehistory) |
| `race_reward_info` | [CharaRaceReward](#type-chararacereward) |
| `lose_tips_id` | int |

<a id="type-idlesinglemodesignedint"></a>
#### IdleSingleModeSignedInt

| Field | Type |
|---|---|
| `sign` | int |
| `value` | int |

<a id="type-idlesinglemodestartinfo"></a>
#### IdleSingleModeStartInfo

| Field | Type |
|---|---|
| `training_policy_ground_type` | int |
| `training_policy_param_rate_set_id` | int |
| `priority_skill_array` | [IdleSingleModePrioritySkill](#type-idlesinglemodepriorityskill)[] |
| `race_array` | [SingleModeReservedRace](#type-singlemodereservedrace)[] |

<a id="type-idlesinglemodesuccessionfactorgaininfo"></a>
#### IdleSingleModeSuccessionFactorGainInfo

| Field | Type |
|---|---|
| `year` | int |
| `gain_factor_info_array` | [FactorInfo](#type-factorinfo)[] |

<a id="type-idlesinglemodesupportcardgaininfo"></a>
#### IdleSingleModeSupportCardGainInfo

| Field | Type |
|---|---|
| `support_card_id` | int |
| `gain_info` | [IdleSingleModeGainInfo](#type-idlesinglemodegaininfo) |

<a id="type-itemexchangelimit"></a>
#### ItemExchangeLimit

| Field | Type |
|---|---|
| `item_exchange_id` | int |
| `exchange_count` | int |

<a id="type-jukeboxinfo"></a>
#### JukeboxInfo

| Field | Type |
|---|---|
| `play_music_flag` | int |
| `random_request_flag` | int |
| `user_request_flag` | int |
| `next_random_request_time` | string |
| `music_size` | int |

<a id="type-jukeboxlike"></a>
#### JukeboxLike

| Field | Type |
|---|---|
| `request_id` | int |
| `sort_id` | int |
| `like_chara_id` | int |
| `like_viewer_id` | ulong |

<a id="type-jukeboxrequest"></a>
#### JukeboxRequest

| Field | Type |
|---|---|
| `request_id` | int |
| `request_type` | int |
| `request_value` | int |
| `requester_id` | ulong |
| `music_id` | int |
| `request_time` | string |

<a id="type-lastcheckedtime"></a>
#### LastCheckedTime

| Field | Type |
|---|---|
| `type` | int |
| `last_checked_time` | long |

<a id="type-legendracedata"></a>
#### LegendRaceData

| Field | Type |
|---|---|
| `legend_race_id` | int |
| `is_cleared` | int |
| `is_played` | int |
| `boss_data` | [RaceHorseData](#type-racehorsedata) |

<a id="type-legendraceplayinginfo"></a>
#### LegendRacePlayingInfo

| Field | Type |
|---|---|
| `state` | int |
| `group_id` | int |
| `next_group_id` | int |
| `trained_chara_id` | int |
| `legend_race_record_array` | [LegendRaceData](#type-legendracedata)[] |

<a id="type-limitedgoodsinfo"></a>
#### LimitedGoodsInfo

| Field | Type |
|---|---|
| `disp_order` | int |
| `open_count` | int |
| `reward_id` | int |
| `exchange_count` | int |

<a id="type-limitedshopinfo"></a>
#### LimitedShopInfo

| Field | Type |
|---|---|
| `limited_exchange_id` | int |
| `open_flag` | int |
| `appear_flag` | int |
| `close_time` | int |
| `open_count` | int |
| `limited_sale_all_change_flag` | int |
| `last_open_time` | int |

<a id="type-liveevaluationinfo"></a>
#### LiveEvaluationInfo

| Field | Type |
|---|---|
| `target_id` | int |
| `chara_id` | int |
| `member_state` | int |

<a id="type-livenotupparameterinfo"></a>
#### LiveNotUpParameterInfo

| Field | Type |
|---|---|
| `performance_type_array` | int[] |

<a id="type-livetheatermemberinfo"></a>
#### LiveTheaterMemberInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `mob_id` | int |
| `dress_id` | int |
| `color_id` | int |
| `dress_id2` | int |
| `color_id2` | int |

<a id="type-livetheaterperformerspreset"></a>
#### LiveTheaterPerformersPreset

| Field | Type |
|---|---|
| `preset_id` | int |
| `preset_name` | string |
| `member_info_array` | [LiveTheaterMemberInfo](#type-livetheatermemberinfo)[] |

<a id="type-livetheatersaveinfo"></a>
#### LiveTheaterSaveInfo

| Field | Type |
|---|---|
| `music_id` | int |
| `member_info_array` | [LiveTheaterMemberInfo](#type-livetheatermemberinfo)[] |
| `is_skip_story` | int |

<a id="type-livetheatersettinginfo"></a>
#### LiveTheaterSettingInfo

| Field | Type |
|---|---|
| `sound_live_music` | int |
| `display_lyrics` | int |
| `play_se` | int |
| `portrait_mode` | int |

<a id="type-logstoryview"></a>
#### LogStoryView

| Field | Type |
|---|---|
| `story_type` | int |
| `episode_id` | int |
| `is_skipped` | int |
| `is_first_time` | int |
| `finish_viewing_time` | long |

<a id="type-loginbonusdata"></a>
#### LoginBonusData

| Field | Type |
|---|---|
| `login_bonus_id` | int |
| `total_count` | int |

<a id="type-loginusertrophyinfo"></a>
#### LoginUserTrophyInfo

| Field | Type |
|---|---|
| `trophy_id` | int |
| `chara_id_array` | int[] |

<a id="type-lovepointinfo"></a>
#### LovePointInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `love_point_before` | int |
| `love_point_after` | int |
| `love_point_pool_before` | int |
| `love_point_pool_after` | int |

<a id="type-mainstorydata"></a>
#### MainStoryData

| Field | Type |
|---|---|
| `episode_id` | int |
| `state` | int |

<a id="type-mainstoryraceentrychara"></a>
#### MainStoryRaceEntryChara

| Field | Type |
|---|---|
| `frame_order` | int |
| `chara_id` | int |
| `mob_id` | int |
| `dress_id` | int |
| `rank` | int |
| `chara_color_type` | int |
| `is_player` | int |

<a id="type-mapeventloadinfo"></a>
#### MapEventLoadInfo

| Field | Type |
|---|---|
| `event_id` | int |
| `gauge` | int |
| `arrival_map_point_id` | int |
| `current_area_id` | int |
| `read_next_episode_id_array` | int[] |
| `is_area_open` | int |
| `first_access_flag` | int |
| `login_update_flag` | int |
| `map_point_exec_flag` | int |
| `ending_read_type` | int |

<a id="type-menubadgeinfo"></a>
#### MenuBadgeInfo

| Field | Type |
|---|---|
| `present_num` | int |
| `mission_num` | int |
| `view_limited_mission_num` | int |
| `legend_mission_num` | int |
| `champions_mission_array` | [UserMission](#type-usermission)[] |
| `training_challenge_mission_num` | int |
| `challenge_match_mission_num` | int |
| `team_building_mission_num` | int |
| `collect_raid_mission_flag` | int |
| `new_gacha_flag` | int |
| `can_receive_tap_reward` | int |

<a id="type-minigameresult"></a>
#### MinigameResult

| Field | Type |
|---|---|
| `result_state` | int |
| `result_value` | int |
| `result_detail_array` | [MinigameResultDetail](#type-minigameresultdetail)[] |

<a id="type-minigameresultdetail"></a>
#### MinigameResultDetail

| Field | Type |
|---|---|
| `get_id` | int |
| `chara_id` | int |
| `dress_id` | int |
| `motion` | string |
| `face` | string |

<a id="type-noreceivepresentnum"></a>
#### NoReceivePresentNum

| Field | Type |
|---|---|
| `no_time_limit_present_num` | int |
| `time_limit_present_num` | int |

<a id="type-notdownparameterinfo"></a>
#### NotDownParameterInfo

| Field | Type |
|---|---|
| `evaluation_chara_id_array` | int[] |

<a id="type-notgaincharaeffect"></a>
#### NotGainCharaEffect

| Field | Type |
|---|---|
| `effected_chara_effect_id` | int |
| `not_gain_chara_effect_id` | int |

<a id="type-notupparameterinfo"></a>
#### NotUpParameterInfo

| Field | Type |
|---|---|
| `status_type_array` | int[] |
| `chara_effect_id_array` | int[] |
| `skill_id_array` | int[] |
| `skill_tips_array` | [SkillTips](#type-skilltips)[] |
| `skill_lv_id_array` | int[] |
| `evaluation_chara_id_array` | int[] |
| `command_lv_array` | int[] |
| `has_chara_effect_id_array` | int[] |
| `unsupported_evaluation_chara_id_array` | int[] |
| `unsupported_evaluation_support_card_id_array` | int[] |
| `not_gain_chara_effect_array` | [NotGainCharaEffect](#type-notgaincharaeffect)[] |

<a id="type-notupteamparameterinfo"></a>
#### NotUpTeamParameterInfo

| Field | Type |
|---|---|
| `status_array` | [TeamParameterCode](#type-teamparametercode)[] |

<a id="type-notedatafordisplay"></a>
#### NoteDataForDisplay

| Field | Type |
|---|---|
| `chara_id` | int |
| `data_id` | int |
| `create_time` | string |
| `new_flag` | int |

<a id="type-notedataforregist"></a>
#### NoteDataForRegist

| Field | Type |
|---|---|
| `chara_id` | int |
| `data_id` | int |

<a id="type-optioninfo"></a>
#### OptionInfo

| Field | Type |
|---|---|
| `type` | int |
| `value` | int |

<a id="type-paymentcoinbreakdowninfo"></a>
#### PaymentCoinBreakDownInfo

| Field | Type |
|---|---|
| `user_coin_id` | int |
| `product_master_id` | int |
| `coin` | int |
| `payment_money` | string |
| `currency_code` | string |

<a id="type-paymentdummyfinishparam"></a>
#### PaymentDummyFinishParam

| Field | Type |
|---|---|
| `agegroup` | int |
| `signature` | string |
| `original_receipt` | string |
| `currency_code` | string |
| `price` | string |
| `purchase_id` | string |

<a id="type-paymentfinishparam"></a>
#### PaymentFinishParam

| Field | Type |
|---|---|
| `agegroup` | int |
| `signature` | string |
| `original_receipt` | string |
| `currency_code` | string |
| `price` | string |
| `purchase_id` | string |
| `product_id` | string |
| `dmm_point_balance` | int |

<a id="type-paymentpurchaseitemparam"></a>
#### PaymentPurchaseItemParam

| Field | Type |
|---|---|
| `id` | int |
| `store_product_id` | string |
| `name` | string |
| `disp_order` | int |
| `price` | double |
| `formatted_price` | string |
| `charge_num` | int |
| `free_num` | int |
| `limit_num` | int |
| `limit_type` | int |
| `item_pack_id` | int |
| `recommended_flag` | int |
| `start_time` | long |
| `end_time` | long |
| `number_of_product_purchased` | int |

<a id="type-paymentpurchasetimesdata"></a>
#### PaymentPurchaseTimesData

| Field | Type |
|---|---|
| `product_id` | string |
| `number_of_product_purchased` | int |
| `limit_of_product_purchased` | int |

<a id="type-paymentpurchasedtimes"></a>
#### PaymentPurchasedTimes

| Field | Type |
|---|---|
| `product_id` | string |
| `num_of_purchases` | int |
| `limit_type` | int |
| `item_pack_id` | int |
| `limit` | int |

<a id="type-paymentseasonpackinfo"></a>
#### PaymentSeasonPackInfo

| Field | Type |
|---|---|
| `product_master_id` | int |
| `season_end_time` | int |
| `repurchase_time` | int |
| `notice_status` | int |

<a id="type-paymentstartparam"></a>
#### PaymentStartParam

| Field | Type |
|---|---|
| `product_id` | string |
| `price` | string |
| `currency_code` | string |
| `error_message` | string |

<a id="type-piecedata"></a>
#### PieceData

| Field | Type |
|---|---|
| `piece_id` | int |
| `piece_num` | int |

<a id="type-practicepartnerownerinfo"></a>
#### PracticePartnerOwnerInfo

| Field | Type |
|---|---|
| `partner_trained_chara_id` | int |
| `owner_viewer_id` | long |
| `owner_name` | string |
| `owner_trained_chara_id` | int |
| `friend_state` | int |

<a id="type-practicepartnerusedhistory"></a>
#### PracticePartnerUsedHistory

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `practice_exec_viewer_id` | long |
| `name` | string |
| `history_type` | int |
| `circle_name` | string |
| `use_time` | string |

<a id="type-practiceraceentrychara"></a>
#### PracticeRaceEntryChara

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `running_style` | int |
| `entry_id` | int |

<a id="type-practiceraceentryinfo"></a>
#### PracticeRaceEntryInfo

| Field | Type |
|---|---|
| `entry_id` | int |
| `frame_order` | int |

<a id="type-practiceracepresetinfo"></a>
#### PracticeRacePresetInfo

| Field | Type |
|---|---|
| `preset_id` | int |
| `name` | string |
| `preset_chara_array` | [PracticeRaceEntryChara](#type-practiceraceentrychara)[] |

<a id="type-practiceracepresetinfoforsave"></a>
#### PracticeRacePresetInfoForSave

| Field | Type |
|---|---|
| `preset_id` | int |
| `preset_chara_array` | [PracticeRaceEntryChara](#type-practiceraceentrychara)[] |

<a id="type-practiceracesavedraceinfo"></a>
#### PracticeRaceSavedRaceInfo

| Field | Type |
|---|---|
| `practice_race_id` | int |
| `race_instance_id` | int |
| `entry_num` | int |
| `user_entry_num` | int |
| `is_favorite` | int |
| `save_time` | string |

<a id="type-presentdata"></a>
#### PresentData

| Field | Type |
|---|---|
| `present_id` | int |
| `state` | int |
| `reward_type` | int |
| `reward_id` | int |
| `reward_count` | int |
| `message_id` | int |
| `message_param_value_1` | int |
| `message_param_value_2` | int |
| `message_param_value_3` | int |
| `message_param_value_4` | int |
| `reward_limit_time` | long |
| `create_time` | string |
| `receive_time` | string |
| `free_message` | string |

<a id="type-presetentrychara"></a>
#### PresetEntryChara

| Field | Type |
|---|---|
| `viewer_id` | long |
| `entry_id` | int |
| `trained_chara_id` | int |
| `running_style` | int |

<a id="type-presetinfo"></a>
#### PresetInfo

| Field | Type |
|---|---|
| `preset_id` | int |
| `name` | string |
| `preset_chara_array` | [PresetEntryChara](#type-presetentrychara)[] |

<a id="type-raceconditioninfo"></a>
#### RaceConditionInfo

| Field | Type |
|---|---|
| `order` | int |
| `race_instance_id` | int |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |

<a id="type-racehorsedata"></a>
#### RaceHorseData

| Field | Type |
|---|---|
| `viewer_id` | long |
| `owner_viewer_id` | long |
| `trainer_name` | string |
| `owner_trainer_name` | string |
| `single_mode_chara_id` | int |
| `trained_chara_id` | int |
| `nickname_id` | int |
| `card_id` | int |
| `chara_id` | int |
| `rarity` | int |
| `talent_level` | int |
| `frame_order` | int |
| `skill_array` | [SkillData](#type-skilldata)[] |
| `stamina` | int |
| `speed` | int |
| `pow` | int |
| `guts` | int |
| `wiz` | int |
| `running_style` | int |
| `race_dress_id` | int |
| `chara_color_type` | int |
| `npc_type` | int |
| `final_grade` | int |
| `popularity` | int |
| `popularity_mark_rank_array` | int[] |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `motivation` | int |
| `mob_id` | int |
| `win_saddle_id_array` | int[] |
| `race_result_array` | [RaceHorseDataRaceResult](#type-racehorsedataraceresult)[] |
| `team_id` | int |
| `team_member_id` | int |
| `item_id_array` | int[] |
| `motivation_change_flag` | int |
| `frame_order_change_flag` | int |
| `team_rank` | int |
| `single_mode_win_count` | int |
| `fan_count` | int |

<a id="type-racehorsedataraceresult"></a>
#### RaceHorseDataRaceResult

| Field | Type |
|---|---|
| `turn` | int |
| `program_id` | int |
| `result_rank` | int |

<a id="type-raceinstanceinfo"></a>
#### RaceInstanceInfo

| Field | Type |
|---|---|
| `race_instance_id` | int |
| `trophy_chara_info_array` | [TrophyCharaInfo](#type-trophycharainfo)[] |

<a id="type-raceresultdata"></a>
#### RaceResultData

| Field | Type |
|---|---|
| `viewer_id` | long |
| `finish_order` | int |
| `finish_time` | int |
| `finish_time_raw` | int |
| `bashin_diff_from_behind` | int |

<a id="type-raceresultinfo"></a>
#### RaceResultInfo

| Field | Type |
|---|---|
| `race_instance_id` | int |
| `race_horse_data_array` | [RaceHorseData](#type-racehorsedata)[] |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `random_seed` | int |
| `race_scenario` | string |

<a id="type-racerewarddata"></a>
#### RaceRewardData

| Field | Type |
|---|---|
| `item_type` | int |
| `item_id` | int |
| `item_num` | int |

<a id="type-racerewardlimitdata"></a>
#### RaceRewardLimitData

| Field | Type |
|---|---|
| `reward_id` | int |
| `item_type` | int |
| `item_id` | int |
| `item_num` | int |
| `rest_count` | int |

<a id="type-racerewardlimitmoredata"></a>
#### RaceRewardLimitMoreData

| Field | Type |
|---|---|
| `reward_id` | int |
| `rest_count` | int |

<a id="type-racerotationinfo"></a>
#### RaceRotationInfo

| Field | Type |
|---|---|
| `current_race_num` | int |
| `race_condition_array` | [RaceConditionInfo](#type-raceconditioninfo)[] |

<a id="type-racesimulateresult"></a>
#### RaceSimulateResult

| Field | Type |
|---|---|
| `viewer_id` | long |
| `single_mode_chara_id` | int |
| `finish_order` | int |
| `time` | int |
| `popularity` | int |
| `popularity_mark_rank_array` | int[] |
| `score` | [TeamStadiumResultHorseScore](#type-teamstadiumresulthorsescore) |

<a id="type-raceskipreward"></a>
#### RaceSkipReward

| Field | Type |
|---|---|
| `rank` | int |
| `normal_reward_array` | [RaceRewardData](#type-racerewarddata)[] |
| `rare_reward_array` | [RaceRewardData](#type-racerewarddata)[] |
| `bonus_reward_array` | [RaceRewardData](#type-racerewarddata)[] |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |

<a id="type-rafflecampaignresponsedata"></a>
#### RaffleCampaignResponseData

| Field | Type |
|---|---|
| `campaign_id` | int |
| `state` | int |
| `campaign_story_condition_value` | int |

<a id="type-releasenuminfo"></a>
#### ReleaseNumInfo

| Field | Type |
|---|---|
| `voice_num` | int |
| `act_num` | int |
| `good_end_num` | int |
| `music_num` | int |
| `main_story_num` | int |
| `chara_story_num` | int |
| `card_num` | int |
| `support_card_num` | int |
| `chara_event_num` | int |
| `support_event_num` | int |
| `scenario_event_num` | int |
| `home_event_num` | int |

<a id="type-releasedepisodedatafordisplay"></a>
#### ReleasedEpisodeDataForDisplay

| Field | Type |
|---|---|
| `id` | int |

<a id="type-releasedepisodedataforregist"></a>
#### ReleasedEpisodeDataForRegist

| Field | Type |
|---|---|
| `id` | int |

<a id="type-responseitem"></a>
#### ResponseItem

| Field | Type |
|---|---|
| `item_type` | int |
| `item_id` | int |
| `item_num` | int |

<a id="type-rewardaddsupportcardnum"></a>
#### RewardAddSupportCardNum

| Field | Type |
|---|---|
| `support_card_id` | int |
| `number` | int |
| `item_type` | int |

<a id="type-rewardsummaryinfo"></a>
#### RewardSummaryInfo

| Field | Type |
|---|---|
| `add_present_num` | int |
| `add_item_list` | [UserItem](#type-useritem)[] |
| `add_card_list` | [UserCard](#type-usercard)[] |
| `add_card_bonus_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `add_support_card_list` | [UserSupportCard](#type-usersupportcard)[] |
| `add_support_card_num_array` | [RewardAddSupportCardNum](#type-rewardaddsupportcardnum)[] |
| `add_chara_list` | [UserChara](#type-userchara)[] |
| `add_cloth_list` | [UserCloth](#type-usercloth)[] |
| `add_music_list` | [UserMusic](#type-usermusic)[] |
| `add_fcoin` | int |
| `add_honor_list` | [HonorData](#type-honordata)[] |
| `add_piece_list` | [PieceData](#type-piecedata)[] |
| `add_total_fan` | int |
| `new_chara_profile_array` | [CharaProfileData](#type-charaprofiledata)[] |
| `force_update_honor_id` | int |

<a id="type-roommatchentrychara"></a>
#### RoomMatchEntryChara

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `running_style` | int |
| `member_id` | int |

<a id="type-roommatchrestrictcharainfo"></a>
#### RoomMatchRestrictCharaInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `dress_id_array` | int[] |

<a id="type-roommatchroominfo"></a>
#### RoomMatchRoomInfo

| Field | Type |
|---|---|
| `room_id` | int |
| `host_viewer_id` | long |
| `race_instance_id` | int |
| `room_name` | string |
| `message` | string |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `motivation` | int |
| `entry_num` | int |
| `current_entry_num` | int |
| `private_entry_type` | int |
| `private_entry_num` | int |
| `private_current_entry_num` | int |
| `is_allow_watching` | int |
| `trained_chara_restriction` | int |
| `restriction_type` | int |
| `start_time` | string |
| `status` | int |
| `is_allow_display` | int |
| `private_entry_status` | int |
| `restrict_chara_info_array` | [RoomMatchRestrictCharaInfo](#type-roommatchrestrictcharainfo)[] |

<a id="type-roommatchsavedroominfo"></a>
#### RoomMatchSavedRoomInfo

| Field | Type |
|---|---|
| `saved_room_id` | int |
| `register_id` | ulong |
| `host_viewer_id` | long |
| `race_instance_id` | int |
| `room_name` | string |
| `message` | string |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `motivation` | int |
| `entry_num` | int |
| `current_entry_num` | int |
| `private_entry_type` | int |
| `private_entry_num` | int |
| `private_current_entry_num` | int |
| `is_allow_watching` | int |
| `trained_chara_restriction` | int |
| `restriction_type` | int |
| `start_time` | string |
| `random_seed` | int |
| `favorite_flag` | int |
| `own_join_type` | int |
| `restrict_chara_info_array` | [RoomMatchRestrictCharaInfo](#type-roommatchrestrictcharainfo)[] |

<a id="type-roommatchtrainedchara"></a>
#### RoomMatchTrainedChara

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `owner_viewer_id` | long |
| `use_type` | int |
| `card_id` | int |
| `name` | string |
| `stamina` | int |
| `speed` | int |
| `power` | int |
| `guts` | int |
| `wiz` | int |
| `fans` | int |
| `rank_score` | int |
| `rank` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `succession_num` | int |
| `is_locked` | int |
| `rarity` | int |
| `talent_level` | int |
| `chara_grade` | int |
| `running_style` | int |
| `nickname_id` | int |
| `wins` | int |
| `skill_array` | [SkillData](#type-skilldata)[] |
| `support_card_list` | [TrainedCharaSupportCardList](#type-trainedcharasupportcardlist)[] |
| `is_saved` | int |
| `race_result_list` | [TrainedCharaRaceResult](#type-trainedchararaceresult)[] |
| `win_saddle_id_array` | int[] |
| `nickname_id_array` | int[] |
| `factor_info_array` | [FactorInfo](#type-factorinfo)[] |
| `factor_extend_array` | [FactorExtend](#type-factorextend)[] |
| `succession_chara_array` | [SuccessionChara](#type-successionchara)[] |
| `scenario_id` | int |
| `member_id` | int |
| `join_type` | int |
| `create_time` | string |

<a id="type-roommatchuser"></a>
#### RoomMatchUser

| Field | Type |
|---|---|
| `viewer_id` | long |
| `room_id` | int |
| `name` | string |
| `leader_chara_id` | int |
| `leader_chara_dress_id` | int |
| `honor_data` | [HonorData](#type-honordata) |
| `join_type` | int |

<a id="type-roommatchuserdetail"></a>
#### RoomMatchUserDetail

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `leader_chara_id` | int |
| `leader_chara_dress_id` | int |
| `honor_id` | int |
| `honor_data` | [HonorData](#type-honordata) |
| `user_friend_state` | int |
| `trained_chara_array` | [RoomMatchTrainedChara](#type-roommatchtrainedchara)[] |
| `join_type` | int |
| `register_time` | string |

<a id="type-rpinfo"></a>
#### RpInfo

| Field | Type |
|---|---|
| `current_rp` | int |
| `max_rp` | int |
| `max_recovery_time` | int |

<a id="type-scenariorecord"></a>
#### ScenarioRecord

| Field | Type |
|---|---|
| `scenario_id` | int |
| `directory_ranking` | int |
| `trained_chara` | [TrainedChara](#type-trainedchara) |

<a id="type-scenariorecordhighestscore"></a>
#### ScenarioRecordHighestScore

| Field | Type |
|---|---|
| `scenario_id` | int |
| `highest_rank_score` | int |

<a id="type-sellsupportcardinfo"></a>
#### SellSupportCardInfo

| Field | Type |
|---|---|
| `support_card_id` | int |
| `stock` | int |
| `client_own_stock` | int |

<a id="type-serialcoderewardinfo"></a>
#### SerialCodeRewardInfo

| Field | Type |
|---|---|
| `reward_array` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `campaign_name` | string |

<a id="type-shortepisodedatafordisplay"></a>
#### ShortEpisodeDataForDisplay

| Field | Type |
|---|---|
| `id` | int |

<a id="type-shortepisodedataforregist"></a>
#### ShortEpisodeDataForRegist

| Field | Type |
|---|---|
| `id` | int |

<a id="type-singlemodechara"></a>
#### SingleModeChara

| Field | Type |
|---|---|
| `single_mode_chara_id` | int |
| `card_id` | int |
| `chara_grade` | int |
| `speed` | int |
| `stamina` | int |
| `power` | int |
| `wiz` | int |
| `guts` | int |
| `vital` | int |
| `max_speed` | int |
| `max_stamina` | int |
| `max_power` | int |
| `max_wiz` | int |
| `max_guts` | int |
| `default_max_speed` | int |
| `default_max_stamina` | int |
| `default_max_power` | int |
| `default_max_wiz` | int |
| `default_max_guts` | int |
| `max_vital` | int |
| `motivation` | int |
| `fans` | int |
| `rarity` | int |
| `race_program_id` | int |
| `reserve_race_program_id` | int |
| `race_running_style` | int |
| `is_short_race` | int |
| `talent_level` | int |
| `skill_array` | [SkillData](#type-skilldata)[] |
| `disable_skill_id_array` | int[] |
| `skill_tips_array` | [SkillTips](#type-skilltips)[] |
| `support_card_array` | [SingleModeSupportCard](#type-singlemodesupportcard)[] |
| `succession_trained_chara_id_1` | int |
| `succession_trained_chara_id_2` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `turn` | int |
| `skill_point` | int |
| `short_cut_state` | int |
| `state` | int |
| `playing_state` | int |
| `scenario_id` | int |
| `route_id` | int |
| `start_time` | string |
| `evaluation_info_array` | [EvaluationInfo](#type-evaluationinfo)[] |
| `training_level_info_array` | [TrainingLevelInfo](#type-traininglevelinfo)[] |
| `nickname_id_array` | int[] |
| `chara_effect_id_array` | int[] |
| `route_race_id_array` | int[] |
| `guest_outing_info_array` | [GuestOutingInfo](#type-guestoutinginfo)[] |
| `skill_upgrade_info_array` | [SingleModeSkillUpgrade](#type-singlemodeskillupgrade)[] |

<a id="type-singlemodecharalight"></a>
#### SingleModeCharaLight

| Field | Type |
|---|---|
| `single_mode_chara_id` | int |
| `card_id` | int |
| `chara_grade` | int |
| `speed` | int |
| `stamina` | int |
| `power` | int |
| `wiz` | int |
| `guts` | int |
| `vital` | int |
| `max_vital` | int |
| `motivation` | int |
| `fans` | int |
| `rarity` | int |
| `race_program_id` | int |
| `reserve_race_turn` | int |
| `reserve_race_program_id` | int |
| `race_running_style` | int |
| `talent_level` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `turn` | int |
| `skill_point` | int |
| `short_cut_state` | int |
| `state` | int |
| `playing_state` | int |
| `scenario_id` | int |
| `route_id` | int |
| `succession_trained_chara_id_1` | int |
| `succession_trained_chara_id_2` | int |
| `route_race_id_array` | int[] |
| `difficulty_id` | int |
| `difficulty` | int |
| `training_challenge_id` | int |

<a id="type-singlemodecommandinfo"></a>
#### SingleModeCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `is_enable` | int |
| `training_partner_array` | int[] |
| `tips_event_partner_array` | int[] |
| `params_inc_dec_info_array` | [SingleModeParamsIncDecInfo](#type-singlemodeparamsincdecinfo)[] |
| `failure_rate` | int |

<a id="type-singlemodecommandresult"></a>
#### SingleModeCommandResult

| Field | Type |
|---|---|
| `command_id` | int |
| `sub_id` | int |
| `result_state` | int |

<a id="type-singlemodedifficultyboxinfo"></a>
#### SingleModeDifficultyBoxInfo

| Field | Type |
|---|---|
| `box_id` | int |
| `reward_info_array` | [SingleModeDifficultyBoxRewardInfo](#type-singlemodedifficultyboxrewardinfo)[] |

<a id="type-singlemodedifficultyboxrewardinfo"></a>
#### SingleModeDifficultyBoxRewardInfo

| Field | Type |
|---|---|
| `difficulty_box_reward_id` | int |
| `remain_num` | int |

<a id="type-singlemodedifficultyinfo"></a>
#### SingleModeDifficultyInfo

| Field | Type |
|---|---|
| `difficulty_id` | int |
| `open_difficulty_index` | int |
| `item_num` | int |
| `box_id` | int |
| `box_item_num` | int |
| `gacha_gauge` | int |
| `box_info_array` | [SingleModeDifficultyBoxInfo](#type-singlemodedifficultyboxinfo)[] |

<a id="type-singlemodeeventinfo"></a>
#### SingleModeEventInfo

| Field | Type |
|---|---|
| `event_id` | int |
| `chara_id` | int |
| `story_id` | int |
| `play_timing` | int |
| `event_contents_info` | [EventContentsInfo](#type-eventcontentsinfo) |
| `succession_event_info` | [SingleModeSuccessionEventInfo](#type-singlemodesuccessioneventinfo) |
| `minigame_result` | [MinigameResult](#type-minigameresult) |

<a id="type-singlemodefactorlotterycommon"></a>
#### SingleModeFactorLotteryCommon

| Field | Type |
|---|---|
| `tp_info` | [TpInfo](#type-tpinfo) |
| `lottery_remain_num` | int |
| `lottery_count` | int |
| `select_lottery_id` | int |
| `factor_select_info_array` | [FactorSelectInfo](#type-factorselectinfo)[] |

<a id="type-singlemodefactorreserchdataset"></a>
#### SingleModeFactorReserchDataSet

| Field | Type |
|---|---|
| `factor_research_gauge_info` | [FactorResearchGaugeInfo](#type-factorresearchgaugeinfo) |
| `is_boost` | int |

<a id="type-singlemodefactorselectcommon"></a>
#### SingleModeFactorSelectCommon

| Field | Type |
|---|---|
| `rank_score` | int |
| `rank` | int |
| `lottery_remain_num` | int |
| `lottery_count` | int |
| `select_lottery_id` | int |
| `factor_select_info_array` | [FactorSelectInfo](#type-factorselectinfo)[] |

<a id="type-singlemodefinishcommon"></a>
#### SingleModeFinishCommon

| Field | Type |
|---|---|
| `trained_chara` | [TrainedChara](#type-trainedchara)[] |
| `directory_card_array` | [DirectoryCard](#type-directorycard)[] |
| `directory_ranking` | int |
| `trained_chara_id` | int |
| `directory_card_num` | int |
| `chara_info` | [SingleModeChara](#type-singlemodechara) |
| `love_point_info` | [LovePointInfo](#type-lovepointinfo) |
| `reward_item_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `support_card_data_array` | [UserSupportCard](#type-usersupportcard)[] |
| `limited_shop_info` | [LimitedShopInfo](#type-limitedshopinfo) |
| `update_user_chara_info` | [UserChara](#type-userchara) |
| `release_item_flag` | int |
| `circle_point` | ulong |
| `new_chara_profile_array` | [CharaProfileData](#type-charaprofiledata)[] |
| `campaign_id_array` | int[] |
| `scenario_record_array` | [ScenarioRecord](#type-scenariorecord)[] |
| `scenario_record_reward_array` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `story_event_info` | [StoryEventSingleModeResult](#type-storyeventsinglemoderesult) |
| `difficulty_data_set` | [SingleModeResultDifficultyDataSet](#type-singlemoderesultdifficultydataset) |
| `transfer_event_info` | [TransferEventInfo](#type-transfereventinfo) |
| `training_challenge_result` | [TrainingChallengeResult](#type-trainingchallengeresult) |
| `fan_raid_info` | [FanRaidSingleModeResult](#type-fanraidsinglemoderesult) |
| `campaign_walking_gauge_info` | [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo) |
| `map_event_gauge_info` | [CampaignWalkingGaugeInfo](#type-campaignwalkinggaugeinfo) |
| `collect_raid_info` | [CollectRaidInfo](#type-collectraidinfo) |
| `factor_research_data_set` | [SingleModeFactorReserchDataSet](#type-singlemodefactorreserchdataset) |

<a id="type-singlemodefreecommandinfo"></a>
#### SingleModeFreeCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `params_inc_dec_info_array` | [SingleModeParamsIncDecInfo](#type-singlemodeparamsincdecinfo)[] |

<a id="type-singlemodefreedataset"></a>
#### SingleModeFreeDataSet

| Field | Type |
|---|---|
| `shop_id` | int |
| `sale_value` | int |
| `win_points` | int |
| `gained_coin_num` | int |
| `coin_num` | int |
| `twinkle_race_ranking` | int |
| `user_item_info_array` | [SingleModeFreeUserItem](#type-singlemodefreeuseritem)[] |
| `pick_up_item_info_array` | [SingleModeFreePickUpItem](#type-singlemodefreepickupitem)[] |
| `twinkle_race_npc_info_array` | [SingleModeFreeTwinkleRaceNpcInfo](#type-singlemodefreetwinkleracenpcinfo)[] |
| `item_effect_array` | [SingleModeFreeItemEffect](#type-singlemodefreeitemeffect)[] |
| `twinkle_race_npc_result_array` | [SingleModeTwikleRaceNpcResult](#type-singlemodetwikleracenpcresult)[] |
| `rival_race_info_array` | [SingleModeRivalRaceInfo](#type-singlemoderivalraceinfo)[] |
| `command_info_array` | [SingleModeFreeCommandInfo](#type-singlemodefreecommandinfo)[] |
| `unchecked_event_achievement_id` | int |

<a id="type-singlemodefreeexchangeiteminfo"></a>
#### SingleModeFreeExchangeItemInfo

| Field | Type |
|---|---|
| `shop_item_id` | int |
| `current_num` | int |

<a id="type-singlemodefreeitemeffect"></a>
#### SingleModeFreeItemEffect

| Field | Type |
|---|---|
| `use_id` | int |
| `item_id` | int |
| `effect_type` | int |
| `effect_value_1` | int |
| `effect_value_2` | int |
| `effect_value_3` | int |
| `effect_value_4` | int |
| `begin_turn` | int |
| `end_turn` | int |

<a id="type-singlemodefreepickupitem"></a>
#### SingleModeFreePickUpItem

| Field | Type |
|---|---|
| `shop_item_id` | int |
| `item_id` | int |
| `coin_num` | int |
| `original_coin_num` | int |
| `item_buy_num` | int |
| `limit_buy_count` | int |
| `limit_turn` | int |

<a id="type-singlemodefreetwinkleracenpcinfo"></a>
#### SingleModeFreeTwinkleRaceNpcInfo

| Field | Type |
|---|---|
| `npc_id` | int |
| `chara_id` | int |
| `dress_id` | int |
| `talent_level` | int |
| `win_points` | int |
| `speed` | int |
| `stamina` | int |
| `power` | int |
| `guts` | int |
| `wiz` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `skill_array` | [SkillData](#type-skilldata)[] |

<a id="type-singlemodefreeuseiteminfo"></a>
#### SingleModeFreeUseItemInfo

| Field | Type |
|---|---|
| `item_id` | int |
| `use_num` | int |
| `current_num` | int |

<a id="type-singlemodefreeuseritem"></a>
#### SingleModeFreeUserItem

| Field | Type |
|---|---|
| `item_id` | int |
| `num` | int |

<a id="type-singlemodefriendsupportcard"></a>
#### SingleModeFriendSupportCard

| Field | Type |
|---|---|
| `summary_user_info_array` | [UserInfoAtFriend](#type-userinfoatfriend)[] |
| `support_card_data_array` | [UserSupportCard](#type-usersupportcard)[] |

<a id="type-singlemodefriendsupportcardinfo"></a>
#### SingleModeFriendSupportCardInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `support_card_id` | int |

<a id="type-singlemodehomeinfo"></a>
#### SingleModeHomeInfo

| Field | Type |
|---|---|
| `command_info_array` | [SingleModeCommandInfo](#type-singlemodecommandinfo)[] |
| `race_entry_restriction` | int |
| `disable_command_id_array` | int[] |
| `available_continue_num` | int |
| `available_free_continue_num` | int |
| `free_continue_num` | int |
| `free_continue_time` | long |
| `shortened_race_state` | int |

<a id="type-singlemodelivecommandinfo"></a>
#### SingleModeLiveCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `performance_inc_dec_info_array` | [SingleModeLivePerformanceIncDecInfo](#type-singlemodeliveperformanceincdecinfo)[] |
| `params_inc_dec_info_array` | [SingleModeParamsIncDecInfo](#type-singlemodeparamsincdecinfo)[] |

<a id="type-singlemodelivedataset"></a>
#### SingleModeLiveDataSet

| Field | Type |
|---|---|
| `live_info` | [SingleModeLiveInfo](#type-singlemodeliveinfo) |
| `live_performance_info` | [SingleModeLivePerformanceInfo](#type-singlemodeliveperformanceinfo) |
| `command_info_array` | [SingleModeLiveCommandInfo](#type-singlemodelivecommandinfo)[] |
| `evaluation_info_array` | [LiveEvaluationInfo](#type-liveevaluationinfo)[] |
| `next_square_info_array` | [SingleModeLiveNextSquareInfo](#type-singlemodelivenextsquareinfo)[] |
| `master_live_id_array` | int[] |
| `next_live_id_array` | int[] |
| `effected_live_id_array` | int[] |
| `not_up_parameter_info` | [LiveNotUpParameterInfo](#type-livenotupparameterinfo) |
| `live_result_array` | [SingleModeLiveLiveResult](#type-singlemodeliveliveresult)[] |
| `reserve_square_id` | int |
| `training_bonus_array` | [SingleModeLiveTrainingBonus](#type-singlemodelivetrainingbonus)[] |

<a id="type-singlemodeliveinfo"></a>
#### SingleModeLiveInfo

| Field | Type |
|---|---|
| `live_id` | int |

<a id="type-singlemodeliveliveresult"></a>
#### SingleModeLiveLiveResult

| Field | Type |
|---|---|
| `live_type` | int |
| `result_state` | int |

<a id="type-singlemodelivenextsquareinfo"></a>
#### SingleModeLiveNextSquareInfo

| Field | Type |
|---|---|
| `square_id` | int |
| `square_num` | int |

<a id="type-singlemodeliveperformanceincdecinfo"></a>
#### SingleModeLivePerformanceIncDecInfo

| Field | Type |
|---|---|
| `performance_type` | int |
| `value` | int |

<a id="type-singlemodeliveperformanceinfo"></a>
#### SingleModeLivePerformanceInfo

| Field | Type |
|---|---|
| `dance` | int |
| `max_dance` | int |
| `passion` | int |
| `max_passion` | int |
| `vocal` | int |
| `max_vocal` | int |
| `visual` | int |
| `max_visual` | int |
| `mental` | int |
| `max_mental` | int |

<a id="type-singlemodelivetrainingbonus"></a>
#### SingleModeLiveTrainingBonus

| Field | Type |
|---|---|
| `target_type` | int |
| `effect_value` | int |

<a id="type-singlemodeloadcommon"></a>
#### SingleModeLoadCommon

| Field | Type |
|---|---|
| `chara_info` | [SingleModeChara](#type-singlemodechara) |
| `race_condition_array` | [SingleModeRaceCondition](#type-singlemoderacecondition)[] |
| `unchecked_event_array` | [SingleModeEventInfo](#type-singlemodeeventinfo)[] |
| `home_info` | [SingleModeHomeInfo](#type-singlemodehomeinfo) |
| `race_history` | [SingleRaceHistory](#type-singleracehistory)[] |
| `win_saddle_id_array` | int[] |
| `effected_factor_array` | [SuccessionEffectedFactor](#type-successioneffectedfactor)[] |
| `race_start_info` | [SingleRaceStartInfo](#type-singleracestartinfo) |
| `race_scenario` | string |
| `race_reward_info` | [CharaRaceReward](#type-chararacereward) |
| `add_trophy_info` | [LoginUserTrophyInfo](#type-loginusertrophyinfo) |
| `trophy_reward_info` | [RaceRewardData](#type-racerewarddata) |
| `prev_chara_grade` | int |
| `race_add_reward_info` | [SingleModeRaceAddRewardInfo](#type-singlemoderaceaddrewardinfo)[] |
| `reserved_race_array` | [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |
| `mission_list` | [UserMission](#type-usermission)[] |
| `story_event_mission_list` | [UserMission](#type-usermission)[] |
| `start_dress_info` | [SingleModeStartDressInfo](#type-singlemodestartdressinfo) |
| `story_event_chara_bonus_list` | [StoryEventCharaBonus](#type-storyeventcharabonus)[] |
| `resume_factor_select` | [SingleModeFactorSelectCommon](#type-singlemodefactorselectcommon) |
| `race_random_program_array` | [SingleModeRaceRandomProgram](#type-singlemoderacerandomprogram)[] |

<a id="type-singlemodemultiracereservedeck"></a>
#### SingleModeMultiRaceReserveDeck

| Field | Type |
|---|---|
| `deck_num` | int |
| `deck_name` | string |
| `add_race_array` | [SingleModeReservedRace](#type-singlemodereservedrace)[] |
| `cancel_race_array` | [SingleModeReservedRace](#type-singlemodereservedrace)[] |
| `is_default` | int |

<a id="type-singlemodenpcresult"></a>
#### SingleModeNpcResult

| Field | Type |
|---|---|
| `npc_id` | int |
| `result_rank` | int |

<a id="type-singlemodenpcteamdata"></a>
#### SingleModeNpcTeamData

| Field | Type |
|---|---|
| `distance_type` | int |
| `member_id` | int |
| `base_npc_id` | int |
| `npc_id` | int |
| `running_style` | int |

<a id="type-singlemodeparamsincdecinfo"></a>
#### SingleModeParamsIncDecInfo

| Field | Type |
|---|---|
| `target_type` | int |
| `value` | int |

<a id="type-singlemoderaceaddrewardinfo"></a>
#### SingleModeRaceAddRewardInfo

| Field | Type |
|---|---|
| `campaign_id` | int |
| `program_id` | int |
| `reward_date` | int |
| `reward_count` | int |

<a id="type-singlemoderacecondition"></a>
#### SingleModeRaceCondition

| Field | Type |
|---|---|
| `program_id` | int |
| `weather` | int |
| `ground_condition` | int |

<a id="type-singlemoderacerandomprogram"></a>
#### SingleModeRaceRandomProgram

| Field | Type |
|---|---|
| `turn` | int |
| `program_id` | int |

<a id="type-singlemoderentalsuccessionchara"></a>
#### SingleModeRentalSuccessionChara

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `is_circle_member` | bool |
| `is_event_rental` | bool |

<a id="type-singlemodereservedrace"></a>
#### SingleModeReservedRace

| Field | Type |
|---|---|
| `year` | int |
| `program_id` | int |

<a id="type-singlemodereservedracedeck"></a>
#### SingleModeReservedRaceDeck

| Field | Type |
|---|---|
| `deck_num` | int |
| `deck_name` | string |
| `race_array` | [SingleModeReservedRace](#type-singlemodereservedrace)[] |

<a id="type-singlemodereservedraceinfo"></a>
#### SingleModeReservedRaceInfo

| Field | Type |
|---|---|
| `default_deck_num` | int |
| `needs_default_confirm` | int |
| `reserved_race_array` | [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |

<a id="type-singlemoderesultdifficultybox"></a>
#### SingleModeResultDifficultyBox

| Field | Type |
|---|---|
| `box_id` | int |
| `reward_array` | [DisplayRewardInfo](#type-displayrewardinfo)[] |

<a id="type-singlemoderesultdifficultydataset"></a>
#### SingleModeResultDifficultyDataSet

| Field | Type |
|---|---|
| `single_mode_difficulty_info_array` | [SingleModeDifficultyInfo](#type-singlemodedifficultyinfo)[] |
| `type1_reward_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `type2_reward_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `box_reward_array` | [SingleModeResultDifficultyBox](#type-singlemoderesultdifficultybox)[] |
| `single_reward_array` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `is_boost` | int |

<a id="type-singlemoderivalraceinfo"></a>
#### SingleModeRivalRaceInfo

| Field | Type |
|---|---|
| `program_id` | int |
| `chara_id` | int |

<a id="type-singlemodeselecteddifficultyinfo"></a>
#### SingleModeSelectedDifficultyInfo

| Field | Type |
|---|---|
| `difficulty_id` | int |
| `difficulty` | int |
| `is_boost` | int |

<a id="type-singlemodeskillfilterset"></a>
#### SingleModeSkillFilterSet

| Field | Type |
|---|---|
| `set_type` | int |
| `set_value` | int |

<a id="type-singlemodeskillupgrade"></a>
#### SingleModeSkillUpgrade

| Field | Type |
|---|---|
| `condition_id` | int |
| `total_count` | int |
| `current_count` | int |

<a id="type-singlemodestartchara"></a>
#### SingleModeStartChara

| Field | Type |
|---|---|
| `card_id` | int |
| `support_card_ids` | int[] |
| `friend_support_card_info` | [SingleModeFriendSupportCardInfo](#type-singlemodefriendsupportcardinfo) |
| `succession_trained_chara_id_1` | int |
| `succession_trained_chara_id_2` | int |
| `rental_succession_trained_chara` | [SingleModeRentalSuccessionChara](#type-singlemoderentalsuccessionchara) |
| `scenario_id` | int |
| `selected_difficulty_info` | [SingleModeSelectedDifficultyInfo](#type-singlemodeselecteddifficultyinfo) |
| `select_deck_id` | int |
| `boost_story_event_id` | int |
| `boost_factor_research_event_id` | int |
| `is_play_training_challenge` | bool |
| `training_challenge_mode` | int |
| `running_style` | int |

<a id="type-singlemodestartcommon"></a>
#### SingleModeStartCommon

| Field | Type |
|---|---|
| `chara_info` | [SingleModeChara](#type-singlemodechara) |
| `race_condition_array` | [SingleModeRaceCondition](#type-singlemoderacecondition)[] |
| `home_info` | [SingleModeHomeInfo](#type-singlemodehomeinfo) |
| `unchecked_event_array` | [SingleModeEventInfo](#type-singlemodeeventinfo)[] |
| `tp_info` | [TpInfo](#type-tpinfo) |
| `user_item_array` | [UserItem](#type-useritem)[] |
| `add_trained_chara_array` | [TrainedChara](#type-trainedchara)[] |
| `reserved_race_array` | [SingleModeReservedRaceDeck](#type-singlemodereservedracedeck)[] |
| `mission_list` | [UserMission](#type-usermission)[] |
| `story_event_mission_list` | [UserMission](#type-usermission)[] |
| `story_event_chara_bonus_list` | [StoryEventCharaBonus](#type-storyeventcharabonus)[] |
| `race_random_program_array` | [SingleModeRaceRandomProgram](#type-singlemoderacerandomprogram)[] |

<a id="type-singlemodestartdressinfo"></a>
#### SingleModeStartDressInfo

| Field | Type |
|---|---|
| `single_mode_chara_dress_id` | int |
| `succession_info` | [SingleModeSuccessionDressInfo](#type-singlemodesuccessiondressinfo)[] |

<a id="type-singlemodestartrequestcommon"></a>
#### SingleModeStartRequestCommon

| Field | Type |
|---|---|
| `start_chara` | [SingleModeStartChara](#type-singlemodestartchara) |
| `tp_info` | [TpInfo](#type-tpinfo) |
| `current_money` | int |
| `use_tp` | int |
| `current_succession_rank_point` | int |

<a id="type-singlemodesuccessiondressinfo"></a>
#### SingleModeSuccessionDressInfo

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `dress_id` | int |

<a id="type-singlemodesuccessioneventinfo"></a>
#### SingleModeSuccessionEventInfo

| Field | Type |
|---|---|
| `effect_type` | int |

<a id="type-singlemodesuccessiontrainedchara"></a>
#### SingleModeSuccessionTrainedChara

| Field | Type |
|---|---|
| `summary_user_info_array` | [UserInfoAtFriend](#type-userinfoatfriend)[] |
| `succession_trained_chara_array` | [TrainedChara](#type-trainedchara)[] |

<a id="type-singlemodesupportcard"></a>
#### SingleModeSupportCard

| Field | Type |
|---|---|
| `position` | int |
| `support_card_id` | int |
| `limit_break_count` | int |
| `exp` | int |
| `training_partner_state` | int |
| `owner_viewer_id` | long |
| `rental_type` | int |

<a id="type-singlemodeteamanalyzemarkarray"></a>
#### SingleModeTeamAnalyzeMarkArray

| Field | Type |
|---|---|
| `distance_type` | int |
| `mark_type` | int |

<a id="type-singlemodeteamcharainfo"></a>
#### SingleModeTeamCharaInfo

| Field | Type |
|---|---|
| `training_partner_id` | int |
| `speed` | int |
| `stamina` | int |
| `power` | int |
| `wiz` | int |
| `guts` | int |
| `speed_limit` | int |
| `stamina_limit` | int |
| `power_limit` | int |
| `wiz_limit` | int |
| `guts_limit` | int |
| `speed_limit_base` | int |
| `stamina_limit_base` | int |
| `power_limit_base` | int |
| `wiz_limit_base` | int |
| `guts_limit_base` | int |
| `rank_score` | int |

<a id="type-singlemodeteamcommandinfo"></a>
#### SingleModeTeamCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `guide_event_partner_array` | int[] |
| `soul_event_partner_array` | int[] |
| `sp_soul_event_partner_array` | int[] |
| `params_inc_dec_info_array` | [SingleModeParamsIncDecInfo](#type-singlemodeparamsincdecinfo)[] |

<a id="type-singlemodeteamcommandresult"></a>
#### SingleModeTeamCommandResult

| Field | Type |
|---|---|
| `skill_tips_array` | [SkillTips](#type-skilltips)[] |
| `soul_skill_tips_array` | [TeamSkillTips](#type-teamskilltips)[] |
| `sp_soul_skill_tips_array` | [TeamSkillTips](#type-teamskilltips)[] |

<a id="type-singlemodeteamdata"></a>
#### SingleModeTeamData

| Field | Type |
|---|---|
| `distance_type` | int |
| `member_id` | int |
| `chara_id` | int |
| `running_style` | int |

<a id="type-singlemodeteamdataset"></a>
#### SingleModeTeamDataSet

| Field | Type |
|---|---|
| `team_info` | [SingleModeTeamInfo](#type-singlemodeteaminfo) |
| `command_info_array` | [SingleModeTeamCommandInfo](#type-singlemodeteamcommandinfo)[] |
| `evaluation_info_array` | [TeamEvaluationInfo](#type-teamevaluationinfo)[] |
| `scenario_progress` | int |
| `opponent_info_array` | [SingleModeTeamOpponentList](#type-singlemodeteamopponentlist)[] |
| `frame_order_info_array` | [SingleModeTeamFrameOrder](#type-singlemodeteamframeorder)[] |
| `race_result_array` | [SingleModeTeamRaceResult](#type-singlemodeteamraceresult)[] |
| `final_win_type` | int |
| `event_effect_info` | [SingleModeTeamEventEffectInfo](#type-singlemodeteameventeffectinfo) |
| `not_up_team_parameter_info` | [NotUpTeamParameterInfo](#type-notupteamparameterinfo) |
| `team_race_history_array` | [SingleModeTeamRaceHistory](#type-singlemodeteamracehistory)[] |
| `command_result` | [SingleModeTeamCommandResult](#type-singlemodeteamcommandresult) |

<a id="type-singlemodeteameventeffectinfo"></a>
#### SingleModeTeamEventEffectInfo

| Field | Type |
|---|---|
| `is_summarize_team_member` | bool |
| `gain_speed` | int |
| `gain_stamina` | int |
| `gain_power` | int |
| `gain_guts` | int |
| `gain_wiz` | int |

<a id="type-singlemodeteamframeorder"></a>
#### SingleModeTeamFrameOrder

| Field | Type |
|---|---|
| `distance_type` | int |
| `race_order` | int |
| `random_info_array` | [SingleModeTeamRandomInfo](#type-singlemodeteamrandominfo)[] |

<a id="type-singlemodeteaminfo"></a>
#### SingleModeTeamInfo

| Field | Type |
|---|---|
| `team_name_id` | int |
| `speed_rank` | int |
| `stamina_rank` | int |
| `power_rank` | int |
| `guts_rank` | int |
| `wiz_rank` | int |
| `team_power` | int |
| `team_rank` | int |
| `team_rank_state` | int |
| `team_title` | int |
| `guide_partner_count` | int |
| `is_scout_enable` | bool |
| `team_chara_info_array` | [SingleModeTeamCharaInfo](#type-singlemodeteamcharainfo)[] |
| `team_data_array` | [SingleModeTeamData](#type-singlemodeteamdata)[] |
| `team_edit_flag` | int |

<a id="type-singlemodeteamopponentlist"></a>
#### SingleModeTeamOpponentList

| Field | Type |
|---|---|
| `team_race_set_id` | int |
| `team_power` | int |
| `team_rank` | int |
| `team_data_array` | [SingleModeNpcTeamData](#type-singlemodenpcteamdata)[] |
| `win_up_rank` | int |
| `lose_down_rank` | int |
| `draw_rank` | int |

<a id="type-singlemodeteamracechararesult"></a>
#### SingleModeTeamRaceCharaResult

| Field | Type |
|---|---|
| `frame_order` | int |
| `chara_id` | int |
| `npc_id` | int |
| `team_id` | int |
| `finish_order` | int |
| `finish_time` | int |
| `popularity` | int |

<a id="type-singlemodeteamracehistory"></a>
#### SingleModeTeamRaceHistory

| Field | Type |
|---|---|
| `race_num` | int |
| `turn` | int |
| `team_race_set_id` | int |
| `result_state` | int |

<a id="type-singlemodeteamraceresult"></a>
#### SingleModeTeamRaceResult

| Field | Type |
|---|---|
| `distance_type` | int |
| `race_instance_id` | int |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `random_seed` | int |
| `race_horse_data_array` | [RaceHorseData](#type-racehorsedata)[] |
| `race_scenario` | string |
| `round` | int |
| `win_type` | int |
| `chara_result_array` | [SingleModeTeamRaceCharaResult](#type-singlemodeteamracechararesult)[] |
| `continue_num` | int |

<a id="type-singlemodeteamrandominfo"></a>
#### SingleModeTeamRandomInfo

| Field | Type |
|---|---|
| `team_race_set_id` | int |
| `member_id` | int |
| `chara_id` | int |
| `npc_id` | int |
| `running_style` | int |
| `frame_order` | int |
| `motivation` | int |
| `stamina` | int |
| `speed` | int |
| `pow` | int |
| `guts` | int |
| `wiz` | int |

<a id="type-singlemodetwikleracenpcresult"></a>
#### SingleModeTwikleRaceNpcResult

| Field | Type |
|---|---|
| `turn` | int |
| `program_id` | int |
| `race_result_array` | [SingleModeNpcResult](#type-singlemodenpcresult)[] |

<a id="type-singlemodeuracommandinfo"></a>
#### SingleModeUraCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `versus_event_partner_id` | int |

<a id="type-singlemodeuradataset"></a>
#### SingleModeUraDataSet

| Field | Type |
|---|---|
| `command_info_array` | [SingleModeUraCommandInfo](#type-singlemodeuracommandinfo)[] |
| `evaluation_info_array` | [UraEvaluationInfo](#type-uraevaluationinfo)[] |
| `versus_level` | int |

<a id="type-singlemodevenusactivespiriteffect"></a>
#### SingleModeVenusActiveSpiritEffect

| Field | Type |
|---|---|
| `chara_id` | int |
| `effect_group_id` | int |
| `begin_turn` | int |
| `end_turn` | int |

<a id="type-singlemodevenuscharacommandinfo"></a>
#### SingleModeVenusCharaCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `spirit_id` | int |
| `is_boost` | int |

<a id="type-singlemodevenuscharainfo"></a>
#### SingleModeVenusCharaInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `venus_level` | int |

<a id="type-singlemodevenuscommandinfo"></a>
#### SingleModeVenusCommandInfo

| Field | Type |
|---|---|
| `command_type` | int |
| `command_id` | int |
| `params_inc_dec_info_array` | [SingleModeParamsIncDecInfo](#type-singlemodeparamsincdecinfo)[] |

<a id="type-singlemodevenusdataset"></a>
#### SingleModeVenusDataSet

| Field | Type |
|---|---|
| `race_start_info` | [SingleRaceStartInfo](#type-singleracestartinfo) |
| `race_scenario` | string |
| `command_info_array` | [SingleModeVenusCommandInfo](#type-singlemodevenuscommandinfo)[] |
| `evaluation_info_array` | [SingleModeVenusEvaluationInfo](#type-singlemodevenusevaluationinfo)[] |
| `spirit_info_array` | [SingleModeVenusSpiritInfo](#type-singlemodevenusspiritinfo)[] |
| `venus_spirit_active_effect_info_array` | [SingleModeVenusActiveSpiritEffect](#type-singlemodevenusactivespiriteffect)[] |
| `venus_chara_info_array` | [SingleModeVenusCharaInfo](#type-singlemodevenuscharainfo)[] |
| `venus_chara_command_info_array` | [SingleModeVenusCharaCommandInfo](#type-singlemodevenuscharacommandinfo)[] |
| `venus_race_condition` | [SingleModeRaceCondition](#type-singlemoderacecondition) |
| `venus_race_history_array` | [SingleModeVenusRaceHistory](#type-singlemodevenusracehistory)[] |
| `race_reward_info` | [CharaRaceReward](#type-chararacereward) |
| `live_item_id` | int |

<a id="type-singlemodevenusevaluationinfo"></a>
#### SingleModeVenusEvaluationInfo

| Field | Type |
|---|---|
| `target_id` | int |
| `chara_id` | int |
| `member_state` | int |

<a id="type-singlemodevenusracehistory"></a>
#### SingleModeVenusRaceHistory

| Field | Type |
|---|---|
| `race_num` | int |
| `turn` | int |
| `result_rank` | int |

<a id="type-singlemodevenusspirithistoryinfo"></a>
#### SingleModeVenusSpiritHistoryInfo

| Field | Type |
|---|---|
| `set_id` | int |
| `spirit_info_array` | [SingleModeVenusSpiritInfo](#type-singlemodevenusspiritinfo)[] |
| `venus_spirit_active_effect_info_array` | [SingleModeVenusActiveSpiritEffect](#type-singlemodevenusactivespiriteffect)[] |

<a id="type-singlemodevenusspiritinfo"></a>
#### SingleModeVenusSpiritInfo

| Field | Type |
|---|---|
| `spirit_num` | int |
| `spirit_id` | int |
| `effect_group_id` | int |

<a id="type-singleracehistory"></a>
#### SingleRaceHistory

| Field | Type |
|---|---|
| `turn` | int |
| `program_id` | int |
| `weather` | int |
| `ground_condition` | int |
| `running_style` | int |
| `result_rank` | int |
| `frame_order` | int |
| `npc_count` | int |

<a id="type-singleracestartinfo"></a>
#### SingleRaceStartInfo

| Field | Type |
|---|---|
| `program_id` | int |
| `random_seed` | int |
| `weather` | int |
| `ground_condition` | int |
| `race_horse_data` | [RaceHorseData](#type-racehorsedata)[] |
| `continue_num` | int |
| `is_force_running_style` | int |

<a id="type-skilldata"></a>
#### SkillData

| Field | Type |
|---|---|
| `skill_id` | int |
| `level` | int |

<a id="type-skilltips"></a>
#### SkillTips

| Field | Type |
|---|---|
| `group_id` | int |
| `rarity` | int |
| `level` | int |

<a id="type-storydirecteventreward"></a>
#### StoryDirectEventReward

| Field | Type |
|---|---|
| `id` | int |
| `gain_id` | int |
| `gain_type` | int |
| `gain_value_1` | int |
| `gain_value_2` | int |
| `gain_value_3` | int |
| `gain_value_4` | int |

<a id="type-storydirectskillset"></a>
#### StoryDirectSkillSet

| Field | Type |
|---|---|
| `id` | int |
| `skill_set` | int |
| `skill_id` | int |
| `add_skill_discount` | int |

<a id="type-storyeventaddpointsummary"></a>
#### StoryEventAddPointSummary

| Field | Type |
|---|---|
| `total` | int |
| `rank_score` | int |
| `nickname_bonus` | int |
| `card_bonus` | int |
| `support_card_bonus` | int |
| `win_num_bonus` | int |

<a id="type-storyeventbingodata"></a>
#### StoryEventBingoData

| Field | Type |
|---|---|
| `sheet_num` | int |
| `line_num` | int |

<a id="type-storyeventcharabonus"></a>
#### StoryEventCharaBonus

| Field | Type |
|---|---|
| `chara_id` | int |
| `card_type` | int |
| `card_id` | int |
| `bonus` | int |
| `is_rental` | bool |

<a id="type-storyeventroulettereward"></a>
#### StoryEventRouletteReward

| Field | Type |
|---|---|
| `reward_order` | int |
| `item_category` | int |
| `item_id` | int |
| `item_num` | int |

<a id="type-storyeventsinglemoderesult"></a>
#### StoryEventSingleModeResult

| Field | Type |
|---|---|
| `event_id` | int |
| `event_user_info` | [StoryEventUserInfo](#type-storyeventuserinfo) |
| `add_point_info` | [StoryEventAddPointSummary](#type-storyeventaddpointsummary) |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `reward_list` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `point_reward_id_list` | int[] |
| `get_all_point_reward` | bool |
| `training_reward_list` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `additional_training_reward_list` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `new_story_id_list` | int[] |
| `story_data_list` | [StoryEventStoryData](#type-storyeventstorydata)[] |
| `is_boost` | int |

<a id="type-storyeventstorydata"></a>
#### StoryEventStoryData

| Field | Type |
|---|---|
| `episode_id` | int |
| `state` | int |

<a id="type-storyeventuserinfo"></a>
#### StoryEventUserInfo

| Field | Type |
|---|---|
| `event_point` | int |
| `roulette_coin_num` | int |
| `roulette_sheet_num` | int |

<a id="type-storyextrastorydata"></a>
#### StoryExtraStoryData

| Field | Type |
|---|---|
| `episode_id` | int |
| `state` | int |

<a id="type-storyfavorite"></a>
#### StoryFavorite

| Field | Type |
|---|---|
| `episode_type` | int |
| `episode_id` | int |
| `is_mark` | int |

<a id="type-successionchara"></a>
#### SuccessionChara

| Field | Type |
|---|---|
| `position_id` | int |
| `card_id` | int |
| `rank` | int |
| `rarity` | int |
| `talent_level` | int |
| `factor_info_array` | [FactorInfo](#type-factorinfo)[] |
| `win_saddle_id_array` | int[] |
| `owner_viewer_id` | long |
| `user_info_summary` | [UserInfoAtFriend](#type-userinfoatfriend) |

<a id="type-successioneffectedfactor"></a>
#### SuccessionEffectedFactor

| Field | Type |
|---|---|
| `position` | int |
| `factor_info_array` | [FactorInfo](#type-factorinfo)[] |

<a id="type-successionhistory"></a>
#### SuccessionHistory

| Field | Type |
|---|---|
| `id` | int |
| `viewer_id` | long |
| `trained_chara_id` | int |
| `hisotry_type` | int |
| `succession_card_id` | int |
| `date` | int |
| `user_name` | string |
| `circle_name` | string |

<a id="type-supportcardrankinggroup"></a>
#### SupportCardRankingGroup

| Field | Type |
|---|---|
| `exam_index` | int |
| `items` | [SupportCardRankingItem](#type-supportcardrankingitem)[] |

<a id="type-supportcardrankingitem"></a>
#### SupportCardRankingItem

| Field | Type |
|---|---|
| `support_card_id` | int |
| `percentage` | int |
| `rank` | int |

<a id="type-talkgallerylist"></a>
#### TalkGalleryList

| Field | Type |
|---|---|
| `home_story_trigger_id` | int |
| `new_flag` | int |

<a id="type-teambuidingteaminfo"></a>
#### TeamBuidingTeamInfo

| Field | Type |
|---|---|
| `team_id` | int |
| `viewer_id` | long |
| `user_name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `team_name` | string |
| `team_score` | int |
| `entry_chara_array` | [TeamBuildingEntryChara](#type-teambuildingentrychara)[] |

<a id="type-teambuildingcollectionchara"></a>
#### TeamBuildingCollectionChara

| Field | Type |
|---|---|
| `chara_id` | int |
| `used_flag` | int |
| `new_flag` | int |

<a id="type-teambuildingentrychara"></a>
#### TeamBuildingEntryChara

| Field | Type |
|---|---|
| `member_id` | int |
| `trained_chara` | [TrainedChara](#type-trainedchara) |
| `mob_chara` | [EntryMobChara](#type-entrymobchara) |

<a id="type-teambuildingentrycharaspecial"></a>
#### TeamBuildingEntryCharaSpecial

| Field | Type |
|---|---|
| `member_id` | int |
| `mob_chara` | [EntryMobChara](#type-entrymobchara) |
| `special_buff` | [TeamBuildingSpecialBuff](#type-teambuildingspecialbuff) |

<a id="type-teambuildingexpectationscoutpointinfo"></a>
#### TeamBuildingExpectationScoutPointInfo

| Field | Type |
|---|---|
| `team_id` | int |
| `expectation_scout_point` | int |

<a id="type-teambuildingloadinfo"></a>
#### TeamBuildingLoadInfo

| Field | Type |
|---|---|
| `team_building_id` | int |
| `state` | int |
| `captain_id` | int |

<a id="type-teambuildingrunningstyleinfo"></a>
#### TeamBuildingRunningStyleInfo

| Field | Type |
|---|---|
| `member_id` | int |
| `running_style` | int |

<a id="type-teambuildingscoutpointinfo"></a>
#### TeamBuildingScoutPointInfo

| Field | Type |
|---|---|
| `item_id` | int |
| `basic_num` | int |
| `total_num` | int |
| `straight_win_count` | int |

<a id="type-teambuildingscoutrankuser"></a>
#### TeamBuildingScoutRankUser

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `rank` | int |
| `count` | int |
| `trained_chara` | [TrainedChara](#type-trainedchara) |

<a id="type-teambuildingspecialbuff"></a>
#### TeamBuildingSpecialBuff

| Field | Type |
|---|---|
| `speed` | int |
| `stamina` | int |
| `power` | int |
| `guts` | int |
| `wiz` | int |

<a id="type-teambuildingspecialraceinfo"></a>
#### TeamBuildingSpecialRaceInfo

| Field | Type |
|---|---|
| `state` | int |
| `watch_state` | int |
| `fixed_count` | int |

<a id="type-teambuildingteaminfospecial"></a>
#### TeamBuildingTeamInfoSpecial

| Field | Type |
|---|---|
| `team_id` | int |
| `viewer_id` | long |
| `user_name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `team_name` | string |
| `team_score` | int |
| `entry_chara_special_array` | [TeamBuildingEntryCharaSpecial](#type-teambuildingentrycharaspecial)[] |

<a id="type-teamevaluationinfo"></a>
#### TeamEvaluationInfo

| Field | Type |
|---|---|
| `target_id` | int |
| `chara_id` | int |
| `member_state` | int |
| `soul_threshold_id` | int |
| `soul_event_state` | int |

<a id="type-teamparametercode"></a>
#### TeamParameterCode

| Field | Type |
|---|---|
| `training_partner_id` | int |
| `code` | int |

<a id="type-teamskilltips"></a>
#### TeamSkillTips

| Field | Type |
|---|---|
| `training_partner_id` | int |
| `skill_tips_array` | [SkillTips](#type-skilltips)[] |
| `not_up_skill_tips_array` | [SkillTips](#type-skilltips)[] |
| `not_up_skill_id_array` | int[] |

<a id="type-teamstadiumaddfaninfo"></a>
#### TeamStadiumAddFanInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `add_fan` | int |

<a id="type-teamstadiumbonusdata"></a>
#### TeamStadiumBonusData

| Field | Type |
|---|---|
| `score_bonus_id` | int |
| `bonus_score` | int |

<a id="type-teamstadiumborderline"></a>
#### TeamStadiumBorderLine

| Field | Type |
|---|---|
| `promotion_rank` | int |
| `demotion_rank` | int |
| `keep_rank` | int |
| `promotion_point` | int |
| `demotion_point` | int |
| `keep_point` | int |

<a id="type-teamstadiumframeorder"></a>
#### TeamStadiumFrameOrder

| Field | Type |
|---|---|
| `distance_type` | int |
| `race_order` | int |
| `random_info_array` | [TeamStadiumRandomInfo](#type-teamstadiumrandominfo)[] |

<a id="type-teamstadiumopponent"></a>
#### TeamStadiumOpponent

| Field | Type |
|---|---|
| `strength` | int |
| `opponent_viewer_id` | long |
| `evaluation_point` | int |
| `user_info` | [UserInfoAtFriend](#type-userinfoatfriend) |
| `team_data_array` | [TeamStadiumTeamData](#type-teamstadiumteamdata)[] |
| `trained_chara_array` | [TrainedChara](#type-trainedchara)[] |
| `winning_reward_guarantee_status` | int |

<a id="type-teamstadiumracechararesult"></a>
#### TeamStadiumRaceCharaResult

| Field | Type |
|---|---|
| `viewer_id` | long |
| `frame_order` | int |
| `trained_chara_id` | int |
| `team_id` | int |
| `finish_order` | int |
| `finish_time` | int |
| `score_array` | [TeamStadiumResultScoreData](#type-teamstadiumresultscoredata)[] |

<a id="type-teamstadiumraceresult"></a>
#### TeamStadiumRaceResult

| Field | Type |
|---|---|
| `distance_type` | int |
| `race_scenario` | string |
| `round` | int |
| `team_score_array` | [TeamStadiumResultScoreData](#type-teamstadiumresultscoredata)[] |
| `team_total_score` | int |
| `win_type` | int |
| `current_consecutive_win_count` | int |
| `bonus_rate_by_next_win` | int |
| `chara_result_array` | [TeamStadiumRaceCharaResult](#type-teamstadiumracechararesult)[] |

<a id="type-teamstadiumracestartparams"></a>
#### TeamStadiumRaceStartParams

| Field | Type |
|---|---|
| `round` | int |
| `race_instance_id` | int |
| `season` | int |
| `weather` | int |
| `ground_condition` | int |
| `random_seed` | int |
| `race_horse_data_array` | [RaceHorseData](#type-racehorsedata)[] |
| `self_evaluate` | int |
| `opponent_evaluate` | int |

<a id="type-teamstadiumrandominfo"></a>
#### TeamStadiumRandomInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `member_id` | int |
| `trained_chara_id` | int |
| `running_style` | int |
| `frame_order` | int |
| `motivation` | int |

<a id="type-teamstadiumranking"></a>
#### TeamStadiumRanking

| Field | Type |
|---|---|
| `term_id` | int |
| `viewer_id` | long |
| `team_class` | int |
| `best_point` | int |
| `rank` | int |

<a id="type-teamstadiumresultbonusdata"></a>
#### TeamStadiumResultBonusData

| Field | Type |
|---|---|
| `score_bonus_id` | int |
| `bonus_score` | int |
| `condition_type` | int |
| `condition_value_1` | int |
| `condition_value_2` | int |
| `score_rate` | int |

<a id="type-teamstadiumresulthorsescore"></a>
#### TeamStadiumResultHorseScore

| Field | Type |
|---|---|
| `score_array` | [TeamStadiumScoreData](#type-teamstadiumscoredata)[] |

<a id="type-teamstadiumresultscoredata"></a>
#### TeamStadiumResultScoreData

| Field | Type |
|---|---|
| `raw_score_id` | int |
| `num` | int |
| `score` | int |
| `bonus_array` | [TeamStadiumResultBonusData](#type-teamstadiumresultbonusdata)[] |

<a id="type-teamstadiumresultteam"></a>
#### TeamStadiumResultTeam

| Field | Type |
|---|---|
| `team_id` | int |
| `team_score_array` | [TeamStadiumScoreData](#type-teamstadiumscoredata)[] |
| `team_total_score` | int |

<a id="type-teamstadiumscoredata"></a>
#### TeamStadiumScoreData

| Field | Type |
|---|---|
| `raw_score_id` | int |
| `num` | int |
| `score` | int |
| `bonus_array` | [TeamStadiumBonusData](#type-teamstadiumbonusdata)[] |

<a id="type-teamstadiumteamdata"></a>
#### TeamStadiumTeamData

| Field | Type |
|---|---|
| `distance_type` | int |
| `member_id` | int |
| `trained_chara_id` | int |
| `running_style` | int |

<a id="type-teamstadiumteamdataatfriend"></a>
#### TeamStadiumTeamDataAtFriend

| Field | Type |
|---|---|
| `distance_type` | int |
| `member_id` | int |
| `running_style` | int |
| `trained_chara` | [TrainedChara](#type-trainedchara) |

<a id="type-teamstadiumtotalscoreinfo"></a>
#### TeamStadiumTotalScoreInfo

| Field | Type |
|---|---|
| `final_total_score` | int |
| `all_race_result_score_bonus` | int |

<a id="type-teamstadiumuser"></a>
#### TeamStadiumUser

| Field | Type |
|---|---|
| `team_class` | int |
| `best_team_class` | int |
| `best_point` | int |

<a id="type-teamstadiumwinningrewardcontent"></a>
#### TeamStadiumWinningRewardContent

| Field | Type |
|---|---|
| `round` | int |
| `item_category` | int |
| `item_id` | int |
| `item_num` | int |
| `box_color_type` | int |

<a id="type-teamstadiumwinningrewardinfo"></a>
#### TeamStadiumWinningRewardInfo

| Field | Type |
|---|---|
| `round` | int |
| `box_color_type` | int |

<a id="type-tpinfo"></a>
#### TpInfo

| Field | Type |
|---|---|
| `current_tp` | int |
| `max_tp` | int |
| `max_recovery_time` | int |

<a id="type-trainedchara"></a>
#### TrainedChara

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `owner_viewer_id` | long |
| `owner_trained_chara_id` | int |
| `use_type` | int |
| `card_id` | int |
| `name` | string |
| `stamina` | int |
| `speed` | int |
| `power` | int |
| `guts` | int |
| `wiz` | int |
| `fans` | int |
| `rank_score` | int |
| `rank` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `succession_num` | int |
| `is_locked` | int |
| `rarity` | int |
| `talent_level` | int |
| `chara_grade` | int |
| `running_style` | int |
| `nickname_id` | int |
| `wins` | int |
| `skill_array` | [SkillData](#type-skilldata)[] |
| `support_card_list` | [TrainedCharaSupportCardList](#type-trainedcharasupportcardlist)[] |
| `is_saved` | int |
| `race_result_list` | [TrainedCharaRaceResult](#type-trainedchararaceresult)[] |
| `win_saddle_id_array` | int[] |
| `nickname_id_array` | int[] |
| `factor_info_array` | [FactorInfo](#type-factorinfo)[] |
| `factor_extend_array` | [FactorExtend](#type-factorextend)[] |
| `succession_chara_array` | [SuccessionChara](#type-successionchara)[] |
| `scenario_id` | int |
| `create_time` | string |

<a id="type-trainedcharafavorite"></a>
#### TrainedCharaFavorite

| Field | Type |
|---|---|
| `trained_chara_id` | int |
| `icon_type` | int |
| `memo` | string |

<a id="type-trainedchararaceresult"></a>
#### TrainedCharaRaceResult

| Field | Type |
|---|---|
| `turn` | int |
| `program_id` | int |
| `weather` | int |
| `ground_condition` | int |
| `running_style` | int |
| `result_rank` | int |

<a id="type-trainedcharasupportcardlist"></a>
#### TrainedCharaSupportCardList

| Field | Type |
|---|---|
| `position` | int |
| `support_card_id` | int |
| `exp` | int |
| `limit_break_count` | int |

<a id="type-trainingchallengeexaminfo"></a>
#### TrainingChallengeExamInfo

| Field | Type |
|---|---|
| `exam_id` | int |
| `high_score_value` | int |
| `result_type` | int |
| `high_score_trained_chara` | [TrainedChara](#type-trainedchara) |
| `is_challenged` | bool |

<a id="type-trainingchallengerankuser"></a>
#### TrainingChallengeRankUser

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `score` | int |
| `exam_id` | int |
| `trained_chara` | [TrainedChara](#type-trainedchara) |

<a id="type-trainingchallengeresult"></a>
#### TrainingChallengeResult

| Field | Type |
|---|---|
| `event_id` | int |
| `exam_id` | int |
| `next_exam_id` | int |
| `score_summary` | [TrainingChallengeScoreSummary](#type-trainingchallengescoresummary) |
| `reward_summary_info` | [RewardSummaryInfo](#type-rewardsummaryinfo) |
| `reward_list` | [DisplayRewardInfo](#type-displayrewardinfo)[] |
| `event_user_info` | [TrainingChallengeUserInfo](#type-trainingchallengeuserinfo) |
| `training_challenge_mode` | int |
| `exam_infos` | [TrainingChallengeExamInfo](#type-trainingchallengeexaminfo)[] |

<a id="type-trainingchallengescoresummary"></a>
#### TrainingChallengeScoreSummary

| Field | Type |
|---|---|
| `total` | int |
| `rank_score` | int |
| `base_rank_score` | int |
| `score_ids` | int[] |
| `add_event_coin` | int |

<a id="type-trainingchallengeuserinfo"></a>
#### TrainingChallengeUserInfo

| Field | Type |
|---|---|
| `event_coin` | int |
| `select_exam_id` | int |

<a id="type-traininglevelinfo"></a>
#### TrainingLevelInfo

| Field | Type |
|---|---|
| `command_id` | int |
| `level` | int |

<a id="type-transfereventdetailinfo"></a>
#### TransferEventDetailInfo

| Field | Type |
|---|---|
| `transfer_detail_id` | int |
| `exists_trained_chara` | bool |
| `remaining_num` | int |

<a id="type-transfereventinfo"></a>
#### TransferEventInfo

| Field | Type |
|---|---|
| `transfer_event_id` | int |
| `transfer_event_home_detail_info` | [TransferEventDetailInfo](#type-transfereventdetailinfo)[] |

<a id="type-transfereventrewardinfo"></a>
#### TransferEventRewardInfo

| Field | Type |
|---|---|
| `reward_array` | [ResponseItem](#type-responseitem)[] |
| `trained_chara_id` | int |

<a id="type-trophycharainfo"></a>
#### TrophyCharaInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `win_count` | int |

<a id="type-trophynuminfo"></a>
#### TrophyNumInfo

| Field | Type |
|---|---|
| `grade_1` | int |
| `grade_2` | int |
| `grade_3` | int |
| `grade_ex` | int |

<a id="type-tutorialguidedatafordisplay"></a>
#### TutorialGuideDataForDisplay

| Field | Type |
|---|---|
| `id` | int |

<a id="type-tutorialguidedataforregist"></a>
#### TutorialGuideDataForRegist

| Field | Type |
|---|---|
| `id` | int |

<a id="type-uraevaluationinfo"></a>
#### UraEvaluationInfo

| Field | Type |
|---|---|
| `target_id` | int |
| `chara_id` | int |
| `member_state` | int |

<a id="type-usercampaigninfo"></a>
#### UserCampaignInfo

| Field | Type |
|---|---|
| `campaign_id` | int |
| `end_time` | string |

<a id="type-usercard"></a>
#### UserCard

| Field | Type |
|---|---|
| `card_id` | int |
| `rarity` | int |
| `talent_level` | int |
| `skill_data_array` | [SkillData](#type-skilldata)[] |
| `create_time` | string |

<a id="type-usercarddress"></a>
#### UserCardDress

| Field | Type |
|---|---|
| `card_id` | int |
| `cloth_id` | int |

<a id="type-userchara"></a>
#### UserChara

| Field | Type |
|---|---|
| `chara_id` | int |
| `training_num` | int |
| `love_point` | int |
| `love_point_pool` | int |
| `fan` | ulong |

<a id="type-usercloth"></a>
#### UserCloth

| Field | Type |
|---|---|
| `cloth_id` | int |

<a id="type-userfriend"></a>
#### UserFriend

| Field | Type |
|---|---|
| `friend_viewer_id` | long |
| `state` | int |
| `follow_time` | string |
| `follower_time` | string |

<a id="type-userinfo"></a>
#### UserInfo

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `sex` | int |
| `tutorial_step` | int |
| `leader_chara_id` | int |
| `support_card_id` | int |
| `partner_chara_id` | int |
| `bonus_follow_num` | int |
| `comment` | string |
| `birth_day` | string |
| `fan` | ulong |
| `directory_level` | int |
| `rank_score` | int |
| `best_team_evaluation_point` | int |
| `create_time` | string |
| `update_time` | string |
| `leader_chara_dress_id` | int |

<a id="type-userinfoatfollower"></a>
#### UserInfoAtFollower

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `last_login_time` | string |
| `support_card_id` | int |
| `user_support_card` | [UserSupportCardAtFriend](#type-usersupportcardatfriend) |

<a id="type-userinfoatfriend"></a>
#### UserInfoAtFriend

| Field | Type |
|---|---|
| `viewer_id` | long |
| `name` | string |
| `honor_data` | [HonorData](#type-honordata) |
| `last_login_time` | string |
| `leader_chara_id` | int |
| `support_card_id` | int |
| `comment` | string |
| `fan` | ulong |
| `directory_level` | int |
| `rank_score` | int |
| `team_stadium_win_count` | int |
| `single_mode_play_count` | int |
| `team_evaluation_point` | int |
| `best_team_evaluation_point` | int |
| `friend_state` | int |
| `circle_info` | [CircleInfoAtFriend](#type-circleinfoatfriend) |
| `circle_user` | [CircleUser](#type-circleuser) |
| `user_support_card` | [UserSupportCardAtFriend](#type-usersupportcardatfriend) |
| `leader_chara_dress_id` | int |
| `user_trained_chara` | [UserTrainedCharaAtFriend](#type-usertrainedcharaatfriend) |
| `state` | int |

<a id="type-useritem"></a>
#### UserItem

| Field | Type |
|---|---|
| `item_id` | int |
| `number` | int |

<a id="type-usermission"></a>
#### UserMission

| Field | Type |
|---|---|
| `mission_id` | int |
| `mission_status` | int |
| `exec_count` | int |

<a id="type-usermusic"></a>
#### UserMusic

| Field | Type |
|---|---|
| `music_id` | int |
| `acquisition_time` | string |

<a id="type-usernoticedata"></a>
#### UserNoticeData

| Field | Type |
|---|---|
| `event_id` | int |
| `notice_title` | string |
| `notice_text` | string |
| `button_type` | int |

<a id="type-userprofilecardinfo"></a>
#### UserProfileCardInfo

| Field | Type |
|---|---|
| `chara_id` | int |
| `dress_id` | int |
| `bg_id` | int |
| `card_bg_id` | int |
| `theme_id` | int |
| `support_card_id` | int |
| `illustration_type` | int |
| `comment` | string |
| `is_trainer_info_aligned_right` | bool |
| `show_back_side` | bool |
| `show_trainer_id` | bool |
| `image_offset_x` | int |
| `image_offset_y` | int |
| `image_rotate` | int |
| `image_scale` | int |
| `image_file_hash` | string |

<a id="type-usersupportcard"></a>
#### UserSupportCard

| Field | Type |
|---|---|
| `viewer_id` | long |
| `support_card_id` | int |
| `exp` | int |
| `limit_break_count` | int |
| `favorite_flag` | int |
| `stock` | int |
| `possess_time` | string |

<a id="type-usersupportcardatfriend"></a>
#### UserSupportCardAtFriend

| Field | Type |
|---|---|
| `support_card_id` | int |
| `exp` | int |
| `limit_break_count` | int |

<a id="type-usersupportcarddeck"></a>
#### UserSupportCardDeck

| Field | Type |
|---|---|
| `deck_id` | int |
| `name` | string |
| `support_card_id_array` | int[] |

<a id="type-usersupportcarddeckforupdateparty"></a>
#### UserSupportCardDeckForUpdateParty

| Field | Type |
|---|---|
| `deck_id` | int |
| `support_card_id_array` | int[] |
| `auto_deck_flag` | int |

<a id="type-usertrainedcharaatfriend"></a>
#### UserTrainedCharaAtFriend

| Field | Type |
|---|---|
| `viewer_id` | long |
| `trained_chara_id` | int |
| `card_id` | int |
| `rank_score` | int |
| `rank` | int |
| `proper_distance_short` | int |
| `proper_distance_mile` | int |
| `proper_distance_middle` | int |
| `proper_distance_long` | int |
| `proper_running_style_nige` | int |
| `proper_running_style_senko` | int |
| `proper_running_style_sashi` | int |
| `proper_running_style_oikomi` | int |
| `proper_ground_turf` | int |
| `proper_ground_dirt` | int |
| `rarity` | int |
| `talent_level` | int |
| `register_time` | string |
| `factor_info_array` | [FactorInfo](#type-factorinfo)[] |
| `factor_extend_array` | [FactorExtend](#type-factorextend)[] |
| `skill_count` | int |

<a id="type-usertrophyinfo"></a>
#### UserTrophyInfo

| Field | Type |
|---|---|
| `trophy_id` | int |
| `create_time` | string |
| `race_instance_info_array` | [RaceInstanceInfo](#type-raceinstanceinfo)[] |

<a id="type-valentinereceiveddata"></a>
#### ValentineReceivedData

| Field | Type |
|---|---|
| `last_received_time` | string |
| `card_id_list` | int[] |

<a id="type-valentinespecialreceiveddata"></a>
#### ValentineSpecialReceivedData

| Field | Type |
|---|---|
| `last_received_time` | string |
| `card_id_list` | int[] |
| `special_item_first_receive_flag` | int |

