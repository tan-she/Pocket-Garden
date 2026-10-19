"""
Community Posts blueprint — CRUD for community exchange posts.

MongoDB collection: community_posts
Schema:
  _id          : ObjectId (auto)
  title        : str (required, min 5 chars)
  post_type    : str (enum: Seed Swap, Plant Cutting, Compost, Tool Share, Tip & Advice, Free Plants)
  description  : str (required)
  author_name  : str
  location     : str
  contact_info : str
  is_available : bool (default True)
  created_at   : ISO datetime
  updated_at   : ISO datetime
"""
from flask import Blueprint, request
from database import get_db
from validators import validate_community_post, ValidationError
from utils import object_id, serialize_doc, success, error, now_iso

community_bp = Blueprint("community", __name__, url_prefix="/api/community")


@community_bp.route("", methods=["GET"])
def list_posts():
    """
    GET /api/community?post_type=<type>&available=<true|false>
    Returns posts sorted by creation date descending.
    """
    db = get_db()
    query = {}
    post_type = request.args.get("post_type")
    available = request.args.get("available")

    if post_type:
        query["post_type"] = post_type
    if available is not None:
        query["is_available"] = available.lower() == "true"

    posts = [serialize_doc(p) for p in db.community_posts.find(query).sort("created_at", -1)]
    return success({"posts": posts, "total": len(posts)})


@community_bp.route("/<post_id>", methods=["GET"])
def get_post(post_id):
    """GET /api/community/<id>"""
    db = get_db()
    try:
        oid = object_id(post_id)
    except ValueError as e:
        return error(str(e), 400)

    post = db.community_posts.find_one({"_id": oid})
    if not post:
        return error("Post not found.", 404)
    return success({"post": serialize_doc(post)})


@community_bp.route("", methods=["POST"])
def create_post():
    """POST /api/community"""
    db = get_db()
    data = request.get_json(silent=True) or {}

    try:
        validate_community_post(data)
    except ValidationError as e:
        return error(str(e), 422)

    doc = {
        "title": data["title"].strip(),
        "post_type": data["post_type"],
        "description": data["description"].strip(),
        "author_name": data.get("author_name", "").strip(),
        "location": data.get("location", "").strip(),
        "contact_info": data.get("contact_info", "").strip(),
        "is_available": bool(data.get("is_available", True)),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    result = db.community_posts.insert_one(doc)
    doc["_id"] = result.inserted_id
    return success({"message": "Post created.", "post": serialize_doc(doc)}, 201)


@community_bp.route("/<post_id>", methods=["PUT"])
def update_post(post_id):
    """PUT /api/community/<id>"""
    db = get_db()
    try:
        oid = object_id(post_id)
    except ValueError as e:
        return error(str(e), 400)

    data = request.get_json(silent=True) or {}
    try:
        validate_community_post(data, partial=True)
    except ValidationError as e:
        return error(str(e), 422)

    updates = {"updated_at": now_iso()}
    for field in ["title", "post_type", "description", "author_name", "location", "contact_info"]:
        if field in data:
            updates[field] = data[field].strip() if isinstance(data[field], str) else data[field]
    if "is_available" in data:
        updates["is_available"] = bool(data["is_available"])

    result = db.community_posts.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        return error("Post not found.", 404)

    post = db.community_posts.find_one({"_id": oid})
    return success({"message": "Post updated.", "post": serialize_doc(post)})


@community_bp.route("/<post_id>", methods=["DELETE"])
def delete_post(post_id):
    """DELETE /api/community/<id>"""
    db = get_db()
    try:
        oid = object_id(post_id)
    except ValueError as e:
        return error(str(e), 400)

    result = db.community_posts.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return error("Post not found.", 404)
    return success({"message": "Post deleted."})
