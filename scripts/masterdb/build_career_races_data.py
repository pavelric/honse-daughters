import pyodbc
import sqlite3
import json
import sys
import os # <-- Import the 'os' module


appdata_path = os.getenv('APPDATA')
appdata_base_path = os.path.dirname(appdata_path)


MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')
OUTPUT_FILE = "_career_races_data.json"
GROUND_MAP = {1: "Turf", 2: "Dirt"}
def classify_distance(value):
    try:
        d = int(value)
    except (TypeError, ValueError):
        return None
    if d <= 1400:
        return "Short"
    if d <= 1800:
        return "Mile"
    if d <= 2400:
        return "Medium"
    return "Long"

def create_enriched_race_json(db_path, output_path):
    if not os.path.exists(db_path):
        print(f"❌ Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Connecting to database: {db_path}")

    query = """
    SELECT
        t1.id AS program_id,
        t1.race_instance_id,
        t1.need_fan_count AS fans_needed,
        t2.text AS race_name,
        t3.race_id AS race_id,
        t4.course_set AS course_set,
        t5.distance AS distance,
        t5.ground AS ground
    FROM
        single_mode_program AS t1
    LEFT JOIN
        text_data AS t2 ON t2."index" = t1.race_instance_id AND t2.category = 28
    LEFT JOIN
        race_instance AS t3 ON t3.id = t1.race_instance_id
    LEFT JOIN
        race AS t4 ON t4.id = t3.race_id
    LEFT JOIN
        race_course_set AS t5 ON t5.id = t4.course_set
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
                
                route_id = row_dict.pop('program_id')
                ground_value = row_dict.get('ground')
                if ground_value is not None:
                    mapped_ground = GROUND_MAP.get(ground_value)
                    if mapped_ground is not None:
                        row_dict['ground'] = mapped_ground
                distance_value = row_dict.get('distance')
                classified_distance = classify_distance(distance_value)
                if classified_distance is not None:
                    row_dict['distance'] = f"{classified_distance} - {int(distance_value)}m"
                
                final_data[route_id] = row_dict

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
    create_enriched_race_json(MDB_FILE, OUTPUT_FILE)
