"""Builds assets/card_progress_data.json: master data for levelling support cards and trainee cards.

Contents:
  support_card_rarity   support_card_id -> rarity (1 R, 2 SR, 3 SSR)
  support_card_exp      rarity -> total_exp needed for each level (index 0 = level 1)
  support_card_limit    rarity -> max level at limit break 0..4
  limit_break_items     rarity -> item_id of the uncap crystal that substitutes one copy
  cards                 card_id -> {default_rarity, talent_group_id, piece_id}
  talent_upgrade        talent_group_id -> talent_level -> [{item_category, item_id, item_num}]
  need_piece_num        rarity -> pieces needed to unlock a card of that default rarity
  hint_upgrade          skill rarity -> hint level -> {items: [...], money}
  skill_rarity          skill_id -> rarity
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
OUTPUT_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "../../assets/card_progress_data.json"))


def build(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    q = lambda sql: [dict(r) for r in conn.execute(sql)]

    support_card_exp = defaultdict(list)
    for r in q("SELECT rarity, level, total_exp FROM support_card_level ORDER BY rarity, level"):
        support_card_exp[r['rarity']].append(r['total_exp'])

    talent_upgrade = defaultdict(dict)
    for r in q("SELECT * FROM card_talent_upgrade ORDER BY talent_group_id, talent_level"):
        costs = []
        for i in range(1, 7):
            if r[f'item_id_{i}'] and r[f'item_num_{i}']:
                costs.append({'item_category': r[f'item_category_{i}'], 'item_id': r[f'item_id_{i}'], 'item_num': r[f'item_num_{i}']})
        talent_upgrade[r['talent_group_id']][r['talent_level']] = costs

    hint_upgrade = defaultdict(dict)
    for r in q("SELECT * FROM card_talent_hint_upgrade ORDER BY rarity, talent_level"):
        items = [{'item_category': r[f'item_category_{i}'], 'item_id': r[f'item_id_{i}'], 'item_num': r[f'item_num_{i}']}
                 for i in (1, 2) if r[f'item_id_{i}'] and r[f'item_num_{i}']]
        hint_upgrade[r['rarity']][r['talent_level']] = {'items': items, 'money': r['money_num']}

    data = {
        'support_card_rarity': {r['id']: r['rarity'] for r in q("SELECT id, rarity FROM support_card_data")},
        'support_card_exp': support_card_exp,
        'support_card_limit': {r['rarity']: [r[f'limit_{i}'] for i in range(5)] for r in q("SELECT * FROM support_card_limit")},
        'limit_break_items': {r['rarity']: r['item_id'] for r in q("SELECT rarity, item_id FROM support_card_limit_break")},
        'cards': {r['id']: {'default_rarity': r['default_rarity'], 'talent_group_id': r['talent_group_id'], 'piece_id': r['get_piece_id']}
                  for r in q("SELECT id, default_rarity, talent_group_id, get_piece_id FROM card_data")},
        'talent_upgrade': talent_upgrade,
        'hint_upgrade': hint_upgrade,
        'skill_rarity': {r['id']: r['rarity'] for r in q("SELECT id, rarity FROM skill_data")},
        'need_piece_num': {r['rarity']: r['piece_num'] for r in q("SELECT rarity, piece_num FROM need_piece_num_data")},
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(f"Generated {output_path}: {len(data['support_card_rarity'])} support cards, {len(data['cards'])} cards.")


if __name__ == "__main__":
    build(MDB_FILE, OUTPUT_FILE)
