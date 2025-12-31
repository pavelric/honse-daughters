import pyodbc
import sqlite3
import json
import sys
import os

appdata_path = os.getenv('APPDATA')
appdata_base_path = os.path.dirname(appdata_path)

# --- CONFIGURATION ---
MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')
OUTPUT_FILE = "_route_race_data.json"

def create_enriched_race_json(db_path, output_path):
    """
    Generates a JSON file by combining data from three specific tables:
    1. Grabs all data from 'single_mode_route_race'.
    2. Looks up 'race_instance_id' in 'single_mode_program' using 'condition_type'.
    3. Looks up the race name ('text') in 'text_data' using the 'race_instance_id'.

    Args:
        db_path (str): The file path to the SQLite database.
        output_path (str): The file path for the generated JSON file.
    """
    if not os.path.exists(db_path):
        print(f"❌ Error: Database file not found at '{db_path}'", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Connecting to database: {db_path}")

    # This SQL query is the core of the script. It performs all the lookups at once.
    # It uses LEFT JOINs, which are safer because they will still include a route race
    # even if a corresponding program or text entry is missing.
    query = """
    SELECT
        t1.id AS route_id,
        t1.race_set_id,
        t1.target_type,
        t1.turn,
        t1.condition_type,
        t1.condition_id,
        t1.condition_value_1,
        t1.condition_value_2,
        t2.id AS program_id,
        t2.race_instance_id,
        t3.text AS race_name
    FROM
        single_mode_route_race AS t1
    LEFT JOIN
        single_mode_program AS t2 ON t1.condition_id = t2.id
    LEFT JOIN
        text_data AS t3 ON t3."index" = t2.race_instance_id AND t3.category = 28
    ORDER BY
        t1.id;
    """

    try:
        # Connect to the SQLite database
        with sqlite3.connect(db_path) as conn:
            # conn.row_factory allows us to access columns by name (like a dictionary)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            print("[*] Executing multi-table query...")
            cursor.execute(query)
            rows = cursor.fetchall()

            if not rows:
                print("[!] Query returned no data. The output file will be empty.")
                # Create an empty file to indicate completion
                with open(output_path, 'w') as f:
                    f.write("{}")
                return

            print(f"[*] Processing {len(rows)} records...")
            
            # This dictionary will hold the final JSON structure
            final_data = {}

            for row in rows:
                # Convert the database row object to a standard Python dictionary
                row_dict = dict(row)
                
                # The 'route_id' will be the main key in our JSON object
                # We use .pop() to get the value AND remove it from the dictionary
                route_id = row_dict.pop('route_id')
                
                # Assign the nested dictionary to its ID key
                final_data[route_id] = row_dict

            # Write the final dictionary to the JSON file
            with open(output_path, 'w', encoding='utf-8') as json_file:
                # Use indent for a pretty, readable JSON file
                json.dump(final_data, json_file, indent=4, ensure_ascii=False)

            print(f"✅ Successfully generated {output_path} with {len(final_data)} records.")

    except sqlite3.OperationalError as e:
        print(f"❌ SQL Error: {e}. Please check your table and column names.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

# Main execution block
if __name__ == "__main__":
    create_enriched_race_json(MDB_FILE, OUTPUT_FILE)
