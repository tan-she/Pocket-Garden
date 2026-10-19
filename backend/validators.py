"""
Validation helpers for all MongoDB document schemas.
Enforces required fields, allowed categories, numeric ranges, and data types.
"""
from datetime import datetime

# Allowed values for enum-like fields
VALID_PLANT_CATEGORIES = ["Herb", "Vegetable", "Fruit", "Flower", "Succulent", "Tropical", "Vine"]
VALID_HEALTH_STATUSES = ["Healthy", "Wilting", "Diseased", "Dormant"]
VALID_GARDEN_TYPES = ["Balcony", "Windowsill", "Rooftop", "Indoor", "Vertical", "Container"]
VALID_SUNLIGHT_OPTIONS = [
    "Full Sun (6+ hrs)", "Partial Sun (3–6 hrs)", "Shade (<3 hrs)"
]
VALID_ACTIVITY_TYPES = [
    "Watering", "Fertilizing", "Pruning", "Repotting", "Pest Control", "Health Check", "Other"
]
VALID_POST_TYPES = [
    "Seed Swap", "Plant Cutting", "Compost", "Tool Share", "Tip & Advice", "Free Plants"
]


class ValidationError(Exception):
    """Raised when document validation fails."""
    pass


def _require(data: dict, *fields):
    """Raise ValidationError if any required field is missing or empty."""
    for field in fields:
        val = data.get(field)
        if val is None or (isinstance(val, str) and not val.strip()):
            raise ValidationError(f"Field '{field}' is required and cannot be empty.")


def _enum(data: dict, field: str, allowed: list):
    """Raise ValidationError if a field's value is not in the allowed list."""
    val = data.get(field)
    if val is not None and val not in allowed:
        raise ValidationError(
            f"Invalid value '{val}' for '{field}'. Allowed: {allowed}"
        )


def _numeric_range(data: dict, field: str, min_val=None, max_val=None, required=False):
    """Validate that a numeric field is within an acceptable range."""
    val = data.get(field)
    if val is None:
        if required:
            raise ValidationError(f"Field '{field}' is required.")
        return
    try:
        num = float(val)
    except (TypeError, ValueError):
        raise ValidationError(f"Field '{field}' must be a number.")
    if min_val is not None and num < min_val:
        raise ValidationError(f"Field '{field}' must be >= {min_val}.")
    if max_val is not None and num > max_val:
        raise ValidationError(f"Field '{field}' must be <= {max_val}.")


# ── Garden ──────────────────────────────────────────────────────────────
def validate_garden(data: dict, partial=False) -> dict:
    """
    Validate and sanitise a garden document.
    partial=True allows updates without all required fields.
    """
    if not partial:
        _require(data, "name")

    if "name" in data and data["name"]:
        if len(data["name"].strip()) < 2:
            raise ValidationError("Garden name must be at least 2 characters.")

    _enum(data, "type", VALID_GARDEN_TYPES)
    _enum(data, "sunlight", VALID_SUNLIGHT_OPTIONS)

    if "area_sqft" in data and data["area_sqft"] not in (None, ""):
        _numeric_range(data, "area_sqft", min_val=0, max_val=10000)

    return data


# ── Plant ──────────────────────────────────────────────────────────────
def validate_plant(data: dict, partial=False) -> dict:
    """
    Validate and sanitise a plant document.
    """
    if not partial:
        _require(data, "name", "category")

    if not partial:
        _numeric_range(data, "sunlight_hours_per_day", min_val=0, max_val=24, required=True)
        _numeric_range(data, "watering_frequency_days", min_val=1, max_val=365, required=True)

    _enum(data, "category", VALID_PLANT_CATEGORIES)
    _enum(data, "health_status", VALID_HEALTH_STATUSES)

    if "sunlight_hours_per_day" in data:
        _numeric_range(data, "sunlight_hours_per_day", min_val=0, max_val=24)
    if "watering_frequency_days" in data:
        _numeric_range(data, "watering_frequency_days", min_val=1, max_val=365)
    if "pot_size_cm" in data and data["pot_size_cm"] not in (None, ""):
        _numeric_range(data, "pot_size_cm", min_val=1, max_val=300)
    if "fertilizer_frequency_weeks" in data and data["fertilizer_frequency_weeks"] not in (None, ""):
        _numeric_range(data, "fertilizer_frequency_weeks", min_val=1, max_val=52)

    return data


# ── Care Log ───────────────────────────────────────────────────────────
def validate_care_log(data: dict, partial=False) -> dict:
    """
    Validate and sanitise a care log entry.
    """
    if not partial:
        _require(data, "plant_id", "activity_type", "date")

    _enum(data, "activity_type", VALID_ACTIVITY_TYPES)

    if "date" in data and data["date"]:
        try:
            datetime.fromisoformat(data["date"])
        except ValueError:
            raise ValidationError("Field 'date' must be a valid ISO date string (YYYY-MM-DD).")

    if "quantity_ml" in data and data["quantity_ml"] not in (None, ""):
        _numeric_range(data, "quantity_ml", min_val=0, max_val=100000)
    if "duration_minutes" in data and data["duration_minutes"] not in (None, ""):
        _numeric_range(data, "duration_minutes", min_val=0, max_val=1440)

    return data


# ── Community Post ─────────────────────────────────────────────────────
def validate_community_post(data: dict, partial=False) -> dict:
    """
    Validate and sanitise a community post document.
    """
    if not partial:
        _require(data, "title", "post_type", "description")

    _enum(data, "post_type", VALID_POST_TYPES)

    if "title" in data and data["title"] and len(data["title"].strip()) < 5:
        raise ValidationError("Post title must be at least 5 characters.")

    return data
