import sqlite3
import json
import sys
import os

appdata_path = os.getenv('APPDATA')
if not appdata_path:
    print("APPDATA environment variable not found.", file=sys.stderr)
    sys.exit(1)

appdata_base_path = os.path.dirname(appdata_path)
MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "../../assets/support_cards_level_data.json"))

def create_support_card_level_json(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    query = "SELECT * FROM support_card_level"

    try:
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()

            final_data = [dict(row) for row in rows]

            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as json_file:
                json.dump(final_data, json_file, indent=4, ensure_ascii=False)

            print(f"Generated {output_path} with {len(final_data)} records.")

    except sqlite3.OperationalError as e:
        print(f"SQL Error: {e}.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    create_support_card_level_json(MDB_FILE, OUTPUT_FILE)
