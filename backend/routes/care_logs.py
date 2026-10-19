"""
Care Logs blueprint — CRUD for plant care log entries.

MongoDB collection: care_logs
Schema:
  _id               : ObjectId (auto)
  plant_id          : ObjectId (ref: plants, required)
  plant_name        : str (denormalized)
  plant_emoji       : str (denormalized)
  activity_type     : str (enum: Watering, Fertilizing, Pruning, ...)
  date              : ISO date string (required)
  notes             : str
  quantity_ml       : float  (for Watering)
  duration_minutes  : float
  created_at        : ISO datetime
  updated_at        : ISO datetime
"""
from flask import Blueprint, request
from database import get_db
from validators import validate_care_log, ValidationError
from utils import object_id, serialize_doc, success, error, now_iso

care_logs_bp = Blueprint("care_logs", __name__, url_prefix="/api/care-logs")


@care_logs_bp.route("", methods=["GET"])
def list_care_logs():
    """
    GET /api/care-logs?plant_id=<id>
    Returns care logs sorted by date descending.
    Optionally filter by plant.
    """
    db = get_db()
    query = {}
    plant_id_str = request.args.get("plant_id")
    if plant_id_str:
        try:
            query["plant_id"] = object_id(plant_id_str)
        except ValueError:
            pass

    logs = [serialize_doc(l) for l in db.care_logs.find(query).sort("date", -1)]
    return success({"care_logs": logs, "total": len(logs)})


@care_logs_bp.route("/summary", methods=["GET"])
def get_summary():
    """
    GET /api/care-logs/summary
    Returns activity count by type (aggregation pipeline).
    """
    db = get_db()
    pipeline = [
        {"$group": {"_id": "$activity_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    summary = list(db.care_logs.aggregate(pipeline))
    return success({"summary": [serialize_doc(s) for s in summary]})


@care_logs_bp.route("", methods=["POST"])
def create_care_log():
    """
    POST /api/care-logs
    Body: { plant_id, activity_type, date, notes, quantity_ml, duration_minutes }
    """
    db = get_db()
    data = request.get_json(silent=True) or {}

    try:
        validate_care_log(data)
    except ValidationError as e:
        return error(str(e), 422)

    # Resolve plant info for denormalization
    plant_name = None
    plant_emoji = None
    try:
        plant_oid = object_id(data["plant_id"])
        plant = db.plants.find_one({"_id": plant_oid}, {"name": 1, "emoji": 1})
        if not plant:
            return error("Plant not found.", 404)
        plant_name = plant.get("name")
        plant_emoji = plant.get("emoji", "🌿")
    except ValueError as e:
        return error(str(e), 400)

    doc = {
        "plant_id": plant_oid,
        "plant_name": plant_name,
        "plant_emoji": plant_emoji,
        "activity_type": data["activity_type"],
        "date": data["date"],
        "notes": data.get("notes", "").strip(),
        "quantity_ml": float(data["quantity_ml"]) if data.get("quantity_ml") not in (None, "") else None,
        "duration_minutes": float(data["duration_minutes"]) if data.get("duration_minutes") not in (None, "") else None,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    result = db.care_logs.insert_one(doc)
    doc["_id"] = result.inserted_id
    return success({"message": "Care activity logged.", "care_log": serialize_doc(doc)}, 201)


@care_logs_bp.route("/<log_id>", methods=["PUT"])
def update_care_log(log_id):
    """PUT /api/care-logs/<id>"""
    db = get_db()
    try:
        oid = object_id(log_id)
    except ValueError as e:
        return error(str(e), 400)

    data = request.get_json(silent=True) or {}
    try:
        validate_care_log(data, partial=True)
    except ValidationError as e:
        return error(str(e), 422)

    updates = {"updated_at": now_iso()}
    for field in ["activity_type", "date", "notes"]:
        if field in data:
            updates[field] = data[field].strip() if isinstance(data[field], str) else data[field]
    if "quantity_ml" in data and data["quantity_ml"] not in (None, ""):
        updates["quantity_ml"] = float(data["quantity_ml"])
    if "duration_minutes" in data and data["duration_minutes"] not in (None, ""):
        updates["duration_minutes"] = float(data["duration_minutes"])

    result = db.care_logs.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        return error("Care log not found.", 404)

    log = db.care_logs.find_one({"_id": oid})
    return success({"message": "Care log updated.", "care_log": serialize_doc(log)})


@care_logs_bp.route("/<log_id>", methods=["DELETE"])
def delete_care_log(log_id):
    """DELETE /api/care-logs/<id>"""
    db = get_db()
    try:
        oid = object_id(log_id)
    except ValueError as e:
        return error(str(e), 400)

    result = db.care_logs.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return error("Care log not found.", 404)
    return success({"message": "Care log deleted."})
