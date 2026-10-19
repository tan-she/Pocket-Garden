# 🌿 Pocket Garden

**Urban Micro-Gardening Platform — CA2 Assignment**  
*Small Spaces. Greener Living.*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend API | Python 3 + Flask |
| Database | MongoDB (v8) |
| DB Integration | **PyMongo** |
| HTTP Client | Axios |
| Routing | React Router v6 |

---

## Project Structure

```
Pocket Garden/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── pages/             # All route pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── GardensPage.jsx      ← CRUD gardens
│   │   │   ├── PlantsPage.jsx       ← CRUD plants
│   │   │   ├── PlantFormPage.jsx    ← Add/edit form
│   │   │   ├── PlantDetailPage.jsx  ← Plant detail + care history
│   │   │   ├── CareLogPage.jsx      ← CRUD care logs
│   │   │   ├── CommunityPage.jsx    ← CRUD community posts
│   │   │   └── AnalyticsPage.jsx    ← Recharts + aggregations
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   └── ui/            # Shared UI components
│   │   ├── services/
│   │   │   └── api.js         # Axios API service layer
│   │   ├── App.jsx            # Router
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   ├── vite.config.js         # Proxy → Flask :5001
│   └── tailwind.config.js
│
└── backend/                   # Python Flask API
    ├── app.py                 # Flask application factory
    ├── database.py            # PyMongo connection + indexes
    ├── validators.py          # Schema validation (all collections)
    ├── utils.py               # ObjectId serialiser, helpers
    ├── seed.py                # Sample data seeder
    ├── requirements.txt
    ├── .env                   # MONGO_URI, DB name, port
    └── routes/
        ├── gardens.py         ← Full CRUD + $lookup aggregation
        ├── plants.py          ← Full CRUD + cascade delete
        ├── care_logs.py       ← Full CRUD + activity summary
        ├── community.py       ← Full CRUD + type filter
        └── analytics.py       ← 4 aggregation pipelines
```

---

## MongoDB Collections & Schema

### `gardens`
```json
{ "name": "str (required)", "type": "Balcony|Windowsill|Rooftop|Indoor|Vertical|Container",
  "location": "str", "sunlight": "enum", "area_sqft": "float",
  "notes": "str", "created_at": "ISO", "updated_at": "ISO" }
```

### `plants`
```json
{ "name": "str (required)", "scientific_name": "str", "category": "Herb|Vegetable|...",
  "emoji": "str", "garden_id": "ObjectId (ref: gardens)", "garden_name": "str (denorm)",
  "sunlight_hours_per_day": "float 0–24", "watering_frequency_days": "int 1–365",
  "health_status": "Healthy|Wilting|Diseased|Dormant",
  "date_planted": "date", "soil_type": "str", "pot_size_cm": "float",
  "fertilizer_frequency_weeks": "int", "notes": "str" }
```

### `care_logs`
```json
{ "plant_id": "ObjectId (required)", "plant_name": "str (denorm)", "plant_emoji": "str",
  "activity_type": "Watering|Fertilizing|Pruning|Repotting|Pest Control|Health Check|Other",
  "date": "YYYY-MM-DD (required)", "notes": "str",
  "quantity_ml": "float", "duration_minutes": "float" }
```

### `community_posts`
```json
{ "title": "str (required, min 5)", "post_type": "Seed Swap|Plant Cutting|Compost|Tool Share|Tip & Advice|Free Plants",
  "description": "str (required)", "author_name": "str", "location": "str",
  "contact_info": "str", "is_available": "bool" }
```

---

## MongoDB Aggregation Pipelines

| Endpoint | Pipeline |
|----------|---------|
| `GET /api/gardens` | `$lookup` plants, `$addFields` plant_count |
| `GET /api/analytics/dashboard` | `$facet` healthy count + total, `$group` by activity_type |
| `GET /api/analytics/care-activity` | `$match` last 30d, `$group` by date |
| `GET /api/analytics/popular-categories` | `$group` by category, `$sort` count desc |
| `GET /api/analytics/survival-rates` | `$match` + `$group` by health_status |

---

## How to Run

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- MongoDB running locally on port 27017

### 1. Start MongoDB
```bash
brew services start mongodb-community
# or
mongod
```

### 2. Start Backend (Flask + PyMongo)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed sample data (first time only):
python seed.py

# Start API server:
python app.py
# → Running on http://localhost:5001
```

### 3. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

### 4. Open App
Visit **http://localhost:5173**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + DB status |
| GET/POST | `/api/gardens` | List all / Create garden |
| GET/PUT/DELETE | `/api/gardens/:id` | Read / Update / Delete garden |
| GET/POST | `/api/plants` | List all / Create plant |
| GET/PUT/DELETE | `/api/plants/:id` | Read / Update / Delete plant |
| GET/POST | `/api/care-logs` | List all / Log care activity |
| GET/PUT/DELETE | `/api/care-logs/:id` | Read / Update / Delete log |
| GET/POST | `/api/community` | List all / Create post |
| GET/PUT/DELETE | `/api/community/:id` | Read / Update / Delete post |
| GET | `/api/analytics/dashboard` | KPI stats |
| GET | `/api/analytics/care-activity` | Timeline (last 30 days) |
| GET | `/api/analytics/popular-categories` | Plant category breakdown |
| GET | `/api/analytics/survival-rates` | Health status distribution |

---

## Assignment Requirements Coverage

| Requirement (30 marks) | Implementation |
|------------------------|----------------|
| Document design | 4 collections: users, gardens, plants, care_logs, community_posts |
| Validation | Required fields, enum categories, sunlight/watering ranges, data types |
| CRUD — Create | Add plants, gardens, care logs, community posts |
| CRUD — Read | List + detail views for all collections |
| CRUD — Update | Edit forms for all collections |
| CRUD — Delete | Delete with cascade (garden → plants → care logs) |
| Aggregation 1 | Plant counts per garden (`$lookup`) |
| Aggregation 2 | Care activity summary by type (`$group`) |
| Aggregation 3 | Plant survival rates by health status (`$group + $facet`) |
| Aggregation 4 | Popular plant categories (`$group + $sort`) |
| Aggregation 5 | Care timeline last 30 days (`$match + $group + $dateToString`) |
| PyMongo | All DB ops via `pymongo.MongoClient` in `database.py` |
| Demonstration | Full React SPA with real MongoDB-backed features |
