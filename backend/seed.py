"""
Pocket Garden — MongoDB Seed Script
====================================
Populates the database with realistic sample data for demonstration.
Run: python seed.py

Collections seeded:
  - gardens (5 sample garden spaces)
  - plants  (15 sample plants across gardens)
  - care_logs (30 sample care activity logs)
  - community_posts (10 sample community posts)
"""
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "pocket_garden")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]


def seed():
    print("🌿 Seeding Pocket Garden database...")

    # Clear existing data
    db.gardens.drop()
    db.plants.drop()
    db.care_logs.drop()
    db.community_posts.drop()
    print("  ✓ Cleared existing data")

    now = datetime.utcnow()
    fmt = lambda d: d.isoformat()

    # ── Gardens ────────────────────────────────────────────────────────
    gardens_data = [
        {
            "name": "Balcony Herb Garden",
            "type": "Balcony",
            "location": "East-facing balcony, 3rd floor",
            "sunlight": "Partial Sun (3–6 hrs)",
            "area_sqft": 15.0,
            "notes": "Gets morning sun until about 11am. Great for herbs.",
            "created_at": fmt(now - timedelta(days=90)),
            "updated_at": fmt(now - timedelta(days=30)),
        },
        {
            "name": "Kitchen Windowsill",
            "type": "Windowsill",
            "location": "South-facing kitchen window",
            "sunlight": "Full Sun (6+ hrs)",
            "area_sqft": 3.0,
            "notes": "Gets full sun from 9am–4pm. Perfect for succulents and small herbs.",
            "created_at": fmt(now - timedelta(days=60)),
            "updated_at": fmt(now - timedelta(days=10)),
        },
        {
            "name": "Rooftop Veggie Patch",
            "type": "Rooftop",
            "location": "Rooftop terrace",
            "sunlight": "Full Sun (6+ hrs)",
            "area_sqft": 40.0,
            "notes": "Exposed to wind — use windbreakers for taller plants.",
            "created_at": fmt(now - timedelta(days=45)),
            "updated_at": fmt(now - timedelta(days=5)),
        },
        {
            "name": "Indoor Tropical Corner",
            "type": "Indoor",
            "location": "Living room corner, indirect light",
            "sunlight": "Shade (<3 hrs)",
            "area_sqft": 8.0,
            "notes": "Humidity-loving plants. Mist regularly.",
            "created_at": fmt(now - timedelta(days=30)),
            "updated_at": fmt(now - timedelta(days=2)),
        },
        {
            "name": "Vertical Herb Wall",
            "type": "Vertical",
            "location": "North wall of balcony",
            "sunlight": "Partial Sun (3–6 hrs)",
            "area_sqft": 12.0,
            "notes": "Pockets arrangement — water from top, check drainage.",
            "created_at": fmt(now - timedelta(days=20)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
    ]

    garden_ids = db.gardens.insert_many(gardens_data).inserted_ids
    g1, g2, g3, g4, g5 = garden_ids
    print(f"  ✓ Inserted {len(garden_ids)} gardens")

    # ── Plants ─────────────────────────────────────────────────────────
    plants_data = [
        {
            "name": "Sweet Basil",
            "scientific_name": "Ocimum basilicum",
            "category": "Herb",
            "emoji": "🌿",
            "garden_id": g1,
            "garden_name": "Balcony Herb Garden",
            "sunlight_hours_per_day": 5.0,
            "watering_frequency_days": 2,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=80)).strftime("%Y-%m-%d"),
            "soil_type": "Well-draining potting mix",
            "pot_size_cm": 20,
            "fertilizer_frequency_weeks": 4,
            "notes": "Pinch off flower buds to keep leaves bushy.",
            "created_at": fmt(now - timedelta(days=80)),
            "updated_at": fmt(now - timedelta(days=2)),
        },
        {
            "name": "Spearmint",
            "scientific_name": "Mentha spicata",
            "category": "Herb",
            "emoji": "🌱",
            "garden_id": g1,
            "garden_name": "Balcony Herb Garden",
            "sunlight_hours_per_day": 4.0,
            "watering_frequency_days": 2,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=75)).strftime("%Y-%m-%d"),
            "soil_type": "Moist, rich potting mix",
            "pot_size_cm": 18,
            "fertilizer_frequency_weeks": 6,
            "notes": "Very vigorous grower — keep contained.",
            "created_at": fmt(now - timedelta(days=75)),
            "updated_at": fmt(now - timedelta(days=3)),
        },
        {
            "name": "Lemon Thyme",
            "scientific_name": "Thymus citriodorus",
            "category": "Herb",
            "emoji": "🍃",
            "garden_id": g1,
            "garden_name": "Balcony Herb Garden",
            "sunlight_hours_per_day": 6.0,
            "watering_frequency_days": 4,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=60)).strftime("%Y-%m-%d"),
            "soil_type": "Sandy, well-draining",
            "pot_size_cm": 15,
            "fertilizer_frequency_weeks": 8,
            "notes": "Drought-tolerant. Let soil dry between watering.",
            "created_at": fmt(now - timedelta(days=60)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
        {
            "name": "Echeveria",
            "scientific_name": "Echeveria elegans",
            "category": "Succulent",
            "emoji": "🌵",
            "garden_id": g2,
            "garden_name": "Kitchen Windowsill",
            "sunlight_hours_per_day": 6.0,
            "watering_frequency_days": 14,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=55)).strftime("%Y-%m-%d"),
            "soil_type": "Cactus/succulent mix",
            "pot_size_cm": 10,
            "fertilizer_frequency_weeks": 12,
            "notes": "Water sparingly. Root rot is the main killer.",
            "created_at": fmt(now - timedelta(days=55)),
            "updated_at": fmt(now - timedelta(days=7)),
        },
        {
            "name": "Aloe Vera",
            "scientific_name": "Aloe barbadensis miller",
            "category": "Succulent",
            "emoji": "🌵",
            "garden_id": g2,
            "garden_name": "Kitchen Windowsill",
            "sunlight_hours_per_day": 5.0,
            "watering_frequency_days": 10,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=50)).strftime("%Y-%m-%d"),
            "soil_type": "Sandy cactus mix",
            "pot_size_cm": 18,
            "fertilizer_frequency_weeks": 16,
            "notes": "Leaves can be used for burns and skin care.",
            "created_at": fmt(now - timedelta(days=50)),
            "updated_at": fmt(now - timedelta(days=4)),
        },
        {
            "name": "Cherry Tomato",
            "scientific_name": "Solanum lycopersicum var. cerasiforme",
            "category": "Vegetable",
            "emoji": "🍅",
            "garden_id": g3,
            "garden_name": "Rooftop Veggie Patch",
            "sunlight_hours_per_day": 8.0,
            "watering_frequency_days": 2,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=42)).strftime("%Y-%m-%d"),
            "soil_type": "Rich, fertile potting mix with compost",
            "pot_size_cm": 35,
            "fertilizer_frequency_weeks": 2,
            "notes": "Stake when stems reach 30cm. Pinch suckers.",
            "created_at": fmt(now - timedelta(days=42)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
        {
            "name": "Chilli Pepper",
            "scientific_name": "Capsicum annuum",
            "category": "Vegetable",
            "emoji": "🌶️",
            "garden_id": g3,
            "garden_name": "Rooftop Veggie Patch",
            "sunlight_hours_per_day": 7.0,
            "watering_frequency_days": 3,
            "health_status": "Wilting",
            "date_planted": (now - timedelta(days=38)).strftime("%Y-%m-%d"),
            "soil_type": "Loamy, well-draining potting mix",
            "pot_size_cm": 25,
            "fertilizer_frequency_weeks": 3,
            "notes": "Spotted some yellowing leaves — may need more nitrogen.",
            "created_at": fmt(now - timedelta(days=38)),
            "updated_at": fmt(now - timedelta(days=2)),
        },
        {
            "name": "Spinach",
            "scientific_name": "Spinacia oleracea",
            "category": "Vegetable",
            "emoji": "🥬",
            "garden_id": g3,
            "garden_name": "Rooftop Veggie Patch",
            "sunlight_hours_per_day": 4.0,
            "watering_frequency_days": 2,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=25)).strftime("%Y-%m-%d"),
            "soil_type": "Rich, moist potting mix",
            "pot_size_cm": 30,
            "fertilizer_frequency_weeks": 4,
            "notes": "Harvest outer leaves to encourage continued growth.",
            "created_at": fmt(now - timedelta(days=25)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
        {
            "name": "Peace Lily",
            "scientific_name": "Spathiphyllum wallisii",
            "category": "Tropical",
            "emoji": "🌺",
            "garden_id": g4,
            "garden_name": "Indoor Tropical Corner",
            "sunlight_hours_per_day": 2.0,
            "watering_frequency_days": 5,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=28)).strftime("%Y-%m-%d"),
            "soil_type": "Peat-based, moisture-retaining mix",
            "pot_size_cm": 22,
            "fertilizer_frequency_weeks": 6,
            "notes": "Droops when thirsty — a reliable watering indicator!",
            "created_at": fmt(now - timedelta(days=28)),
            "updated_at": fmt(now - timedelta(days=3)),
        },
        {
            "name": "Pothos",
            "scientific_name": "Epipremnum aureum",
            "category": "Tropical",
            "emoji": "🍃",
            "garden_id": g4,
            "garden_name": "Indoor Tropical Corner",
            "sunlight_hours_per_day": 2.0,
            "watering_frequency_days": 7,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=20)).strftime("%Y-%m-%d"),
            "soil_type": "Any well-draining potting mix",
            "pot_size_cm": 18,
            "fertilizer_frequency_weeks": 8,
            "notes": "Nearly indestructible. Great for beginners.",
            "created_at": fmt(now - timedelta(days=20)),
            "updated_at": fmt(now - timedelta(days=5)),
        },
        {
            "name": "Snake Plant",
            "scientific_name": "Dracaena trifasciata",
            "category": "Tropical",
            "emoji": "🌱",
            "garden_id": g4,
            "garden_name": "Indoor Tropical Corner",
            "sunlight_hours_per_day": 3.0,
            "watering_frequency_days": 14,
            "health_status": "Dormant",
            "date_planted": (now - timedelta(days=15)).strftime("%Y-%m-%d"),
            "soil_type": "Sandy, well-draining mix",
            "pot_size_cm": 20,
            "fertilizer_frequency_weeks": 12,
            "notes": "Going into seasonal dormancy. Reduce watering in winter.",
            "created_at": fmt(now - timedelta(days=15)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
        {
            "name": "Rosemary",
            "scientific_name": "Salvia rosmarinus",
            "category": "Herb",
            "emoji": "🌿",
            "garden_id": g5,
            "garden_name": "Vertical Herb Wall",
            "sunlight_hours_per_day": 5.0,
            "watering_frequency_days": 5,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=18)).strftime("%Y-%m-%d"),
            "soil_type": "Sandy, alkaline-leaning potting mix",
            "pot_size_cm": 15,
            "fertilizer_frequency_weeks": 8,
            "notes": "Prune after flowering to maintain bushy shape.",
            "created_at": fmt(now - timedelta(days=18)),
            "updated_at": fmt(now - timedelta(days=2)),
        },
        {
            "name": "Curly Parsley",
            "scientific_name": "Petroselinum crispum",
            "category": "Herb",
            "emoji": "🌾",
            "garden_id": g5,
            "garden_name": "Vertical Herb Wall",
            "sunlight_hours_per_day": 4.0,
            "watering_frequency_days": 3,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=12)).strftime("%Y-%m-%d"),
            "soil_type": "Rich, moist potting mix",
            "pot_size_cm": 18,
            "fertilizer_frequency_weeks": 4,
            "notes": "Slow to germinate but very productive once established.",
            "created_at": fmt(now - timedelta(days=12)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
        {
            "name": "Lavender",
            "scientific_name": "Lavandula angustifolia",
            "category": "Flower",
            "emoji": "💜",
            "garden_id": g1,
            "garden_name": "Balcony Herb Garden",
            "sunlight_hours_per_day": 6.0,
            "watering_frequency_days": 7,
            "health_status": "Healthy",
            "date_planted": (now - timedelta(days=35)).strftime("%Y-%m-%d"),
            "soil_type": "Well-draining, slightly alkaline",
            "pot_size_cm": 20,
            "fertilizer_frequency_weeks": 8,
            "notes": "Attracts pollinators. Harvest just before full bloom.",
            "created_at": fmt(now - timedelta(days=35)),
            "updated_at": fmt(now - timedelta(days=3)),
        },
        {
            "name": "Strawberry",
            "scientific_name": "Fragaria × ananassa",
            "category": "Fruit",
            "emoji": "🍓",
            "garden_id": g3,
            "garden_name": "Rooftop Veggie Patch",
            "sunlight_hours_per_day": 7.0,
            "watering_frequency_days": 2,
            "health_status": "Diseased",
            "date_planted": (now - timedelta(days=30)).strftime("%Y-%m-%d"),
            "soil_type": "Slightly acidic, rich potting mix",
            "pot_size_cm": 25,
            "fertilizer_frequency_weeks": 3,
            "notes": "Grey mould spotted on lower leaves. Treating with fungicide.",
            "created_at": fmt(now - timedelta(days=30)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
    ]

    plant_ids = db.plants.insert_many(plants_data).inserted_ids
    print(f"  ✓ Inserted {len(plant_ids)} plants")

    # ── Care Logs ──────────────────────────────────────────────────────
    p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15 = plant_ids

    care_entries = [
        ("Watering", p1, "Sweet Basil", "🌿", 0, 250, 5, "Watered thoroughly after soil felt dry."),
        ("Watering", p2, "Spearmint", "🌱", 1, 200, 5, ""),
        ("Watering", p1, "Sweet Basil", "🌿", 2, 250, 5, ""),
        ("Fertilizing", p1, "Sweet Basil", "🌿", 4, None, 10, "Applied diluted liquid fertilizer."),
        ("Watering", p4, "Echeveria", "🌵", 7, 50, 3, "Very light watering — soil was completely dry."),
        ("Pruning", p1, "Sweet Basil", "🌿", 7, None, 15, "Pinched off 3 flower buds. Plant looks bushier."),
        ("Watering", p6, "Cherry Tomato", "🍅", 0, 500, 10, "Deep watering."),
        ("Watering", p6, "Cherry Tomato", "🍅", 2, 500, 10, ""),
        ("Fertilizing", p6, "Cherry Tomato", "🍅", 3, None, 15, "High-potassium feed to support fruiting."),
        ("Watering", p7, "Chilli Pepper", "🌶️", 1, 300, 8, ""),
        ("Health Check", p7, "Chilli Pepper", "🌶️", 2, None, 20, "Spotted yellowing leaves. Possible nitrogen deficiency or overwatering."),
        ("Pest Control", p15, "Strawberry", "🍓", 0, None, 30, "Applied organic fungicide to control grey mould."),
        ("Pest Control", p15, "Strawberry", "🍓", 3, None, 20, "Re-applied fungicide treatment. Some improvement."),
        ("Watering", p9, "Peace Lily", "🌺", 3, 150, 5, "Drooping indicated it needed water."),
        ("Watering", p9, "Peace Lily", "🌺", 8, 150, 5, ""),
        ("Watering", p10, "Pothos", "🍃", 5, 100, 3, ""),
        ("Repotting", p10, "Pothos", "🍃", 10, None, 30, "Repotted into a 22cm pot. Roots were very root-bound."),
        ("Watering", p3, "Lemon Thyme", "🍃", 3, 80, 3, ""),
        ("Fertilizing", p3, "Lemon Thyme", "🍃", 8, None, 10, ""),
        ("Watering", p12, "Rosemary", "🌿", 2, 100, 5, ""),
        ("Pruning", p12, "Rosemary", "🌿", 5, None, 25, "Light shaping trim after the summer flush."),
        ("Watering", p13, "Curly Parsley", "🌾", 1, 150, 5, ""),
        ("Watering", p14, "Lavender", "💜", 7, 120, 5, ""),
        ("Watering", p5, "Aloe Vera", "🌵", 10, 80, 3, ""),
        ("Health Check", p11, "Snake Plant", "🌱", 1, None, 10, "Looking healthy, dormant phase expected this time of year."),
        ("Watering", p8, "Spinach", "🥬", 1, 300, 5, ""),
        ("Watering", p8, "Spinach", "🥬", 3, 300, 5, ""),
        ("Fertilizing", p8, "Spinach", "🥬", 6, None, 10, "Applied balanced liquid fertilizer."),
        ("Health Check", p6, "Cherry Tomato", "🍅", 1, None, 15, "First flowers appearing! On track for fruits in 3–4 weeks."),
        ("Watering", p2, "Spearmint", "🌱", 3, 200, 5, ""),
    ]

    care_docs = []
    for activity, plant_id, plant_name, plant_emoji, days_ago, qty, duration, notes in care_entries:
        date = (now - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        care_docs.append({
            "plant_id": plant_id,
            "plant_name": plant_name,
            "plant_emoji": plant_emoji,
            "activity_type": activity,
            "date": date,
            "notes": notes,
            "quantity_ml": qty,
            "duration_minutes": float(duration),
            "created_at": fmt(now - timedelta(days=days_ago)),
            "updated_at": fmt(now - timedelta(days=days_ago)),
        })

    db.care_logs.insert_many(care_docs)
    print(f"  ✓ Inserted {len(care_docs)} care log entries")

    # ── Community Posts ────────────────────────────────────────────────
    community_data = [
        {
            "title": "Free mint cuttings — organic, no pesticides",
            "post_type": "Plant Cutting",
            "description": "Have about 10 rooted mint cuttings (spearmint and chocolate mint). Come pick up anytime. Just message me first!",
            "author_name": "Priya",
            "location": "Tampines, Singapore",
            "contact_info": "priya@email.com",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=5)),
            "updated_at": fmt(now - timedelta(days=5)),
        },
        {
            "title": "Basil seeds — Genovese & Thai varieties",
            "post_type": "Seed Swap",
            "description": "Looking to swap my surplus Genovese basil seeds for any chilli or tomato seeds. Open to other herbs too!",
            "author_name": "Ravi",
            "location": "Jurong West, Singapore",
            "contact_info": "Telegram: @ravi_grows",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=8)),
            "updated_at": fmt(now - timedelta(days=8)),
        },
        {
            "title": "Homemade worm compost available",
            "post_type": "Compost",
            "description": "I have ~5kg of vermicompost ready. Great for container gardens. Free but bring your own containers!",
            "author_name": "Marina",
            "location": "Buona Vista, Singapore",
            "contact_info": "marina.gardens@gmail.com",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=3)),
            "updated_at": fmt(now - timedelta(days=3)),
        },
        {
            "title": "Borrowing a soil pH meter",
            "post_type": "Tool Share",
            "description": "Happy to lend my soil pH meter for a week if you're in the Ang Mo Kio area. Just DM me.",
            "author_name": "James",
            "location": "Ang Mo Kio, Singapore",
            "contact_info": "james_garden",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=1)),
            "updated_at": fmt(now - timedelta(days=1)),
        },
        {
            "title": "Tip: How I revived my wilting tomato plants",
            "post_type": "Tip & Advice",
            "description": "After struggling with wilting tomatoes for weeks, I discovered the issue was calcium deficiency (blossom end rot). Adding crushed eggshells fixed it in 2 weeks!",
            "author_name": "Siti",
            "location": "Bedok, Singapore",
            "contact_info": "",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=12)),
            "updated_at": fmt(now - timedelta(days=12)),
        },
        {
            "title": "Free pothos — TAKEN",
            "post_type": "Free Plants",
            "description": "Had a large pothos that needed splitting. Already given away!",
            "author_name": "Lin",
            "location": "Bishan, Singapore",
            "contact_info": "",
            "is_available": False,
            "created_at": fmt(now - timedelta(days=15)),
            "updated_at": fmt(now - timedelta(days=10)),
        },
        {
            "title": "Cherry tomato seedlings — 3 available",
            "post_type": "Free Plants",
            "description": "Thinned my seedling tray. Have 3 healthy cherry tomato seedlings. Sungold variety. Pick up from Clementi.",
            "author_name": "Raj",
            "location": "Clementi, Singapore",
            "contact_info": "raj_plants@outlook.com",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=2)),
            "updated_at": fmt(now - timedelta(days=2)),
        },
        {
            "title": "Seed swap: spinach + bok choy for any herb seeds",
            "post_type": "Seed Swap",
            "description": "Have plenty of spinach (Bloomsdale) and bok choy seeds. Looking for any cooking herb seeds — cilantro, dill, chives.",
            "author_name": "Ananya",
            "location": "Queenstown, Singapore",
            "contact_info": "ananya.grows@gmail.com",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=4)),
            "updated_at": fmt(now - timedelta(days=4)),
        },
        {
            "title": "Beginner tip: the best soil for balcony herbs",
            "post_type": "Tip & Advice",
            "description": "After killing 3 sets of herbs in bad soil, I found the best mix: 60% potting mix + 30% perlite + 10% compost. Great drainage and nutrients!",
            "author_name": "Chen Wei",
            "location": "Toa Payoh, Singapore",
            "contact_info": "",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=20)),
            "updated_at": fmt(now - timedelta(days=20)),
        },
        {
            "title": "Bulk compost — coffee grounds from café",
            "post_type": "Compost",
            "description": "My friend owns a café and has coffee grounds available every Monday. Great for acid-loving plants. Quantities vary. Contact for pickup.",
            "author_name": "Yusuf",
            "location": "Katong, Singapore",
            "contact_info": "yusuf.green@gmail.com",
            "is_available": True,
            "created_at": fmt(now - timedelta(days=7)),
            "updated_at": fmt(now - timedelta(days=7)),
        },
    ]

    db.community_posts.insert_many(community_data)
    print(f"  ✓ Inserted {len(community_data)} community posts")

    # Create indexes
    db.plants.create_index([("garden_id", 1)])
    db.plants.create_index([("category", 1)])
    db.plants.create_index([("health_status", 1)])
    db.care_logs.create_index([("plant_id", 1)])
    db.care_logs.create_index([("date", -1)])
    db.community_posts.create_index([("post_type", 1)])
    print("  ✓ Created indexes")

    print("\n✅ Database seeding complete!")
    print(f"   Database: {MONGO_DB_NAME}")
    print(f"   Gardens: {len(garden_ids)}, Plants: {len(plant_ids)}, Care logs: {len(care_docs)}, Community: {len(community_data)}")


if __name__ == "__main__":
    seed()
