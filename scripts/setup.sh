#!/usr/bin/env bash
# Full project setup for Dexa App - Mac (Apple Silicon compatible)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Dexa App - Project Setup ==="
cd "$PROJECT_ROOT"

# 1. Check Docker
if ! command -v docker &>/dev/null; then
  echo "Error: Docker is required. Install from https://www.docker.com/products/docker-desktop"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo "Error: Docker daemon is not running. Start Docker Desktop."
  exit 1
fi

echo "✓ Docker is running"

# 2. Copy .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✓ Created .env from .env.example"
else
  echo "✓ .env already exists"
fi

# 3. Start infrastructure
echo ""
echo "Starting Docker containers (PostgreSQL, Kafka, Zookeeper, Redis)..."
(docker compose up -d 2>/dev/null || docker-compose up -d)

# 4. Wait for PostgreSQL
echo ""
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker exec dexa-postgres pg_isready -U dexa -d dexa_db 2>/dev/null; then
    echo "✓ PostgreSQL is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Error: PostgreSQL failed to start"
    exit 1
  fi
  sleep 1
done

# 5. Run database init
echo ""
echo "Initializing database schema..."
"$SCRIPT_DIR/run-sql.sh"

# 6. Install npm dependencies
echo ""
echo "Installing npm dependencies (this may take a few minutes)..."
npm install

# 7. Seed admin user (optional - API uses synchronize:true in dev, so tables may already exist)
echo ""
echo "Seeding admin user..."
cd apps/api
if npm run seed 2>/dev/null; then
  echo "✓ Admin user created (admin@dexa.com / admin123)"
else
  echo "Note: Seed may have failed if tables already exist. Run 'npm run seed' manually after first API start."
fi
cd "$PROJECT_ROOT"

# 8. Frontend .env
if [ ! -f apps/frontend/.env ]; then
  cp apps/frontend/.env.example apps/frontend/.env 2>/dev/null || true
  echo "✓ Created apps/frontend/.env"
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "Run the app: ./scripts/run.sh"
echo "Or manually:"
echo "  npm run api:dev     # Terminal 1"
echo "  npm run audit:dev   # Terminal 2"
echo "  npm run frontend:dev # Terminal 3"
