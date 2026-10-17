"""Builds assets/ura_career_data.json: everything the URA career (scenario 1) needs from master.mdb.

Contents:
  programs        single_mode_program joined with race / race_instance / race_course_set
  fan_sets        fan_set_id -> fan_count by finishing order (index 0 = 1st)
  reward_sets     reward_set_id -> race reward rows
  npc_groups      npc_group_id -> single_mode_npc rows (the field the player races against)
  routes          chara_id -> race_set_id (career goals)
  route_ids       chara_id -> single_mode_route.id (chara_info.route_id)
  route_races     race_set_id -> goal races valid for URA, ordered by turn
  turns           turn -> year / month / half
  training_effects  command_id -> sub_id -> [{target_type, value}] for a successful command
  ranks           single_mode_rank score ranges (rank id = list index + 1)
  chara_grades    single_mode_chara_grade
  skill_need_points  skill_id -> skill point cost
"""
import json
import os
import sqlite3
import sys
from collections import defaultdict

appdata_path = os.getenv('APPDATA')
if not appdata_path:
    print("APPDATA environment variable not found.", file=sys.stderr)
    sys.exit(1)

appdata_base_path = os.path.dirname(appdata_path)
MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "../../assets/ura_career_data.json"))

URA_SCENARIO_ID = 1
URA_TURN_SET_ID = 1


def rows(conn, query, args=()):
    return [dict(r) for r in conn.execute(query, args)]


def skill_sets(conn):
    used = [r['skill_set'] for r in rows(conn, "SELECT DISTINCT skill_set FROM card_rarity_data")]
    out = {}
    for sid in used:
        r = rows(conn, "SELECT * FROM skill_set WHERE id = ?", (sid,))
        if r:
            out[sid] = [{'skill_id': r[0][f'skill_id{i}'], 'level': r[0][f'skill_level{i}']}
                        for i in range(1, 21) if r[0][f'skill_id{i}']]
    return out


def hint_gains(conn):
    out = defaultdict(list)
    for r in rows(conn, "SELECT support_card_id, hint_gain_type, hint_value_1, hint_value_2 FROM single_mode_hint_gain ORDER BY id"):
        out[r['support_card_id']].append([r['hint_gain_type'], r['hint_value_1'], r['hint_value_2']])
    return out


def support_card_levels(conn):
    """rarity -> total exp needed for each level (index = level - 1)"""
    out = defaultdict(list)
    for r in rows(conn, "SELECT rarity, level, total_exp FROM support_card_level ORDER BY rarity, level"):
        out[r['rarity']].append(r['total_exp'])
    return out


def stories(conn):
    """Career story events (single_mode_story_data), grouped by what triggers them.

    support_card_chains   support card id -> its chain stories in order (show_progress_1 = step)
    support_chara_chains  support character -> chain steps shared by its cards (friend cards); a
                          card's own final step is under support_card_chains
    support_chara_random  support character -> random events shared by all its cards
    trainee_intro         trainee character -> the "Introducing ..." story played on turn 1
    trainee_random        trainee character -> random events (category 2, not race/ending/turn-bound)
    trainee_card_random   trainee card id -> events specific to that card (category 3)
    """
    out = {k: defaultdict(list) for k in ('support_card_chains', 'support_chara_chains', 'support_chara_random',
                                          'trainee_random', 'trainee_card_random')}
    out['trainee_intro'] = {}
    card_ids = {r['id'] for r in rows(conn, "SELECT id FROM support_card_data")}
    seen = set()
    for r in rows(conn, "SELECT * FROM single_mode_story_data ORDER BY show_progress_1, story_id"):
        sid = r['story_id']
        if sid in seen:
            continue
        seen.add(sid)
        if r['support_card_id']:
            out['support_card_chains'][r['support_card_id']].append(sid)
        elif r['support_chara_id']:
            owner_card = sid // 1000 - 800000   # 8<support card id><nnn>: a card-specific step
            if r['show_progress_1'] and owner_card in card_ids:
                out['support_card_chains'][owner_card].append(sid)
            else:
                key = 'support_chara_chains' if r['show_progress_1'] else 'support_chara_random'
                out[key][r['support_chara_id']].append(sid)
        elif r['card_id'] and r['event_category'] == 3:
            out['trainee_card_random'][r['card_id']].append(sid)
        elif r['card_chara_id'] and r['event_category'] == 2 and not r['race_event_flag'] and not r['ending_type']:
            n = sid % 1000
            if n == 100:
                out['trainee_intro'][r['card_chara_id']] = sid
            elif 101 <= n < 200:
                out['trainee_random'][r['card_chara_id']].append(sid)
    return out


def succession_factors(conn):
    """End-of-career sparks rolled from the trained horse, keyed the way the career engine looks them up.

    skills:   skill group_id -> [factor_group_id, skill id the factor hints] (white sparks; the hinted
              skill is the base version, so a gold or double-circle skill of the group maps to it too)
    races:    race id -> factor_group_id (race sparks; succession_factor has no race id, so match on name)
    scenario: scenario id -> factor_group_id (factor_group_id 30000 + scenario id)
    factor_id is factor_group_id * 100 + stars for every type.
    """
    skill_group = {r['id']: r['group_id'] for r in rows(conn, "SELECT id, group_id FROM skill_data")}
    skills = {}
    for r in rows(conn, """SELECT DISTINCT f.factor_group_id, e.value_1 AS skill_id FROM succession_factor f
                           JOIN succession_factor_effect e ON e.factor_group_id = f.factor_group_id
                           WHERE f.factor_type = 4 AND e.target_type = 41 ORDER BY f.factor_group_id"""):
        g = skill_group.get(r['skill_id'])
        if g is not None and g not in skills:
            skills[g] = [r['factor_group_id'], r['skill_id']]
    # some factor names abbreviate the race name ("February S.", "J.D. Derby")
    abbreviations = {'S.': 'Stakes', 'C.': 'Cup', 'Ch.': 'Championship', 'J.D.': 'Japan Dirt',
                     'L.': 'Ladies’', 'M.C.': 'Mile Championship', 'J.F.': 'Juvenile Fillies',
                     'F.S.': 'Futurity Stakes'}
    aliases = {'Japanese Derby': 'Tokyo Yushun (Japanese Derby)'}
    race_ids_by_name = defaultdict(list)
    for r in rows(conn, "SELECT [index] AS race_id, text FROM text_data WHERE category = 32"):
        race_ids_by_name[r['text']].append(r['race_id'])
    races = {}
    for r in rows(conn, """SELECT f.factor_group_id, t.text FROM succession_factor f
                           JOIN text_data t ON t.category = 147 AND t.[index] = f.factor_id
                           WHERE f.factor_type = 5 AND f.rarity = 1"""):
        name = ' '.join(abbreviations.get(w, w) for w in r['text'].split(' '))
        for race_id in race_ids_by_name[name] + race_ids_by_name[aliases.get(name, '')]:
            races[race_id] = r['factor_group_id']
    scenario = {r['factor_group_id'] - 30000: r['factor_group_id'] for r in rows(
        conn, "SELECT DISTINCT factor_group_id FROM succession_factor WHERE factor_type = 6")}
    return {'skills': skills, 'races': races, 'scenario': scenario}


def build(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row

    programs = rows(conn, """
        SELECT p.id, p.race_instance_id, p.month, p.half, p.race_permission, p.need_fan_count,
               p.fan_set_id, p.reward_set_id, p.filly_only_flag, p.grade_rate_id,
               ri.race_id, ri.npc_group_id, r.grade, r.entry_num,
               c.id AS course_set_id, c.race_track_id, c.distance, c.ground,
               c.finish_time_min, c.finish_time_max
        FROM single_mode_program p
        JOIN race_instance ri ON ri.id = p.race_instance_id
        JOIN race r ON r.id = ri.race_id
        JOIN race_course_set c ON c.id = r.course_set
        ORDER BY p.id
    """)

    # URA Finals (route goals 10001-10003) are not single_mode_program rows; the route race's
    # condition_id is the race id itself. Expose them as extra programs keyed by that id, using
    # the race's first instance and the fan/reward sets of a regular G1 program.
    g1 = next(p for p in programs if p['grade'] == 100)
    finals = rows(conn, """
        SELECT r.id, MIN(ri.id) AS race_instance_id, 0 AS month, 0 AS half, 4 AS race_permission,
               0 AS need_fan_count, ? AS fan_set_id, ? AS reward_set_id, 0 AS filly_only_flag,
               0 AS grade_rate_id, r.id AS race_id, 0 AS npc_group_id, r.grade, r.entry_num,
               c.id AS course_set_id, c.race_track_id, c.distance, c.ground,
               c.finish_time_min, c.finish_time_max
        FROM race r
        JOIN race_instance ri ON ri.race_id = r.id
        JOIN race_course_set c ON c.id = r.course_set
        WHERE r.id IN (SELECT DISTINCT condition_id FROM single_mode_route_race WHERE target_type = 3)
        GROUP BY r.id
    """, (g1['fan_set_id'], g1['reward_set_id']))
    for f in finals:
        f['is_ura_final'] = 1
    programs += finals

    # Every URA Finals course (race group 10). The client-facing stage is one of the three
    # route goals above; the race actually run is picked from this pool by the horse's best
    # distance/ground aptitude.
    ura_final_races = rows(conn, """
        SELECT r.id AS race_id, MIN(ri.id) AS race_instance_id, r.entry_num, c.id AS course_set_id,
               c.race_track_id, c.distance, c.ground, c.finish_time_min, c.finish_time_max
        FROM race r
        JOIN race_instance ri ON ri.race_id = r.id
        JOIN race_course_set c ON c.id = r.course_set
        WHERE r.`group` = 10 AND r.id < 10050
        GROUP BY r.id ORDER BY r.id
    """)

    fan_sets = defaultdict(list)
    for r in rows(conn, "SELECT fan_set_id, `order`, fan_count FROM single_mode_fan_count ORDER BY fan_set_id, `order`"):
        fan_sets[r['fan_set_id']].append(r['fan_count'])

    reward_sets = defaultdict(list)
    for r in rows(conn, "SELECT * FROM single_mode_reward_set ORDER BY reward_set_id, id"):
        reward_sets[r['reward_set_id']].append({k: r[k] for k in (
            'order_min', 'order_max', 'reward_type', 'bonus', 'odds', 'item_category', 'item_id', 'item_num')})

    # The client builds each race entrant from its card, so rivals need a real card: NPCs whose
    # character has no card (and generic mob runners) are left out of the pool.
    chara_cards = {}
    for r in rows(conn, "SELECT id, chara_id FROM card_data ORDER BY id"):
        chara_cards.setdefault(r['chara_id'], r['id'])
    npc_groups = defaultdict(list)
    for r in rows(conn, "SELECT * FROM single_mode_npc ORDER BY npc_group_id, id"):
        if r['mob_id'] or r['chara_id'] not in chara_cards:
            continue
        r['card_id'] = chara_cards[r['chara_id']]
        npc_groups[r['npc_group_id']].append(r)

    route_rows = rows(
        conn, "SELECT id, chara_id, race_set_id FROM single_mode_route WHERE scenario_id IN (0, ?) ORDER BY scenario_id",
        (URA_SCENARIO_ID,))
    routes = {r['chara_id']: r['race_set_id'] for r in route_rows}
    # chara_info.route_id is single_mode_route.id (the client looks the goals up through it)
    route_ids = {r['chara_id']: r['id'] for r in route_rows}

    ura_groups = [r['group_id'] for r in rows(
        conn, "SELECT group_id FROM single_mode_scenario_group WHERE scenario_id = ?", (URA_SCENARIO_ID,))]
    route_races = defaultdict(list)
    q = "SELECT * FROM single_mode_route_race WHERE scenario_group_id IN (%s) ORDER BY race_set_id, turn, sort_id" % \
        ','.join('?' * len(ura_groups))
    for r in rows(conn, q, ura_groups):
        route_races[r['race_set_id']].append({k: r[k] for k in (
            'id', 'target_type', 'sort_id', 'turn', 'race_type', 'condition_type', 'condition_id',
            'condition_value_1', 'condition_value_2', 'determine_race')})

    turns = {r['turn']: {k: r[k] for k in ('year', 'month', 'half', 'unique_command', 'training_set_id', 'outing_set_id', 'rest_type', 'health_room_type', 'race_entry_type')} for r in rows(
        conn, "SELECT * FROM single_mode_turn WHERE turn_set_id = ? ORDER BY turn",
        (URA_TURN_SET_ID,))}

    training_effects = defaultdict(lambda: defaultdict(list))
    for r in rows(conn, """SELECT command_id, sub_id, target_type, effect_value FROM single_mode_training_effect
                           WHERE scenario_id = ? AND result_state = 2 ORDER BY command_id, sub_id, target_type""",
                  (URA_SCENARIO_ID,)):
        training_effects[r['command_id']][r['sub_id']].append({'target_type': r['target_type'], 'value': r['effect_value']})

    data = {
        'scenario_id': URA_SCENARIO_ID,
        'programs': programs,
        'ura_final_races': ura_final_races,
        'fan_sets': fan_sets,
        'reward_sets': reward_sets,
        'npc_groups': npc_groups,
        'routes': routes,
        'route_ids': route_ids,
        'route_races': route_races,
        'turns': turns,
        'training_effects': training_effects,
        'ranks': rows(conn, "SELECT id, min_value, max_value FROM single_mode_rank ORDER BY id"),
        'chara_grades': rows(conn, "SELECT * FROM single_mode_chara_grade ORDER BY id"),
        # cards that have a unique (red) succession factor: factor_id = card_id * 100 + stars
        'unique_factor_cards': [r['factor_group_id'] for r in rows(
            conn, "SELECT DISTINCT factor_group_id FROM succession_factor WHERE factor_type = 3")],
        'skill_need_points': {r['id']: r['need_skill_point'] for r in rows(
            conn, "SELECT id, need_skill_point FROM single_mode_skill_need_point")},
        # skills a card starts a career with (its unique skill), keyed by card_rarity_data.skill_set
        'skill_sets': skill_sets(conn),
        # career-start inheritance: factor_type 1 = blue (value_1 stars, value_2 0 stat / 1 cap),
        # 2 = pink (value_1..value_2 total stars -> aptitude levels), 3 = unique skill hint
        # support card unique effects, active from level `lv`: [[effect type, value], ...]
        'support_unique_effects': {r['id']: {'lv': r['lv'], 'effects': [[r[f'type_{i}'], r[f'value_{i}']] for i in (0, 1) if r[f'type_{i}']]}
                                   for r in rows(conn, "SELECT * FROM support_card_unique_effect")},
        # training hints per support card: hint_gain_type 0 = skill hint (value_1 skill id, value_2 level),
        # 1 = stat hint (value_1 target type, value_2 amount)
        'hint_gains': hint_gains(conn),
        # skill id -> [group_id, rarity] (chara_info.skill_tips_array is keyed by group and rarity)
        'skill_groups': {r['id']: [r['group_id'], r['rarity']] for r in rows(conn, "SELECT id, group_id, rarity FROM skill_data")},
        'support_card_levels': support_card_levels(conn),
        'stories': stories(conn),
        'succession_factors': succession_factors(conn),
        # win saddles: [saddle id, [race_instance_id, ...]], earned by winning every listed race
        'win_saddles': [[r['id'], [r[f'race_instance_id_{i}'] for i in range(1, 9) if r[f'race_instance_id_{i}']]]
                        for r in rows(conn, "SELECT * FROM single_mode_wins_saddle ORDER BY id")],
        'succession_initial_factors': rows(
            conn, "SELECT factor_type, value_1, value_2, add_point FROM succession_initial_factor ORDER BY id"),
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(f"Generated {output_path}: {len(programs)} programs, {len(npc_groups)} npc groups, "
          f"{len(routes)} routes, {len(turns)} turns.")


if __name__ == "__main__":
    build(MDB_FILE, OUTPUT_FILE)
