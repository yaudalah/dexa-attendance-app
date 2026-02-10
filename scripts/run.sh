#!/usr/bin/env bash
# Run entire Dexa App - Mac (Apple Silicon compatible)
# Starts API, Audit service, and Frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Ensure Docker containers are running
if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^dexa-postgres$'; then
  echo "Starting Docker containers..."
  (docker compose up -d 2>/dev/null || docker-compose up -d)
  echo "Waiting for services..."
  sleep 10
fi

# Cleanup function
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $API_PID $AUDIT_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "=== Starting Dexa App ==="
echo ""
echo "API:      http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start API in background
npm run api:dev &
API_PID=$!

# Wait for API to be ready before starting Audit (needs DB)
sleep 5

# Start Audit service in background
npm run audit:dev &
AUDIT_PID=$!

# Start Frontend in background
npm run frontend:dev &
FRONTEND_PID=$!

# Wait for all (Ctrl+C triggers cleanup)
wait
