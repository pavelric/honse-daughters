"""Builds assets/login_bonus_data.json: the login bonuses and their daily rewards.

Each entry is a login_bonus_data row plus `rewards`: count (day) -> [[item_category, item_id, item_num], ...].
type 1 = normal (loops over count_num days), 2 = beginner, 3 = one-day campaign,
4 = stepped campaign (bonuses sharing group_id, claimed in step order).
start_date / end_date are kept as master strings ("YYYY/M/D hh:mm:ss").
"""
import json
import os
import sqlite3
import sys

appdata_path = os.getenv('APPDATA')
if not appdata_path:
    print("APPDATA environment variable not found.", file=sys.stderr)
    sys.exit(1)

appdata_base_path = os.path.dirname(appdata_path)
MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "../../assets/login_bonus_data.json"))


def build(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row

    bonuses = {r['id']: {**dict(r), 'rewards': {}} for r in conn.execute("SELECT * FROM login_bonus_data ORDER BY id")}
    for r in conn.execute("SELECT * FROM login_bonus_detail ORDER BY login_bonus_id, count"):
        bonus = bonuses.get(r['login_bonus_id'])
        if not bonus:
            continue
        suffixes = [''] + [f'_{i}' for i in range(2, 6)]
        bonus['rewards'][r['count']] = [[r[f'item_category{s}'], r[f'item_id{s}'], r[f'item_num{s}']]
                                        for s in suffixes if r[f'item_category{s}']]

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(list(bonuses.values()), f, ensure_ascii=False, separators=(',', ':'))
    print(f"Generated {output_path}: {len(bonuses)} login bonuses.")


if __name__ == "__main__":
    build(MDB_FILE, OUTPUT_FILE)
