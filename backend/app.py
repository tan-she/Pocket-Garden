"""
Pocket Garden — Flask Application Entry Point
=============================================
Backend API for the Pocket Garden micro-gardening platform.
Stack: Python + Flask + PyMongo + MongoDB

Collections:
  - gardens         (garden spaces)
  - plants          (plants in gardens)
  - care_logs       (plant care activity history)
  - community_posts (community exchange board)

Run:
  python app.py
  or
  flask run --port 5000
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from database import get_db
from routes.gardens import gardens_bp
from routes.plants import plants_bp
from routes.care_logs import care_logs_bp
from routes.community import community_bp
from routes.analytics import analytics_bp

load_dotenv()


def create_app():
    app = Flask(__name__)

    # Allow requests from the Vite dev server
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"]}})

    # Register blueprints
    app.register_blueprint(gardens_bp)
    app.register_blueprint(plants_bp)
    app.register_blueprint(care_logs_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(analytics_bp)

    # ── Health check ──────────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health():
        try:
            db = get_db()
            db.command("ping")
            return jsonify({"status": "ok", "database": "connected", "collections": db.list_collection_names()})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 503

    # ── Global error handlers ─────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error.", "detail": str(e)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    print(f"\n🌿 Pocket Garden API starting on http://localhost:{port}")
    print(f"   Database: {os.getenv('MONGO_URI')} / {os.getenv('MONGO_DB_NAME')}")
    print(f"   Health:   http://localhost:{port}/api/health\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
