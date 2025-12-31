import pyodbc
import sqlite3
import json
import sys
import os

appdata_path = os.getenv('APPDATA')
appdata_base_path = os.path.dirname(appdata_path)


MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')
OUTPUT_FILE = "_succession_factors_data.json"

def create_succession_factors_json(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Connecting to database: {db_path}")

    query = """
    SELECT
        t1.factor_id AS id,
        t1.factor_group_id AS group_id,
        t1.rarity AS rarity,
        t2.value_1 AS skill_id,
        t3.text AS skill_name
    FROM
        succession_factor AS t1
    LEFT JOIN
        succession_factor_effect AS t2 ON t2.factor_group_id = t1.factor_group_id
    LEFT JOIN
        text_data AS t3 ON t3."index" = t1.factor_id AND t3.category = 147
    ORDER BY
        t1.factor_id;
    """

    try:
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            print("[*] Executing multi-table query...")
            cursor.execute(query)
            rows = cursor.fetchall()

            if not rows:
                print("[!] Query returned no data. The output file will be empty.")
                with open(output_path, 'w') as f:
                    f.write("{}")
                return

            print(f"[*] Processing {len(rows)} records...")
            
            final_data = {}

            for row in rows:
                row_dict = dict(row)
                
                factor_id = row_dict.pop('id')

                final_data[factor_id] = row_dict

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
    create_succession_factors_json(MDB_FILE, OUTPUT_FILE)
