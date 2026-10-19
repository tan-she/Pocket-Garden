"""
Gardens blueprint — CRUD operations for garden documents.

MongoDB collection: gardens
Schema:
  _id          : ObjectId (auto)
  name         : str (required, min 2 chars)
  type         : str (enum: Balcony, Windowsill, Rooftop, Indoor, Vertical, Container)
  location     : str
  sunlight     : str (enum)
  area_sqft    : float
  notes        : str
  plant_count  : int (virtual, computed via aggregation)
  created_at   : ISO datetime
  updated_at   : ISO datetime
"""
from flask import Blueprint, request
from bson import ObjectId
from database import get_db
from validators import validate_garden, ValidationError
from utils import object_id, serialize_doc, success, error, now_iso

gardens_bp = Blueprint("gardens", __name__, url_prefix="/api/gardens")


@gardens_bp.route("", methods=["GET"])
def list_gardens():
    """
    GET /api/gardens
    Returns all gardens with their plant counts via a $lookup aggregation.
    """
    db = get_db()
    pipeline = [
        {
            "$lookup": {
                "from": "plants",
                "localField": "_id",
                "foreignField": "garden_id",
                "as": "plants_list",
            }
        },
        {"$addFields": {"plant_count": {"$size": "$plants_list"}}},
        {"$project": {"plants_list": 0}},
        {"$sort": {"created_at": -1}},
    ]
    gardens = [serialize_doc(g) for g in db.gardens.aggregate(pipeline)]
    return success({"gardens": gardens})


@gardens_bp.route("/<garden_id>", methods=["GET"])
def get_garden(garden_id):
    """GET /api/gardens/<id>"""
    db = get_db()
    try:
        oid = object_id(garden_id)
    except ValueError as e:
        return error(str(e), 400)

    garden = db.gardens.find_one({"_id": oid})
    if not garden:
        return error("Garden not found.", 404)
    return success({"garden": serialize_doc(garden)})


@gardens_bp.route("", methods=["POST"])
def create_garden():
    """
    POST /api/gardens
    Body: { name, type, location, sunlight, area_sqft, notes }
    """
    db = get_db()
    data = request.get_json(silent=True) or {}

    try:
        validate_garden(data)
    except ValidationError as e:
        return error(str(e), 422)

    doc = {
        "name": data["name"].strip(),
        "type": data.get("type", "Balcony"),
        "location": data.get("location", "").strip(),
        "sunlight": data.get("sunlight", "Partial Sun (3–6 hrs)"),
        "area_sqft": float(data["area_sqft"]) if data.get("area_sqft") not in (None, "") else None,
        "notes": data.get("notes", "").strip(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    result = db.gardens.insert_one(doc)
    doc["_id"] = result.inserted_id
    return success({"message": "Garden created.", "garden": serialize_doc(doc)}, 201)


@gardens_bp.route("/<garden_id>", methods=["PUT"])
def update_garden(garden_id):
    """PUT /api/gardens/<id>"""
    db = get_db()
    try:
        oid = object_id(garden_id)
    except ValueError as e:
        return error(str(e), 400)

    data = request.get_json(silent=True) or {}
    try:
        validate_garden(data, partial=True)
    except ValidationError as e:
        return error(str(e), 422)

    updates = {k: v for k, v in {
        "name": data.get("name", "").strip() or None,
        "type": data.get("type"),
        "location": data.get("location", "").strip() or None,
        "sunlight": data.get("sunlight"),
        "area_sqft": float(data["area_sqft"]) if data.get("area_sqft") not in (None, "") else None,
        "notes": data.get("notes", "").strip() or None,
        "updated_at": now_iso(),
    }.items() if v is not None}

    result = db.gardens.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        return error("Garden not found.", 404)

    garden = db.gardens.find_one({"_id": oid})
    return success({"message": "Garden updated.", "garden": serialize_doc(garden)})


@gardens_bp.route("/<garden_id>", methods=["DELETE"])
def delete_garden(garden_id):
    """
    DELETE /api/gardens/<id>
    Also deletes all plants (and their care logs) in the garden.
    """
    db = get_db()
    try:
        oid = object_id(garden_id)
    except ValueError as e:
        return error(str(e), 400)

    # Cascade: get plant IDs → delete care logs → delete plants → delete garden
    plant_ids = [p["_id"] for p in db.plants.find({"garden_id": oid}, {"_id": 1})]
    if plant_ids:
        db.care_logs.delete_many({"plant_id": {"$in": plant_ids}})
        db.plants.delete_many({"garden_id": oid})

    result = db.gardens.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return error("Garden not found.", 404)
    return success({"message": "Garden and its plants deleted."})
