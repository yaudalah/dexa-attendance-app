#!/usr/bin/env bash
# Run init-db.sql on Mac (Apple Silicon compatible)
# Uses Docker exec if psql is not installed locally

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SQL_FILE="${1:-$SCRIPT_DIR/init-db.sql}"

# Load .env if exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-dexa}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-dexa_secret}"
POSTGRES_DB="${POSTGRES_DB:-dexa_db}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

if [ ! -f "$SQL_FILE" ]; then
  echo "Error: SQL file not found: $SQL_FILE"
  exit 1
fi

run_via_docker() {
  echo "Running SQL via Docker (dexa-postgres container)..."
  docker exec -i dexa-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$SQL_FILE"
}

run_via_psql() {
  echo "Running SQL via local psql..."
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$SQL_FILE"
}

# Prefer Docker if container is running
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^dexa-postgres$'; then
  run_via_docker
# Fallback to local psql
elif command -v psql &>/dev/null; then
  run_via_psql
else
  echo "Error: Neither dexa-postgres Docker container nor psql found."
  echo "Start Docker first: docker compose up -d"
  exit 1
fi

echo "Database setup complete."
