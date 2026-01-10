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
OUTPUT_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "../../assets/support_cards_effect_table_data.json"))

def create_support_card_effect_table_json(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    query_support = "SELECT * FROM support_card_effect_table"
    query_types = "SELECT * FROM text_data WHERE category = 151"

    try:
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query_types)
            type_rows = cursor.fetchall()
            type_map = {row["index"]: row["text"] for row in type_rows}

            cursor.execute(query_support)
            rows = cursor.fetchall()

            final_data = []
            for row in rows:
                original = dict(row)
                ordered = {}
                for key in row.keys():
                    ordered[key] = original[key]
                    if key == "type":
                        ordered["type_name"] = type_map.get(original["type"])
                final_data.append(ordered)

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
    create_support_card_effect_table_json(MDB_FILE, OUTPUT_FILE)
