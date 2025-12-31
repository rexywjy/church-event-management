# SOCSA Quick Start Guide

Get your church management system running in minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd socsa

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup

**Using PostgreSQL locally:**
```bash
# Create database
createdb socsa

# Update backend/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/socsa
```

**Using managed PostgreSQL (for production):**
1. Choose a provider: Railway, Neon, ElephantSQL, or any PostgreSQL hosting
2. Create new database
3. Copy connection string
4. Update `backend/.env` with your DATABASE_URL

### Step 3: Configure Environment

**Backend (`backend/.env`):**
```env
PORT=3001
NODE_ENV=development

DATABASE_URL=postgresql://localhost:5432/socsa

JWT_SECRET=please-change-this-to-a-random-32-character-string
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3001
```

### Step 4: Initialize Database

```bash
cd backend
npm run migrate
```

### Step 5: Create Superadmin

```bash
node src/scripts/create-superadmin.js
```

Enter:
- Email: `admin@socsa.com`
- Password: `admin123` (change in production!)
- Name: `Super Admin`

### Step 6: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 7: Access Application

Open browser: `http://localhost:5173`

**Login with:**
- Email: `admin@socsa.com`
- Password: `admin123`

---

## 📱 First Steps After Login

### As Superadmin:

1. **Create an Event**
   - Go to Admin → Create Event
   - Add title, description
   - Add at least one session (date/time)
   - Toggle "Registration Open"
   - Save

2. **Test User Registration**
   - Logout
   - Click "Sign Up"
   - Fill registration form
   - Login as admin again
   - Go to Admin → Pending Approvals
   - Approve the user

3. **Test Event Registration**
   - Login as the approved user
   - Go to Events
   - Click on your event
   - Register for event
   - Check registration status

---

## 🎯 Key Features Overview

### User Journey
```
Sign Up → Pending → Admin Approves → Login → View Events → Register → Attend
```

### Admin Journey
```
Login → Create Event → Set Sessions → Open Registration → 
Review Registrations → Mark Attendance
```

### Queue System
- Event has capacity limit (e.g., 100 people)
- 101st person → added to waiting list
- If someone cancels → person #1 on waiting list automatically promoted

---

## 📊 Test Scenarios

### Scenario 1: Basic Event Registration
1. Create event with limit of 2 people
2. Register 3 users
3. First 2 are "Registered"
4. Third user is "Waitlisted" at position #1
5. Cancel one registration
6. Waitlisted user automatically promoted

### Scenario 2: Attendance Tracking
1. Create event with attendance enabled
2. Users register for event
3. Admin goes to event registrations
4. Select a session
5. Mark attendance for registered users

### Scenario 3: User Management
1. New users sign up
2. Admin reviews in "Pending Approvals"
3. Approve/reject as needed
4. Approved users can login
5. Rejected users cannot login

---

## 🔧 Common Commands

```bash
# Backend
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm start           # Start production server

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Database connection error
```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

### Frontend can't connect to backend
- Check VITE_API_URL in frontend/.env
- Verify backend is running on port 3001
- Check browser console for CORS errors

### Migration errors
```bash
# Drop and recreate database
dropdb socsa
createdb socsa
npm run migrate
```

---

## 📚 Project Structure

```
socsa/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── db/              # Schema & migrations
│   │   ├── middleware/      # Auth & RBAC
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic (queue)
│   │   └── index.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Events.jsx
│   │   ├── lib/             # API & auth
│   │   └── App.jsx
│   └── package.json
│
├── README.md
├── QUICKSTART.md
└── DEPLOYMENT.md
```

---

## 🔐 Security Notes

**Development:**
- JWT_SECRET can be simple
- Database can be local
- CORS allows localhost

**Production:**
- Use strong JWT_SECRET (32+ random chars)
- Use managed PostgreSQL database
- Configure CORS with exact domain
- Use HTTPS everywhere
- Change default admin password
- Argon2 provides strong password hashing (more secure than bcrypt)

---

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
  }
}
```

### Add Profile Fields
1. Update database schema
2. Update backend routes
3. Update frontend forms

### Modify Registration Limit
Edit event form or update via admin panel.

---

## 📞 Need Help?

**Check logs:**
- Backend: Terminal running `npm run dev`
- Frontend: Browser console (F12)
- Database: Check Supabase dashboard

**Common issues:**
- Port already in use → Change PORT in .env
- CORS errors → Check FRONTEND_URL matches exactly
- 401 errors → Check JWT_SECRET, try re-login

---

## 🚀 Ready to Deploy?

See `DEPLOYMENT.md` for full deployment guide to:
- Vercel (Frontend)
- Render (Backend)
- Supabase (Database)

---

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] Database migrations completed
- [ ] Superadmin account created
- [ ] Can login as admin
- [ ] Can create event
- [ ] Can register new user
- [ ] Can approve user
- [ ] User can register for event
- [ ] Queue system works (test with limit)
- [ ] Attendance tracking works

🎉 **You're ready to use SOCSA!**
