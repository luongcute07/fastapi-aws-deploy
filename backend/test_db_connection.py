"""
Test database connection to Amazon RDS PostgreSQL
Part 2.3 Deliverable helper
"""
import sys
from app.db import DATABASE_URL, engine, SessionLocal, Base, get_db
from app.models import User
from sqlalchemy import text

def test_connection():
    masked_url = DATABASE_URL
    if "@" in masked_url and ":" in masked_url.split("@")[0]:
        prefix, rest = masked_url.split("@")
        user_part = prefix.split(":")[0] + ":" + prefix.split(":")[1] + ":********"
        masked_url = f"{user_part}@{rest}"

    print("=" * 60)
    print("[TEST] AMAZON RDS POSTGRESQL DATABASE CONNECTION")
    print("=" * 60)
    print(f"[*] DATABASE_URL: {masked_url}")
    
    try:
        # Test raw connection and get database info
        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), current_user, version();"))
            row = result.fetchone()
            print("[+] Connection Status: SUCCESS")
            print(f"[+] Database Name:     {row[0]}")
            print(f"[+] Database User:     {row[1]}")
            print(f"[+] PostgreSQL Info:   {row[2].split(',')[0]}")
            
        # Ensure schema tables exist
        Base.metadata.create_all(bind=engine)
        print("[+] Tables Synchronized: 'users' table is ready")

        # Test ORM session
        db = next(get_db())
        user_count = db.query(User).count()
        print(f"[+] Current User Records: {user_count}")
        db.close()
        
        print("=" * 60)
        print("[SUCCESS] RDS DATABASE CONNECTION TEST PASSED 100%!")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"[-] Connection Failed: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
