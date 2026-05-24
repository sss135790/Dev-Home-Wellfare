# Dev_Homes Welfare Society (Society Portal)

A full-stack society management portal for residents and admins.

### 👤 Member Login
- **Username:** `member`
- **Password:** `member`

### 🛠️ Admin Login
- **Username:** `admin1`
- **Password:** `admin1`

## Features

- **Notice Board** (admin can create)
- **Maintenance Bills & Payments**
- **Complaints** (admin can update complaint status)
- **Decision Voting (Polls)** (admin can create polls; users can vote)
- **Society Rules** (static UI content)
- **Emergency Contacts** (static UI content)
- **Authentication** with JWT + **OTP-based admin verification** during registration

## Tech Stack

- **Frontend:** Next.js (React + TailwindCSS)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (SQLAlchemy ORM)

## Repository Layout

- `backend/` — FastAPI application
- `frontend/` — Next.js application
- `docker-compose.yml` — local dev orchestration

## Backend (FastAPI)

Path: `backend/`

### Startup
- FastAPI app is defined in `backend/main.py`
- Database tables are created on import:
  - `models.Base.metadata.create_all(bind=engine)`
- On startup, it seeds demo data via:
  - `seed_db()` (runs once if the `admin` user exists)

### Auth
- JWT is required for protected endpoints.
- Client must send:
  - `Authorization: Bearer <JWT>`

### API Endpoints

Auth:
- `POST /api/auth/send-otp`
- `POST /api/auth/register`
- `POST /api/auth/login`

Notices:
- `GET  /api/notices`
- `POST /api/notices` (admin only)

Complaints:
- `GET  /api/complaints`
- `POST /api/complaints`
- `PATCH /api/complaints/{complaint_id}` (admin only)

Polls:
- `GET  /api/polls`
- `POST /api/polls` (admin only)
- `POST /api/polls/{poll_id}/vote`

Maintenance:
- `GET  /api/maintenance`
- `POST /api/maintenance/{bill_id}/pay`

## Frontend (Next.js)

Path: `frontend/`

- Runs the UI at `http://localhost:3000`
- The main page (`frontend/src/app/page.tsx`) renders tabs for:
  - Notices, Tour, Maintenance, Complaints, Voting, Rules, Emergency
- Session persistence:
  - `localStorage.society_token`
  - `localStorage.society_user`

## Running the Project (Docker Compose)

Prerequisite: Docker + Docker Compose.

### 1) Start all services
From the repo root (where `docker-compose.yml` lives):

```bash
docker-compose up --build
```

### 2) Open the apps
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Services

- **PostgreSQL** (`postgres:15-alpine`)
  - port: `5432` (host)
- **backend**
  - port: `8000` (host)
- **frontend**
  - port: `3000` (host)

## Demo/Seed Data

On first run (or when `admin` doesn’t exist yet), the backend seeds:

- Admin
  - `username`: `admin`
  - `password`: `admin123`
  - `role`: `admin`

- Members
  - `member1` / `member123`
  - `member2` / `member123`

It also creates initial:
- Notices
- Voting polls
- Maintenance bills for year 2026
- A few example complaints

## Local Development (Without Docker)

### Backend
From `backend/`:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
From `frontend/`:

```bash
npm install
npm run dev
```

## Environment Variables

The backend expects variables (typically via `.env` in local dev, and via `docker-compose.yml` for Docker):

- `DATABASE_URL`
- `JWT_SECRET`
- `ALGORITHM` (optional; otherwise may default internally)
- `OTP_EXPIRY_MINUTES` (optional; default used in code)
- `EMAIL`, `PASSWORD` (for OTP email sending)

## Security Notes (Important)

- OTP storage is currently an in-memory dict (in `backend/utils/otp.py`).
  - OTPs will be lost on backend restart and are not shared across multiple backend instances.
- CORS is configured as `allow_origins=["*"]` (development-friendly).

## License

Add license text as needed.

