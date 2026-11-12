import os
import re
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger("solarsync.mongodb")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "solarsync")

_mongo_client: Optional[MongoClient] = None


def get_mongodb_client() -> Optional[MongoClient]:
    """Returns singleton MongoDB client with resilient timeout handling."""
    global _mongo_client
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=2000)
            _mongo_client.admin.command('ping')
            logger.info(f"MongoDB connected successfully to {MONGODB_URL}/{MONGODB_DB_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning(f"MongoDB connection failed ({MONGODB_URL}): {e}")
            _mongo_client = None
    return _mongo_client


def get_mongodb_db():
    """Returns the SolarSync database in MongoDB."""
    client = get_mongodb_client()
    if client is not None:
        return client[MONGODB_DB_NAME]
    return None


def is_mongodb_connected() -> bool:
    """Checks whether the MongoDB daemon is reachable."""
    try:
        client = get_mongodb_client()
        if client:
            client.admin.command('ping')
            return True
    except Exception:
        pass
    return False


def save_user_to_mongodb(user_data: Dict[str, Any]) -> bool:
    """
    Persists user credentials and profile to MongoDB collection 'users'.
    Performs upsert matching on lowercased email or username.
    """
    try:
        db = get_mongodb_db()
        if db is None:
            return False

        email = user_data.get("email", "").strip().lower()
        full_name = user_data.get("full_name", "").strip()
        username = (user_data.get("username") or email.split("@")[0] if "@" in email else email or full_name).strip().lower()

        doc = {
            "email": email,
            "username": username,
            "hashed_password": user_data.get("hashed_password"),
            "full_name": full_name or username,
            "phone_number": user_data.get("phone_number"),
            "role": user_data.get("role"),
            "is_active": user_data.get("is_active", True),
            "is_verified": user_data.get("is_verified", True),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if "id" in user_data:
            doc["sql_id"] = user_data["id"]

        # Upsert by matching either email, username, or full_name
        db.users.update_one(
            {"$or": [{"email": email}, {"username": username}]},
            {
                "$set": doc,
                "$setOnInsert": {
                    "created_at": user_data.get("created_at") or datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        logger.info(f"User {full_name} ({email}) saved to MongoDB (collection: users)")
        return True
    except Exception as e:
        logger.error(f"Failed to save user to MongoDB: {e}")
        return False


def find_user_in_mongodb(identifier: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a user document from MongoDB matching by email, username, or full_name (case-insensitive).
    """
    try:
        db = get_mongodb_db()
        if db is None or not identifier:
            return None
        clean = identifier.strip().lower()
        escaped = re.escape(identifier.strip())
        return db.users.find_one({
            "$or": [
                {"email": clean},
                {"username": clean},
                {"full_name": {"$regex": f"^{escaped}$", "$options": "i"}},
                {"email": {"$regex": f"^{escaped}@.*", "$options": "i"}}
            ]
        })
    except Exception as e:
        logger.error(f"Failed to find user {identifier} in MongoDB: {e}")
        return None


def get_user_from_mongodb_by_email(email: str) -> Optional[Dict[str, Any]]:
    return find_user_in_mongodb(email)


def list_users_from_mongodb() -> List[Dict[str, Any]]:
    """Returns all user records stored in MongoDB (with password hashes removed)."""
    try:
        db = get_mongodb_db()
        if db is None:
            return []
        users = []
        for u in db.users.find():
            users.append({
                "username": u.get("username"),
                "email": u.get("email"),
                "full_name": u.get("full_name"),
                "phone_number": u.get("phone_number"),
                "role": u.get("role"),
                "is_active": u.get("is_active"),
                "created_at": u.get("created_at"),
                "updated_at": u.get("updated_at")
            })
        return users
    except Exception as e:
        logger.error(f"Error listing users from MongoDB: {e}")
        return []


def sync_sql_users_to_mongodb(db_session):
    """Syncs existing SQL users into MongoDB collection 'users'."""
    try:
        from app.models.user import User
        users = db_session.query(User).all()
        synced = 0
        for u in users:
            saved = save_user_to_mongodb({
                "id": u.id,
                "email": u.email,
                "hashed_password": u.hashed_password,
                "full_name": u.full_name,
                "phone_number": u.phone_number,
                "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat() if u.created_at else None
            })
            if saved:
                synced += 1
        logger.info(f"Synchronized {synced} users to MongoDB collection 'users'")
        return synced
    except Exception as e:
        logger.warning(f"Could not sync SQL users to MongoDB: {e}")
        return 0
