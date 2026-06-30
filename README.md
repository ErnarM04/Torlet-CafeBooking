# DiplomaCafeBooking

## Run with Docker

This starts:
- PostgreSQL
- Django backend (auto-runs migrations and seeds demo data)
- React (Vite) frontend

### Prerequisites
- Install Docker + Docker Compose.
- Ensure `backend/.env` exists and contains your AI key (if you want AI) and Postgres settings:
  - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

### Start

```bash
cd ~/Desktop/DiplomaCafeBooking
sudo docker compose up -d --build
```

### Open
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- PostgreSQL (inside container): available on the internal network. Exposed on host as `localhost:5434`.

### Logs

```bash
sudo docker compose logs -f django
sudo docker compose logs -f frontend
sudo docker compose logs -f postgres
```

### Stop

```bash
sudo docker compose down -v
```

## Deploy to Fly (separate stacks)

Use 3 Fly apps:
- `torlet-db` (Postgres)
- `torlet-backend` (Django API)
- `torlet-frontend` (React site)

Config files in repo root:
- `fly.backend.toml`
- `fly.frontend.toml`

### 1) Create DB and apps

```bash
fly postgres create --name torlet-db --region arn
fly apps create torlet-backend
fly apps create torlet-frontend
```

### 2) Attach DB and set backend secrets

```bash
fly postgres attach --app torlet-backend torlet-db
fly secrets set -a torletbackend SECRET_KEY="change-me" DEBUG="False"
```

If the browser shows **CORS Missing Allow Origin**, the backend must allow your frontend origin (e.g. `https://torlet.fly.dev`). This is configured in `backend/config/settings.py` and via optional secret:

```bash
fly secrets set -a torletbackend CORS_ALLOWED_ORIGINS="https://torlet.fly.dev"
```

Redeploy the backend after changing CORS:

```bash
fly deploy -c fly.backend.toml
```

### 3) Deploy backend

```bash
fly deploy -c fly.backend.toml
```

### 4) Deploy frontend

`fly.frontend.toml` already points API to:
- `https://torletbackend.fly.dev/api`

Then deploy:

```bash
fly deploy -c fly.frontend.toml
```

### 5) Open
- Backend API: `https://torlet-backend.fly.dev/api`
- Frontend: `https://torlet-frontend.fly.dev`