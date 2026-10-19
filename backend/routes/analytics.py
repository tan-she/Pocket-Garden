"""
Analytics blueprint — MongoDB aggregation pipelines for dashboard insights.

All endpoints use PyMongo aggregation pipelines ($group, $sort, $lookup,
$dateToString, $match, $facet) to compute meaningful statistics.
"""
from datetime import datetime, timedelta
from flask import Blueprint
from database import get_db
from utils import serialize_doc, success

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


@analytics_bp.route("/dashboard", methods=["GET"])
def dashboard():
    """
    GET /api/analytics/dashboard
    Returns headline KPIs via multiple aggregation pipelines:
      - total plants count
      - total gardens count
      - total care logs count
      - healthy plant percentage
      - care activity summary by type
    """
    db = get_db()

    total_plants = db.plants.count_documents({})
    total_gardens = db.gardens.count_documents({})
    total_care_logs = db.care_logs.count_documents({})

    # Healthy percentage: use $facet to run two counts in one round-trip
    health_pipeline = [
        {
            "$facet": {
                "healthy": [
                    {"$match": {"health_status": "Healthy"}},
                    {"$count": "count"},
                ],
                "total": [{"$count": "count"}],
            }
        }
    ]
    health_result = list(db.plants.aggregate(health_pipeline))
    healthy_count = 0
    total_count_check = 0
    if health_result:
        h = health_result[0]
        healthy_count = h["healthy"][0]["count"] if h["healthy"] else 0
        total_count_check = h["total"][0]["count"] if h["total"] else 0

    healthy_pct = round((healthy_count / total_count_check * 100)) if total_count_check > 0 else 0

    # Care activity summary by type
    care_type_pipeline = [
        {"$group": {"_id": "$activity_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    care_type_summary = list(db.care_logs.aggregate(care_type_pipeline))

    return success({
        "total_plants": total_plants,
        "total_gardens": total_gardens,
        "total_care_logs": total_care_logs,
        "healthy_percentage": healthy_pct,
        "care_type_summary": [serialize_doc(s) for s in care_type_summary],
    })


@analytics_bp.route("/care-activity", methods=["GET"])
def care_activity():
    """
    GET /api/analytics/care-activity
    Aggregates care log counts grouped by date over the last 30 days.
    Uses $dateToString to group by calendar day.
    """
    db = get_db()

    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")

    pipeline = [
        # Filter to last 30 days — date field stored as ISO string
        {"$match": {"date": {"$gte": thirty_days_ago}}},
        {
            "$group": {
                "_id": "$date",
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "date": "$_id", "count": 1}},
    ]

    activity = list(db.care_logs.aggregate(pipeline))
    return success({"care_activity": activity})


@analytics_bp.route("/popular-categories", methods=["GET"])
def popular_categories():
    """
    GET /api/analytics/popular-categories
    Groups plants by category and returns counts sorted descending.
    """
    db = get_db()

    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$match": {"_id": {"$ne": None}}},
    ]

    categories = list(db.plants.aggregate(pipeline))
    return success({"categories": [serialize_doc(c) for c in categories]})


@analytics_bp.route("/survival-rates", methods=["GET"])
def survival_rates():
    """
    GET /api/analytics/survival-rates
    Groups plants by health_status to show the distribution
    (Healthy, Wilting, Diseased, Dormant) — used as "survival rate" data.
    """
    db = get_db()

    pipeline = [
        {"$match": {"health_status": {"$ne": None}}},
        {"$group": {"_id": "$health_status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]

    survival = list(db.plants.aggregate(pipeline))
    return success({"survival_rates": [serialize_doc(s) for s in survival]})
