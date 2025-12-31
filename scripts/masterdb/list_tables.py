import sqlite3
import os
import sys

appdata_path = os.getenv('APPDATA')
if not appdata_path:
    print("APPDATA env var not found")
    sys.exit(1)

appdata_base_path = os.path.dirname(appdata_path)
MDB_FILE = os.path.join(appdata_base_path, 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')

try:
    with sqlite3.connect(MDB_FILE) as conn:
        cursor = conn.cursor()
        table_name = "jukebox_request_data"
        print(f"Inspecting {table_name}...")
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print(f"Columns: {[col[1] for col in columns]}")
        
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
        rows = cursor.fetchall()
        for row in rows:
            print(row)

except Exception as e:
    print(f"Error: {e}")
