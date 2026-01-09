# Auto-Superadmin Creation Guide

## Overview

The backend now **automatically creates** a superadmin account on first startup if no superadmin exists in the database. This eliminates the need for manual superadmin creation after deployment.

## How It Works

1. **Server starts** → Listens on port → Runs migration check
2. **Auto-init runs** → Checks if any superadmin exists in database
3. **If no superadmin found** → Creates one using environment variables
4. **Server ready** → You can immediately login with the credentials

## Default Credentials

If environment variables are not set, these defaults are used:

- **Email**: `admin@socsa.com`
- **Password**: `admin123`
- **Name**: `System Administrator`

## ⚠️ Security Best Practices

### For Production Deployment

**ALWAYS set custom credentials before deployment!**

```env
SUPERADMIN_EMAIL=your-secure-email@yourdomain.com
SUPERADMIN_PASSWORD=Your-Very-Secure-Password-2026!
SUPERADMIN_NAME=Your Name
```

**Why this matters:**
- Default credentials are publicly visible in documentation
- Attackers may try default credentials
- Production systems should NEVER use default passwords

### Recommended Password Guidelines

- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Not a common word or phrase
- Unique to this application

Example strong password: `SocsaAdmin@2026!Secure#`

## Configuration

### Environment Variables

Add these to your deployment environment (Render, Railway, etc.):

```env
# Required - Database connection
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Required - JWT configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Optional - Superadmin credentials (HIGHLY RECOMMENDED to set)
SUPERADMIN_EMAIL=admin@yourdomain.com
SUPERADMIN_PASSWORD=YourSecurePassword123!
SUPERADMIN_NAME=Your Full Name
```

### For Render.com

1. Go to your backend service
2. Navigate to **Environment** tab
3. Add the following variables:
   - `SUPERADMIN_EMAIL`
   - `SUPERADMIN_PASSWORD`
   - `SUPERADMIN_NAME`
4. Save changes
5. Service will auto-restart

### For Railway

1. Go to your project
2. Click on your backend service
3. Go to **Variables** tab
4. Add the superadmin credentials
5. Deploy

### For VPS/Self-Hosted

Create or update `.env` file:

```bash
cd backend
nano .env

# Add or update these lines:
SUPERADMIN_EMAIL=your-email@domain.com
SUPERADMIN_PASSWORD=YourSecurePassword
SUPERADMIN_NAME=Your Name

# Save and restart
pm2 restart socsa-backend
# OR
npm run start
```

## Behavior Details

### First Startup (No Superadmin Exists)

```
🚀 Server running on http://0.0.0.0:3001
📝 Health check: http://0.0.0.0:3001/health
🔧 No superadmin found. Creating default superadmin account...
✅ Default superadmin account created successfully!
📧 Email: admin@socsa.com
🔑 Password: admin123
⚠️  IMPORTANT: Change the default password after first login!
```

### Subsequent Startups (Superadmin Already Exists)

```
🚀 Server running on http://0.0.0.0:3001
📝 Health check: http://0.0.0.0:3001/health
✅ Superadmin account already exists
```

### Email Already Exists (Non-Superadmin)

If the email in `SUPERADMIN_EMAIL` already exists but is not a superadmin:

```
⚠️  Email already exists but not a superadmin. Skipping auto-creation.
```

In this case, manually promote the user or create superadmin via script.

## Manual Creation (If Needed)

If you prefer manual creation or need to create additional superadmins:

```bash
# SSH into your server or use Render/Railway shell
node src/scripts/create-superadmin.js

# Follow the prompts:
Email: another-admin@domain.com
Password: SecurePassword123!
Name: Another Admin

✅ Superadmin account created successfully!
```

## Changing Credentials After Deployment

### Option 1: Via Admin Panel (Recommended)

1. Login with current superadmin credentials
2. Go to **Profile** or **Settings**
3. Update email/password
4. Save changes

### Option 2: Via Database

```sql
-- Connect to your database
psql $DATABASE_URL

-- Update email
UPDATE accounts 
SET email = 'new-email@domain.com' 
WHERE role = 'superadmin' AND email = 'admin@socsa.com';

-- Update password (must be hashed with argon2)
-- Use the create-superadmin.js script instead for password changes
```

### Option 3: Create New Superadmin, Delete Old

```bash
# Create new superadmin
node src/scripts/create-superadmin.js

# Delete old default account via SQL or admin panel
```

## Testing Locally

```bash
cd backend

# Set environment variables
export SUPERADMIN_EMAIL=test@example.com
export SUPERADMIN_PASSWORD=TestPassword123
export SUPERADMIN_NAME=Test Admin

# Run migrations
npm run migrate

# Start server
npm run dev

# Check logs for auto-creation confirmation
```

## Troubleshooting

### Auto-creation not working

**Check:**
1. Database migrations ran successfully
2. Database connection is working
3. `accounts` table exists
4. Server logs for errors

**Debug:**
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check if accounts table exists
psql $DATABASE_URL -c "\dt accounts"

# Check server logs
# In Render: Logs tab
# In Railway: Deployments → View Logs
# In VPS: pm2 logs OR check console output
```

### Multiple superadmins created

The auto-creation checks for ANY superadmin, not specific email. If you:
1. Manually create a superadmin
2. Restart the server

It will skip auto-creation. Multiple superadmins can only be created manually.

### Forgot superadmin password

**Solution 1 - Create new superadmin:**
```bash
node src/scripts/create-superadmin.js
```

**Solution 2 - Reset via database:**
Use create-superadmin script to create a new account, then delete the old one.

## Code Reference

### Auto-init Service
Location: `backend/src/services/initSuperadmin.js`

```javascript
export async function initSuperadmin() {
  // Checks if superadmin exists
  // Creates default one if not found
  // Uses env vars: SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME
}
```

### Server Integration
Location: `backend/src/index.js`

```javascript
const start = async () => {
  await fastify.listen({ port, host });
  await initSuperadmin(); // Called after server starts
};
```

## Security Checklist

Before deploying to production:

- [ ] Changed `SUPERADMIN_EMAIL` from default
- [ ] Set strong `SUPERADMIN_PASSWORD` (12+ chars, mixed case, symbols)
- [ ] Set meaningful `SUPERADMIN_NAME`
- [ ] Verified environment variables in deployment platform
- [ ] Tested login works after first deployment
- [ ] Documented credentials in secure password manager
- [ ] Planned to change password after first login (if using generated password)

## Best Practices

1. **Use unique email**: Don't use the default `admin@socsa.com`
2. **Strong password**: Follow security guidelines
3. **Secure storage**: Store credentials in password manager
4. **Change on first login**: Even if you set custom env vars, consider changing password via UI
5. **Multiple admins**: Create additional superadmins for team members
6. **Regular rotation**: Change superadmin passwords periodically
7. **Monitor access**: Check logs for superadmin logins

---

**Your superadmin is now automatically created on deployment! 🎉**
