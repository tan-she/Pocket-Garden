"""
Plants blueprint — CRUD operations for plant documents.

MongoDB collection: plants
Schema:
  _id                       : ObjectId (auto)
  name                      : str (required)
  scientific_name           : str
  category                  : str (enum: Herb, Vegetable, Fruit, Flower, Succulent, Tropical, Vine)
  emoji                     : str
  garden_id                 : ObjectId (ref: gardens)
  garden_name               : str (denormalized for display)
  sunlight_hours_per_day    : float (0–24, required)
  watering_frequency_days   : int (1–365, required)
  health_status             : str (enum: Healthy, Wilting, Diseased, Dormant)
  date_planted              : ISO date string
  soil_type                 : str
  pot_size_cm               : float
  fertilizer_frequency_weeks: int
  notes                     : str
  created_at                : ISO datetime
  updated_at                : ISO datetime
"""
from flask import Blueprint, request
from bson import ObjectId
from database import get_db
from validators import validate_plant, ValidationError
from utils import object_id, serialize_doc, success, error, now_iso

plants_bp = Blueprint("plants", __name__, url_prefix="/api/plants")


@plants_bp.route("", methods=["GET"])
def list_plants():
    """
    GET /api/plants?garden_id=<id>
    Returns plants, optionally filtered by garden.
    """
    db = get_db()
    query = {}
    garden_id_str = request.args.get("garden_id")
    if garden_id_str:
        try:
            query["garden_id"] = object_id(garden_id_str)
        except ValueError:
            pass

    plants = [serialize_doc(p) for p in db.plants.find(query).sort("created_at", -1)]
    return success({"plants": plants, "total": len(plants)})


@plants_bp.route("/stats", methods=["GET"])
def get_stats():
    """GET /api/plants/stats — quick aggregation for dashboard."""
    db = get_db()
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    stats = list(db.plants.aggregate(pipeline))
    total = db.plants.count_documents({})
    return success({"category_breakdown": [serialize_doc(s) for s in stats], "total": total})


@plants_bp.route("/<plant_id>", methods=["GET"])
def get_plant(plant_id):
    """GET /api/plants/<id>"""
    db = get_db()
    try:
        oid = object_id(plant_id)
    except ValueError as e:
        return error(str(e), 400)

    plant = db.plants.find_one({"_id": oid})
    if not plant:
        return error("Plant not found.", 404)
    return success({"plant": serialize_doc(plant)})


@plants_bp.route("", methods=["POST"])
def create_plant():
    """
    POST /api/plants
    Body: plant document (see schema above)
    """
    db = get_db()
    data = request.get_json(silent=True) or {}

    try:
        validate_plant(data)
    except ValidationError as e:
        return error(str(e), 422)

    # Resolve garden name for denormalization
    garden_name = None
    garden_oid = None
    if data.get("garden_id"):
        try:
            garden_oid = object_id(data["garden_id"])
            garden = db.gardens.find_one({"_id": garden_oid}, {"name": 1})
            if garden:
                garden_name = garden["name"]
        except ValueError:
            pass

    doc = {
        "name": data["name"].strip(),
        "scientific_name": data.get("scientific_name", "").strip(),
        "category": data.get("category", "Herb"),
        "emoji": data.get("emoji", "🌿"),
        "garden_id": garden_oid,
        "garden_name": garden_name,
        "sunlight_hours_per_day": float(data["sunlight_hours_per_day"]),
        "watering_frequency_days": int(data["watering_frequency_days"]),
        "health_status": data.get("health_status", "Healthy"),
        "date_planted": data.get("date_planted") or None,
        "soil_type": data.get("soil_type", "").strip(),
        "pot_size_cm": float(data["pot_size_cm"]) if data.get("pot_size_cm") not in (None, "") else None,
        "fertilizer_frequency_weeks": int(data["fertilizer_frequency_weeks"]) if data.get("fertilizer_frequency_weeks") not in (None, "") else None,
        "notes": data.get("notes", "").strip(),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    result = db.plants.insert_one(doc)
    doc["_id"] = result.inserted_id
    return success({"message": "Plant added.", "plant": serialize_doc(doc)}, 201)


@plants_bp.route("/<plant_id>", methods=["PUT"])
def update_plant(plant_id):
    """PUT /api/plants/<id>"""
    db = get_db()
    try:
        oid = object_id(plant_id)
    except ValueError as e:
        return error(str(e), 400)

    data = request.get_json(silent=True) or {}
    try:
        validate_plant(data, partial=True)
    except ValidationError as e:
        return error(str(e), 422)

    # Resolve new garden if changed
    garden_name = None
    garden_oid = None
    if "garden_id" in data:
        if data["garden_id"]:
            try:
                garden_oid = object_id(data["garden_id"])
                garden = db.gardens.find_one({"_id": garden_oid}, {"name": 1})
                if garden:
                    garden_name = garden["name"]
            except ValueError:
                pass

    updates = {"updated_at": now_iso()}
    for field in ["name", "scientific_name", "category", "emoji", "health_status",
                  "date_planted", "soil_type", "notes"]:
        if field in data:
            val = data[field]
            updates[field] = val.strip() if isinstance(val, str) else val

    for field in ["sunlight_hours_per_day"]:
        if field in data:
            updates[field] = float(data[field])
    for field in ["watering_frequency_days", "fertilizer_frequency_weeks"]:
        if field in data and data[field] not in (None, ""):
            updates[field] = int(data[field])
    if "pot_size_cm" in data and data["pot_size_cm"] not in (None, ""):
        updates["pot_size_cm"] = float(data["pot_size_cm"])

    if "garden_id" in data:
        updates["garden_id"] = garden_oid
        updates["garden_name"] = garden_name

    result = db.plants.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        return error("Plant not found.", 404)

    plant = db.plants.find_one({"_id": oid})
    return success({"message": "Plant updated.", "plant": serialize_doc(plant)})


@plants_bp.route("/<plant_id>", methods=["DELETE"])
def delete_plant(plant_id):
    """DELETE /api/plants/<id> — also deletes associated care logs."""
    db = get_db()
    try:
        oid = object_id(plant_id)
    except ValueError as e:
        return error(str(e), 400)

    db.care_logs.delete_many({"plant_id": oid})
    result = db.plants.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return error("Plant not found.", 404)
    return success({"message": "Plant and its care logs deleted."})
