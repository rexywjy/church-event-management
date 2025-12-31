# Deployment Guide

## Prerequisites

1. **PostgreSQL Database** - **Self-hosted recommended** for full control. Alternatively: Supabase, Railway, Neon, or ElephantSQL
2. **Backend Hosting** - Render, VPS, or any Node.js hosting
3. **Frontend Hosting** - Vercel or any static hosting

## Database Setup

### Option 1: Self-Hosted PostgreSQL (Recommended)

**Why self-host?**
- Full control over your data
- No connection limits or pricing tiers
- Better performance and privacy
- Cost-effective for production

**Setup on Ubuntu/Debian:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE socsa;
CREATE USER socsa_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE socsa TO socsa_user;
\q

# Allow remote connections (edit postgresql.conf and pg_hba.conf)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql

# Your connection string:
# postgresql://socsa_user:your-secure-password@your-server-ip:5432/socsa
```

**Setup with Docker:**
```bash
docker run -d \
  --name socsa-postgres \
  -e POSTGRES_DB=socsa \
  -e POSTGRES_USER=socsa_user \
  -e POSTGRES_PASSWORD=your-secure-password \
  -p 5432:5432 \
  -v socsa-data:/var/lib/postgresql/data \
  postgres:14

# Connection string:
# postgresql://socsa_user:your-secure-password@localhost:5432/socsa
```

### Option 2: Supabase (Easy Setup)
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Copy connection string
4. Use the "Connection Pooling" string for production

### Option 3: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from database settings

### Option 4: Neon (Serverless)
1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

## Backend Deployment (Render)

### Option 1: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `socsa-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: `main`
5. Add environment variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Your Supabase connection string
   - `JWT_SECRET` = Generate a random 32+ character string
   - `JWT_EXPIRES_IN` = `7d`
   - `FRONTEND_URL` = Your Vercel frontend URL (add after frontend deployment)
6. Click **Create Web Service**

### Option 2: Using render.yaml

The `backend/render.yaml` file is already configured. Just:
1. Push your code to GitHub
2. Import the repository in Render
3. Render will auto-detect the `render.yaml` file
4. Set the environment variables in Render dashboard

### Run Database Migration

After deployment, run migrations:
1. Go to your Render service dashboard
2. Go to **Shell** tab
3. Run:
   ```bash
   npm run migrate
   ```

### Create First Superadmin

In Render Shell:
```bash
node src/scripts/create-superadmin.js
```

## Frontend Deployment (Vercel)

### Option 1: Using Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel
```

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` = Your Render backend URL (e.g., `https://socsa-backend.onrender.com`)
6. Click **Deploy**

### Update Backend with Frontend URL

After frontend deployment:
1. Go back to Render backend settings
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. The backend will automatically restart

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Superadmin account created
- [ ] Backend health check works: `https://your-backend.onrender.com/health`
- [ ] Frontend can connect to backend
- [ ] Login with superadmin works
- [ ] Create test event works
- [ ] User registration and approval flow works
- [ ] Event registration with queue system works

## Troubleshooting

### Backend Issues

**Cannot connect to database:**
- Verify DATABASE_URL is correct
- Check if database server is running
- Ensure connection string format: `postgresql://user:password@host:port/database`
- For managed PostgreSQL, check if IP whitelist is configured

**CORS errors:**
- Verify FRONTEND_URL matches your Vercel deployment exactly
- Include protocol (https://)
- No trailing slash

### Frontend Issues

**API requests failing:**
- Check VITE_API_URL is set correctly
- Verify backend is running: visit `/health` endpoint
- Check browser console for errors

**Build failures:**
- Run `npm install` locally first
- Check for any missing dependencies
- Verify Node.js version compatibility

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-strong-32-char-secret-generated-randomly
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local DATABASE_URL
npm run migrate
node src/scripts/create-superadmin.js
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:3001
npm run dev
```

## Monitoring

### Backend Logs
- Render Dashboard → Your Service → Logs

### Database
- Check your PostgreSQL provider's dashboard for logs
- For local: Use `psql` commands or pgAdmin

### Frontend
- Vercel Dashboard → Your Project → Deployments → View Logs

## Backup

### Database Backup
Most managed PostgreSQL providers offer automatic backups. Manual backup:
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restore
```bash
psql $DATABASE_URL < backup-20251231.sql
```

### Backup Best Practices
- Schedule daily backups
- Store backups in separate location (S3, Google Drive, etc.)
- Test restore process regularly

## Scaling

### Backend
- Render: Upgrade to higher tier for more resources
- Consider adding Redis for caching if needed

### Database
- Upgrade to higher tier for more connections/storage
- Monitor connection pool usage
- Consider connection pooling (PgBouncer) for high traffic
- Add read replicas if needed

### Frontend
- Vercel handles scaling automatically
- Consider CDN caching for static assets

## Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] Database credentials are not in code
- [ ] CORS is configured correctly
- [ ] SSL/HTTPS enabled on all services
- [ ] Environment variables are secret
- [ ] Password hashing with Argon2 is working
- [ ] SQL injection prevention (using parameterized queries)

## Support

For issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check database connections

## Updates

To update the application:
1. Push changes to GitHub
2. Render automatically redeploys backend
3. Vercel automatically redeploys frontend
4. Run migrations if schema changed
