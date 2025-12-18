# Vercel Deployment Guide

## Backend API Setup

The backend is configured to work as Vercel serverless functions.

### File Structure
```
/api
  ├── index.py         # Main FastAPI app entry point
  ├── auth.py          # Authentication logic
  ├── database.py      # Database configuration  
  ├── models.py        # SQLAlchemy models
  └── schemas.py       # Pydantic schemas
```

### Environment Variables

Set these in your Vercel project settings:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=https://your-frontend.vercel.app
DATABASE_URL=sqlite:///./database.db
```

### API Endpoints

All endpoints are available at: `https://your-project.vercel.app/`

- **POST /auth/login** - User login
- **POST /auth/register** - User registration
- **GET /auth/me** - Get current user
- **GET /categories** - List categories
- **POST /categories** - Create category (admin only)
- **GET /products** - List products
- **POST /products** - Create product (admin only)
- **GET /cart** - Get user cart
- **POST /cart** - Add to cart

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   vercel
   ```

3. **Or connect GitHub** to Vercel Dashboard for automatic deployments

4. **Set environment variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.vercel`

### Notes

- Database: Uses SQLite by default (not recommended for production)
- For production, use PostgreSQL via Vercel Postgres or external provider
- Update `ALLOWED_ORIGINS` to match your frontend domain
- Generate a secure `SECRET_KEY` for production

### Login Credentials (Default)

- **Username**: admin
- **Password**: admin123

**⚠️ Change these in production!**
