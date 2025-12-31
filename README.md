# SOCSA - Church Management System

A comprehensive church management system with user approval, role-based access control, event management, registration with queue system, and attendance tracking.

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router v6
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Fastify
- PostgreSQL
- JWT Authentication
- Argon2 (password hashing)

### Database
- PostgreSQL 14+ (recommended: self-hosted, alternatively: Supabase, Railway, Neon)

## Key Features

✅ **Authentication & Authorization**
- Email/password sign-up with admin approval
- JWT-based authentication
- RBAC: User/Jemaat, Admin, Superadmin
- Account status: Pending → Approved/Rejected/Disabled

✅ **Event Management**
- Create events with multiple sessions
- Enable/disable events
- Open/close registration
- Registration capacity limits

✅ **Queue System**
- Automatic waiting list
- Auto-promotion when someone cancels
- Fair queue positioning

✅ **Attendance Tracking**
- Mark attendance per session
- Admin-controlled recording

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run migrate
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL
npm run dev
```

### First Superadmin
After running migrations, create a superadmin account:
```bash
cd backend
node src/scripts/create-superadmin.js
```

## Project Structure

```
socsa/
├── backend/
│   ├── src/
│   │   ├── config/       # Database & app config
│   │   ├── db/           # Schema & migrations
│   │   ├── middleware/   # Auth & RBAC
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # API client & utils
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Users (Admin/Superadmin)
- `GET /api/users` - List all users
- `GET /api/users/pending` - Pending approvals
- `PUT /api/users/:id/approve` - Approve user
- `PUT /api/users/:id/reject` - Reject user
- `PUT /api/users/:id/disable` - Disable user
- `PUT /api/users/:id/role` - Change role (Superadmin)

### Profile
- `GET /api/profile` - Get own profile
- `PUT /api/profile` - Update own profile

### Events
- `GET /api/events` - List events (filtered by role)
- `GET /api/events/:id` - Event details
- `POST /api/events` - Create (Admin)
- `PUT /api/events/:id` - Update (Admin)
- `DELETE /api/events/:id` - Delete (Admin)

### Registrations
- `GET /api/events/:id/registrations` - List registrations (Admin)
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/registrations/:id` - Cancel registration
- `GET /api/registrations/my` - My registrations

### Attendance
- `GET /api/sessions/:id/attendance` - Session attendance (Admin)
- `POST /api/attendance` - Mark attendance (Admin)
- `DELETE /api/attendance/:id` - Remove attendance (Admin)

## Deployment

- **Frontend**: Vercel (auto-deploy from Git)
- **Backend**: Render (Web Service)
- **Database**: **Self-hosted PostgreSQL recommended** for full control and cost efficiency. Alternatively: Supabase, Railway, Neon, or ElephantSQL

### Environment Variables

**Backend (.env)**
```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-char-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
```

**Frontend (.env)**
```
VITE_API_URL=https://your-backend.onrender.com
```

## Security Notes

- Passwords hashed with Argon2id
- JWT tokens with 7-day expiration
- CORS configured for frontend domain only
- Role-based access control on all protected routes
- Account status validation on login

## License

MIT
