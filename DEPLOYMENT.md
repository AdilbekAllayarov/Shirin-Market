# Deployment Guide - Shirin Magazin

## Hosting Options

### Docker Compose (Local/Server)

This repository includes Dockerfiles and `docker-compose.yml` to run both services.

1. Create a `.env` next to `docker-compose.yml`:

```
SECRET_KEY=change_me
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=http://localhost:3000
VITE_API_URL=http://localhost:8000
```

2. Build and start:

```bash
docker compose build
docker compose up -d
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

For a server/domain, set `ALLOWED_ORIGINS` and `VITE_API_URL` to your public URLs, and add HTTPS via a reverse proxy.

### 1. Render.com (Recommended - Free Tier)

#### Backend Deployment
1. Push code to GitHub
2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `shirin-magazin-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   ```
   SECRET_KEY=your-random-secret-key-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
7. Click "Create Web Service"
8. Note your backend URL: `https://shirin-magazin-backend.onrender.com`

#### Frontend Deployment (Vercel)
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend2`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://shirin-magazin-backend.onrender.com
   ```
5. Update `frontend2/js/config.js`:
   ```javascript
   const API_URL = 'https://shirin-magazin-backend.onrender.com';
   ```
6. Deploy

---

### 2. Railway.app (All-in-one)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect and deploy both services
6. Add environment variables in dashboard
7. Connect frontend to backend URL

---

### 3. Docker Deployment (VPS/DigitalOcean)

#### Prerequisites
- VPS with Docker installed
- Domain name (optional)

#### Steps
1. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```

2. Clone repository:
   ```bash
   git clone https://github.com/AdilbekAllayarov/Shirin-Magazin.git
   cd Shirin-Magazin
   ```

3. Create `.env` file:
   ```bash
   SECRET_KEY=your-secret-key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=secure-password
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

5. Setup Nginx reverse proxy (optional):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location / {
           root /path/to/Shirin-Magazin/frontend2;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

6. Install SSL with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Pre-Deployment Checklist

### Security
- [ ] Change `SECRET_KEY` to random 32+ character string
- [ ] Change default admin password
- [ ] Set `ALLOWED_ORIGINS` to specific domain (not `*`)
- [ ] Review all `.env` variables
- [ ] Add `.env` to `.gitignore` (already done)
- [ ] Never commit database file (`shop.db`)

### Configuration
- [ ] Update API URL in `frontend2/js/config.js`
- [ ] Test all API endpoints
- [ ] Verify CORS settings
- [ ] Check admin panel access

### Database
- [ ] For production, consider PostgreSQL instead of SQLite
- [ ] Setup automated backups
- [ ] Test database migrations

---

## Environment Variables Reference

### Backend
```env
DATABASE_URL=sqlite:///./shop.db
SECRET_KEY=your-secure-random-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ALLOWED_ORIGINS=https://frontend.com,https://www.frontend.com
```

### Frontend (if using build process)
```env
VITE_API_URL=https://your-backend-url.com
```

---

## PostgreSQL Migration (for production)

1. Install PostgreSQL adapter:
   ```bash
   pip install psycopg2-binary
   ```

2. Update `requirements.txt`:
   ```
   psycopg2-binary==2.9.9
   ```

3. Change `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

4. Update `backend/database.py`:
   ```python
   # Remove SQLite-specific connect_args
   engine = create_engine(DATABASE_URL)
   ```

5. Create tables:
   ```bash
   python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

---

## Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.com/categories
```

### Frontend Test
Open browser: `https://your-frontend-url.com`
- Test guest cart
- Test admin login
- Test product CRUD
- Test mobile responsiveness

---

## Common Issues

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check protocol (http vs https)
- Ensure no trailing slashes

### Database Connection
- SQLite: Check file permissions
- PostgreSQL: Verify connection string format
- Railway/Render: Use provided DATABASE_URL

### Port Issues
- Render: Use `$PORT` environment variable
- VPS: Check firewall rules
- Docker: Verify port mappings

---

## Monitoring & Maintenance

### Free Monitoring Tools
- **Uptime**: UptimeRobot.com
- **Analytics**: Google Analytics
- **Errors**: Sentry.io (free tier)
- **Logs**: Check hosting provider dashboard

### Backup Strategy
1. Export database weekly:
   ```bash
   sqlite3 shop.db .dump > backup.sql
   ```
2. Store backups in separate location
3. Test restore procedure

---

## Cost Estimate (Free Tier)

- **Render.com**: Free (backend sleeps after 15min inactivity)
- **Vercel**: Free (frontend, unlimited bandwidth)
- **Railway**: $5/month credit (good for small apps)
- **Total**: $0-5/month for small traffic

---

## Support & Updates

After deployment, monitor:
- Server uptime
- API response times
- Error rates
- User feedback

Update deployment:
```bash
git push origin main
# Auto-deploys on Render/Vercel
```

---

**Good luck with your deployment!** 🚀
