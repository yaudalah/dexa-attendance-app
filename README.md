# Dexa App

HR & Attendance Management System dengan arsitektur microservices.

## Tech Stack

- **Infrastructure**: Docker (PostgreSQL, Kafka, Zookeeper, Redis)
- **Backend**: NestJS, TypeORM, Kafka, Socket.IO
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Redux Toolkit

## Quick Start

### Option A: Automated (Mac / Apple Silicon)

```bash
# Full setup (Docker, DB, deps, seed)
./scripts/setup.sh

# Run entire app
./scripts/run.sh
```

### Option B: Manual

1. **Setup Environment**

```bash
cp .env.example .env
# Edit .env dengan nilai konfigurasi Anda (Cloudinary, JWT_SECRET, dll)
```

2. **Start Infrastructure**

```bash
docker compose up -d
```

3. **Initialize Database** (optional if using TypeORM synchronize)

```bash
./scripts/run-sql.sh
```

4. **Install Dependencies**

```bash
npm install
```

5. **Run Backend API**

```bash
npm run api:dev
```

Tunggu hingga database sync. Lalu buat admin user:

```bash
cd apps/api && npm run seed
# Login: admin@dexa.com / admin123
```

6. **Run Audit Service** (terminal lain)

```bash
npm run audit:dev
```

7. **Run Frontend** (terminal lain)

```bash
npm run frontend:dev
```

Buka http://localhost:5173

## Environment Variables

| Variable | Description |
|----------|-------------|
| POSTGRES_* | PostgreSQL connection |
| KAFKA_BROKERS | Kafka brokers (default: localhost:9092) |
| REDIS_URL | Redis URL (default: redis://localhost:6379) |
| REDIS_CACHE_TTL | Cache TTL in seconds (default: 3600) |
| JWT_SECRET | JWT signing secret |
| CLOUDINARY_* | Cloudinary credentials for photo upload |

## API Endpoints

- `POST /auth/login` - Login
- `GET /employees/me` - Get current user
- `GET /employees` - List employees (Admin)
- `POST /employees` - Create employee (Admin)
- `PUT /employees/:id` - Update employee
- `POST /employees/:id/photo` - Upload photo
- `POST /attendance` - Check-in/Check-out
- `GET /attendance/history` - Attendance history
- `GET /attendance/monitoring` - Monitoring stream (Admin)

## WebSocket

- Event `profile-updated` - Emitted when employee profile is updated (Admin receives toast)
