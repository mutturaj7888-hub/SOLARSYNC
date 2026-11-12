import sqlite3

db_path = r"C:\Users\USER\.gemini\antigravity\scratch\SolarSync\backend\fallback.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, name FROM solar_installations")
for r in cursor.fetchall():
    print("Solar Installation:", r)
cursor.execute("SELECT id, full_name, email, role FROM users")
for r in cursor.fetchall():
    print("User:", r)
conn.close()

