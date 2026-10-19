"""
Database configuration and connection management.
Uses PyMongo to connect to MongoDB.
"""
import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "pocket_garden")

_client = None
_db = None


def get_db():
    """Return the MongoDB database instance, creating it if necessary."""
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Ping to verify connection
        _client.admin.command("ping")
        _db = _client[MONGO_DB_NAME]
        _ensure_indexes(_db)
    return _db


def _ensure_indexes(db):
    """Create indexes for common query patterns."""
    # Plants
    db.plants.create_index([("garden_id", ASCENDING)])
    db.plants.create_index([("category", ASCENDING)])
    db.plants.create_index([("health_status", ASCENDING)])
    db.plants.create_index([("name", ASCENDING)])

    # Care logs
    db.care_logs.create_index([("plant_id", ASCENDING)])
    db.care_logs.create_index([("date", DESCENDING)])
    db.care_logs.create_index([("activity_type", ASCENDING)])

    # Gardens
    db.gardens.create_index([("name", ASCENDING)])

    # Community posts
    db.community_posts.create_index([("post_type", ASCENDING)])
    db.community_posts.create_index([("created_at", DESCENDING)])
    db.community_posts.create_index([("is_available", ASCENDING)])
