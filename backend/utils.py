"""
Utility helpers shared across all route modules.
"""
from bson import ObjectId
from bson.errors import InvalidId
from flask import jsonify
from datetime import datetime


def object_id(id_str: str) -> ObjectId:
    """Convert a string to ObjectId, raising ValueError on invalid input."""
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise ValueError(f"'{id_str}' is not a valid document ID.")


def serialize_doc(doc: dict) -> dict:
    """
    Recursively convert ObjectId fields to strings so the document
    can be JSON-serialised by Flask.
    """
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else (str(v) if isinstance(v, ObjectId) else v) for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


def success(data: dict, status: int = 200):
    """Return a standardised success JSON response."""
    return jsonify(data), status


def error(message: str, status: int = 400):
    """Return a standardised error JSON response."""
    return jsonify({"error": message}), status


def now_iso() -> str:
    """Return the current UTC time as an ISO string."""
    return datetime.utcnow().isoformat()
