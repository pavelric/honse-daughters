import sqlite3
import json
import sys
import os

appdata_path = os.getenv('APPDATA')
appdata_base_path = os.path.dirname(appdata_path)


MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')
OUTPUT_FILE = "_skills_data.json"

def create_enriched_skill_json(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Connecting to database: {db_path}")

    query = """
    SELECT
        t1.id AS id,
        t1.group_id AS group_id,
        t2.need_skill_point AS base_cost,
        t3.text AS name
    FROM
        skill_data AS t1
    LEFT JOIN
        single_mode_skill_need_point AS t2 ON t2.id = t1.id
    LEFT JOIN
        text_data AS t3 ON t3."index" = t1.id AND t3.category = 47
    ORDER BY
        t1.id;
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
                
                skill_id = row_dict.pop('id')
                skill_cost = row_dict.get('base_cost')
                if skill_cost is None:
                    skill_cost = 200 # Inherited Ults (well this will apply to 2* Uma's ult as well but that's fine) 
                    row_dict['base_cost'] = skill_cost
                final_data[skill_id] = row_dict

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
    create_enriched_skill_json(MDB_FILE, OUTPUT_FILE)
