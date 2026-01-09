# Dependency Update & Installation Guide

## Updated Versions (Safe & Vulnerability-Free)

### Frontend Dependencies
- **React**: 18.3.1 (updated from 18.2.0)
- **React DOM**: 18.3.1 (updated from 18.2.0)
- **React Router**: 7.1.1 (updated from 6.21.3)
- **Vite**: 6.0.5 (updated from 5.0.11)
- **Axios**: 1.7.9 (updated from 1.6.5)
- **TanStack Query**: 5.62.0 (updated from 5.17.19)
- **Lucide React**: 0.468.0 (updated from 0.309.0)
- **Tailwind CSS**: 3.4.17 (updated from 3.4.1)
- **PostCSS**: 8.4.49 (updated from 8.4.33)
- **Autoprefixer**: 10.4.20 (updated from 10.4.17)

### Backend Dependencies
- **Fastify**: 5.2.0 (updated from 4.26.0)
- **@fastify/cors**: 10.0.1 (updated from 9.0.1)
- **@fastify/jwt**: 9.0.1 (updated from 8.0.0)
- **Argon2**: 0.41.1 (updated from 0.31.2)
- **PostgreSQL**: 8.13.1 (updated from 8.11.3)
- **dotenv**: 16.4.7 (updated from 16.4.1)

## Installation Steps

### Step 1: Clean Install Frontend Dependencies

```bash
cd frontend

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install updated dependencies
npm install

# Verify no vulnerabilities
npm audit
```

### Step 2: Clean Install Backend Dependencies

```bash
cd ../backend

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install updated dependencies
npm install

# Verify no vulnerabilities
npm audit
```

### Step 3: Test Locally

#### Test Frontend
```bash
cd frontend

# Development mode
npm run dev

# Build test
npm run build

# Preview production build
npm run preview
```

#### Test Backend
```bash
cd backend

# Development mode
npm run dev

# Test migration (if needed)
npm run migrate
```

### Step 4: Commit Updated Lock Files

```bash
# From project root
git add frontend/package-lock.json backend/package-lock.json
git add frontend/package.json backend/package.json
git commit -m "Update dependencies to latest safe versions"
git push origin main
```

## Security Audit

Run security audits to verify no vulnerabilities:

```bash
# Frontend audit
cd frontend
npm audit

# If high/critical vulnerabilities found
npm audit fix

# Backend audit
cd ../backend
npm audit

# If high/critical vulnerabilities found
npm audit fix
```

## Troubleshooting

### Issue: npm audit shows vulnerabilities

**Solution:**
```bash
# Try automatic fix
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Check what changed
git diff package-lock.json
```

### Issue: Build fails after update

**Common causes:**
1. **React Router v7 changes** - Check routing implementation
2. **Fastify v5 changes** - Review plugin registration

**Solutions:**
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Type errors in development

**Solution:**
```bash
# Update TypeScript definitions
npm install --save-dev @types/react@latest @types/react-dom@latest
```

## Breaking Changes to Watch

### React Router v7
- Some API changes from v6
- Check route definitions if issues occur

### Fastify v5
- Plugin registration might have changed
- Check async/await patterns

### Vite v6
- Build optimizations improved
- Config should be compatible

## Next Steps

After successful installation:
1. ✅ Test app locally (both frontend & backend)
2. ✅ Run security audits
3. ✅ Commit lock files
4. ✅ Deploy to Vercel (see VERCEL_DEPLOYMENT.md)

## Quick Commands Reference

```bash
# Install all dependencies (from root)
cd frontend && npm install && cd ../backend && npm install && cd ..

# Audit all (from root)
cd frontend && npm audit && cd ../backend && npm audit && cd ..

# Test all (from root)
cd frontend && npm run build && cd ../backend && npm start
```

---

**All dependencies are now updated to safe versions! 🔒**
