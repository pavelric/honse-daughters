"""Builds assets/ura_career_data.json: everything the URA career (scenario 1) needs from master.mdb.

Contents:
  programs        single_mode_program joined with race / race_instance / race_course_set
  fan_sets        fan_set_id -> fan_count by finishing order (index 0 = 1st)
  reward_sets     reward_set_id -> race reward rows
  npc_groups      npc_group_id -> single_mode_npc rows (the field the player races against)
  routes          chara_id -> race_set_id (career goals)
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

    npc_groups = defaultdict(list)
    for r in rows(conn, "SELECT * FROM single_mode_npc ORDER BY npc_group_id, id"):
        npc_groups[r['npc_group_id']].append(r)

    routes = {r['chara_id']: r['race_set_id'] for r in rows(
        conn, "SELECT chara_id, race_set_id FROM single_mode_route WHERE scenario_id IN (0, ?) ORDER BY scenario_id",
        (URA_SCENARIO_ID,))}

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
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(f"Generated {output_path}: {len(programs)} programs, {len(npc_groups)} npc groups, "
          f"{len(routes)} routes, {len(turns)} turns.")


if __name__ == "__main__":
    build(MDB_FILE, OUTPUT_FILE)
