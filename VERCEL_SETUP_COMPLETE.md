# Vercel Deployment Summary

## ✅ Changes Made

### 1. Created `/api` Directory Structure
- **api/index.py** - Main FastAPI app with Mangum adapter for serverless
- **api/auth.py** - Authentication functions (copied from backend)
- **api/database.py** - Database configuration (copied from backend)
- **api/models.py** - SQLAlchemy models (copied from backend)
- **api/schemas.py** - Pydantic schemas (copied from backend)

### 2. Configuration Files
- **vercel.json** - Routes all requests to api/index.py
- **requirements.txt** - Dependencies including mangum for serverless
- **.vercelignore** - Excludes unnecessary files from deployment
- **.env.vercel** - Example environment variables

### 3. Documentation
- **VERCEL_DEPLOYMENT.md** - Complete deployment guide

## 🚀 How It Works

### Vercel Serverless Functions
- All API routes are handled by `/api/index.py`
- Mangum adapter converts FastAPI to ASGI-compatible serverless handler
- Each request spawns a new serverless function instance

### API Endpoints Available
All endpoints work at root path (no `/api` prefix needed):

```
POST /auth/login
POST /auth/register
GET /auth/me
GET /categories
POST /categories
GET /products
POST /products
GET /cart
POST /cart
```

### Example Request
```bash
# Local
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Vercel (after deployment)
curl -X POST https://your-project.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## 📝 Next Steps

### 1. Deploy to Vercel
```bash
# Option A: Via CLI
vercel

# Option B: Connect GitHub to Vercel Dashboard
# Vercel will auto-deploy on every push
```

### 2. Set Environment Variables in Vercel
Go to: Project Settings → Environment Variables

Add:
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=your-secure-password`
- `SECRET_KEY=your-secret-jwt-key`
- `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
- `DATABASE_URL=sqlite:///./database.db` (or PostgreSQL URL)

### 3. Update Frontend API URL
In your frontend `.env`:
```
VITE_API_URL=https://your-backend.vercel.app
```

### 4. Test the Deployment
```bash
# Test login endpoint
curl https://your-project.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## ⚠️ Important Notes

### Database Considerations
- **SQLite** works on Vercel but is NOT recommended for production
- Each serverless function has its own filesystem (ephemeral)
- **Recommended**: Use Vercel Postgres, Supabase, or PlanetScale

### To Use PostgreSQL:
1. Create a Vercel Postgres database
2. Update `DATABASE_URL` environment variable
3. Database will persist across requests

### CORS Configuration
- Update `ALLOWED_ORIGINS` to include your frontend domain
- Multiple origins: `https://domain1.com,https://domain2.com`

### Admin Credentials
- Default: `admin` / `admin123`
- **Change immediately in production!**

## 🔍 Troubleshooting

### 404 Error
- Check vercel.json routing configuration
- Ensure api/index.py has `handler = Mangum(app)`

### Import Errors
- All modules must be in /api directory
- Check requirements.txt includes all dependencies

### Database Errors
- Verify DATABASE_URL environment variable
- Consider using PostgreSQL instead of SQLite

### CORS Errors
- Add frontend domain to ALLOWED_ORIGINS
- Use `*` for development only

## 📦 Dependencies Added
- `mangum==0.17.0` - ASGI adapter for serverless functions

## ✅ Status
**Ready to deploy!** Push to GitHub or run `vercel` command.
