import sqlite3
import json
import sys
import os

appdata_path = os.getenv('APPDATA')
if not appdata_path:
    print("Error: APPDATA environment variable not found.", file=sys.stderr)
    sys.exit(1)

appdata_base_path = os.path.dirname(appdata_path)
MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')

# Output to {root}/assets/jukebox_request_data.json
# Assuming script is in scripts/masterdb/
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.abspath(os.path.join(SCRIPT_DIR, "../../assets/jukebox_request_data.json"))

def create_jukebox_json(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"❌ Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Connecting to database: {db_path}")

    query = "SELECT * FROM jukebox_request_data"

    try:
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            print("[*] Executing query...")
            cursor.execute(query)
            rows = cursor.fetchall()

            if not rows:
                print("[!] Query returned no data. The output file will be empty.")
                with open(output_path, 'w') as f:
                    f.write("[]")
                return

            print(f"[*] Processing {len(rows)} records...")
            
            final_data = []

            for row in rows:
                row_dict = dict(row)
                final_data.append(row_dict)

            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as json_file:
                json.dump(final_data, json_file, indent=4, ensure_ascii=False)

            print(f"Successfully generated {output_path} with {len(final_data)} records.")

    except sqlite3.OperationalError as e:
        print(f"SQL Error: {e}. Please check your table and column names.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

# Main execution block
if __name__ == "__main__":
    create_jukebox_json(MDB_FILE, OUTPUT_FILE)
