#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# Pocket Garden — Backend Setup & Launch Script
# Usage: bash start_backend.sh
# ──────────────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "🌿 Pocket Garden — Python/Flask Backend"
echo "========================================"

# 1. Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 is not installed. Please install it from https://python.org"
  exit 1
fi
echo "✓ Python $(python3 --version | awk '{print $2}') found"

# 2. Create venv if needed
if [ ! -d "venv" ]; then
  echo "→ Creating virtual environment..."
  python3 -m venv venv
  echo "✓ Virtual environment created"
fi

# 3. Activate venv and install deps
echo "→ Installing Python dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt
echo "✓ Dependencies installed"

# 4. Check MongoDB
if ! command -v mongod &>/dev/null && ! pgrep -x mongod &>/dev/null; then
  echo ""
  echo "⚠️  MongoDB does not appear to be running."
  echo "   Start MongoDB first:  brew services start mongodb-community"
  echo "   or:                   mongod --dbpath /usr/local/var/mongodb"
  echo ""
fi

# 5. Optional: seed database
if [ "$1" = "--seed" ]; then
  echo "→ Seeding database with sample data..."
  python seed.py
fi

# 6. Start Flask
echo ""
echo "🚀 Starting Flask API on http://localhost:5000"
echo "   Health check: http://localhost:5000/api/health"
echo "   Press Ctrl+C to stop."
echo ""
python app.py
