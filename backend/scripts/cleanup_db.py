import sqlite3
import os

db_path = r"C:\Users\USER\.gemini\antigravity\scratch\SolarSync\backend\fallback.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
print("Tables:", tables)

for tbl in tables:
    if "solar" in tbl or "install" in tbl:
        cursor.execute(f"UPDATE {tbl} SET name = REPLACE(name, '[Demo] ', '') WHERE name LIKE '%[Demo]%'")
        print(f"Updated {tbl}")
    if "user" in tbl:
        cursor.execute(f"UPDATE {tbl} SET full_name = REPLACE(full_name, ' (Admin)', '')")
        cursor.execute(f"UPDATE {tbl} SET full_name = REPLACE(full_name, ' (Asset Owner)', '')")
        cursor.execute(f"UPDATE {tbl} SET full_name = REPLACE(full_name, ' (Lead Technician)', '')")
        cursor.execute(f"UPDATE {tbl} SET full_name = REPLACE(full_name, ' (Field Technician)', '')")
        print(f"Updated {tbl}")

conn.commit()
conn.close()
print("Database cleanup finished.")
