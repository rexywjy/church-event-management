# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Backend Deployed** - Your backend should already be deployed (Render, Railway, etc.)

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click **"Add New Project"**

2. **Import Repository**
   - Click **"Import Git Repository"**
   - Select your GitHub repository
   - If not visible, configure GitHub App permissions

3. **Configure Project** (IMPORTANT - Set these correctly!)
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ⚠️ **MUST BE SET TO frontend**
   - **Build Command**: Leave as default OR `npm run build`
   - **Output Directory**: Leave as default OR `dist`
   - **Install Command**: Leave as default OR `npm install`
   
   **Note**: Setting Root Directory to `frontend` is crucial. This tells Vercel to build from the frontend subdirectory.

4. **Add Environment Variables**
   Click **"Environment Variables"** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://socsa-backend.onrender.com`)
   - **Environments**: Production, Preview, Development (all selected)

5. **Deploy**
   - Click **"Deploy"**
   - Wait 1-2 minutes for deployment to complete
   - You'll get a URL like: `https://your-app.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (first time - follow prompts)
vercel

# For production deployment
vercel --prod
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: socsa-frontend (or your preference)
- **Directory**: `./` (current directory is already frontend)
- **Override settings**: No

## Step 3: Configure Environment Variables (CLI Method)

```bash
# Add production environment variable
vercel env add VITE_API_URL production

# When prompted, paste your backend URL
# Example: https://socsa-backend.onrender.com

# Add preview environment variable
vercel env add VITE_API_URL preview

# Add development environment variable
vercel env add VITE_API_URL development
```

## Step 4: Update Backend CORS

After frontend deployment, update your backend's `FRONTEND_URL` environment variable:

**Render Dashboard:**
1. Go to your backend service
2. Navigate to **Environment** section
3. Update `FRONTEND_URL` to your Vercel URL
4. Example: `https://your-app.vercel.app`
5. Save changes (backend will auto-restart)

## Step 5: Verify Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check if the app loads correctly

2. **Test API Connection**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Try logging in
   - Check Network tab for API calls

3. **Test Full Flow**
   - Login with superadmin credentials
   - Create a test event
   - Register for an event
   - Verify all features work

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update backend `FRONTEND_URL` to use custom domain

### Auto-Deploy on Git Push

Vercel automatically deploys when you push to GitHub:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable auto-deploy:
1. Project Settings → Git
2. Toggle deployment settings

### Environment Variables Management

To update environment variables:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Edit or add variables
3. Redeploy for changes to take effect

**CLI Method:**
```bash
vercel env ls                    # List all environment variables
vercel env add VARIABLE_NAME     # Add new variable
vercel env rm VARIABLE_NAME      # Remove variable
```

## Troubleshooting

### Build Fails

**Error: "Command failed with exit code 1"**
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Test build locally: `npm run build`

**Error: "Cannot find module"**
- Missing dependency in `package.json`
- Run `npm install` locally and commit updated `package-lock.json`

### API Connection Issues

**Error: "Network Error" or CORS errors**
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend `FRONTEND_URL` matches Vercel URL exactly
- Include `https://` protocol
- No trailing slash

**Check environment variables:**
```bash
vercel env ls
```

### Blank Page After Deployment

- Check browser console for errors
- Verify routing configuration in `vercel.json`
- Ensure `index.html` exists in `dist` folder after build

### Build Succeeds but App Crashes

- Open browser DevTools → Console
- Look for JavaScript errors
- Check if environment variables are loaded
- Verify API URL is correct

## Local Testing Before Deploy

```bash
# Install updated dependencies
cd frontend
npm install

# Build the app
npm run build

# Test the build locally
npm run preview

# Visit http://localhost:4173
```

## Continuous Deployment Workflow

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 4. Vercel auto-deploys
# 5. Check deployment status in Vercel dashboard
```

## Monitoring & Analytics

### View Deployment Logs
1. Vercel Dashboard → Deployments
2. Click on a deployment
3. View build and runtime logs

### Performance Monitoring
- Vercel Dashboard → Analytics
- View page load times, Web Vitals, etc.

### Error Tracking
- Check Runtime Logs in Vercel dashboard
- Consider integrating Sentry for error tracking

## Security Best Practices

- ✅ Never commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS (automatic on Vercel)
- ✅ Keep dependencies updated
- ✅ Review Vercel security settings
- ✅ Use Vercel's built-in DDoS protection

## Performance Optimization

### Enable Caching
Already configured in `vercel.json`:
- Static assets cached for 1 year
- Proper cache headers for builds

### Edge Network
Vercel automatically distributes your app globally via CDN.

### Compression
Vercel automatically compresses responses with gzip/brotli.

## Rollback Deployment

If something goes wrong:

1. Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click **"Promote to Production"**
4. Instant rollback!

## Cost Estimate

**Vercel Free Tier:**
- Perfect for this app
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN

**Pro Tier ($20/month):**
- If you need more bandwidth
- Password protection
- Advanced analytics

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Inspect deployment
vercel inspect [deployment-url]

# Pull environment variables
vercel env pull

# Link local project to Vercel
vercel link
```

## Complete Environment Variables Checklist

### Frontend (Vercel)
- [ ] `VITE_API_URL` = Backend URL

### Backend (Render/Other)
- [ ] `FRONTEND_URL` = Vercel URL
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `JWT_SECRET` = Random secret key
- [ ] `JWT_EXPIRES_IN` = 7d
- [ ] `NODE_ENV` = production

## Next Steps After Deployment

1. ✅ Share your app URL with users
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring/alerts
4. ✅ Create regular database backups
5. ✅ Document API endpoints
6. ✅ Set up staging environment (optional)

---

**Your App is Now Live! 🎉**

Frontend: `https://your-app.vercel.app`
Backend: `https://your-backend.onrender.com`
