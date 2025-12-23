# Shirin Magazin - Backend

## Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Run the server:
```bash
python main.py
```

Server will run on http://localhost:8000

## Default Admin Credentials
- Username: admin
- Password: admin123

## API Documentation
Visit http://localhost:8000/docs for interactive API documentation

## Run with Docker (recommended)

Create a `.env` (either in repo root or `backend/.env`):

```
SECRET_KEY=change_me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///./shop.db
```

From repo root:

```bash
docker compose up -d --build backend
```

Then open http://localhost:8000

## Deployment to Render

Use `render.yaml` at the repo root for automatic provisioning.

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Persistent Disk `/var/data` for SQLite

Environment variables on Render:

```
DATABASE_URL=sqlite:////var/data/shop.db
SECRET_KEY=your-secure-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password
ALLOWED_ORIGINS=https://your-frontend.example
```
