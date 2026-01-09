# Admin & Superadmin Features

## Superadmin Features

### 1. Password Reset for Any User/Admin

**Access:** Only Superadmin

Superadmins can reset passwords for any user or admin account through the Edit User interface.

**How to Reset a User's Password:**

1. **Navigate to User Management**
   - Login as superadmin
   - Go to **Admin** → **Manage Users**

2. **Select User to Edit**
   - Click **Edit** button next to any user

3. **Reset Password Section**
   - Look for the highlighted "🔑 Reset Password" section (amber/yellow background)
   - Enter the new password in **"New Password"** field
   - Confirm in **"Confirm New Password"** field

4. **Save Changes**
   - Click **"Update User"** button
   - Password is immediately changed
   - User can login with the new password

**Important Notes:**
- **Leave blank to keep current password** - If you don't want to change the password, leave both fields empty
- **Minimum 6 characters** - Password must be at least 6 characters
- **Passwords must match** - Confirmation field must match the new password
- **Instant effect** - User's password is changed immediately upon saving
- **No notification** - User is NOT notified of the password change automatically

**Security Best Practices:**
- Use strong passwords (mix of letters, numbers, symbols)
- Communicate new password to user securely (not via email/SMS)
- Recommend user changes password on first login
- Document password resets in your admin logs

---

### 2. Create User/Admin Accounts

**Access:** Only Superadmin

Create pre-approved user or admin accounts directly.

**How to Create Users:**

1. Go to **Admin** → **Manage Users**
2. Click **"Create New User"**
3. Fill in required fields:
   - Email
   - Password
   - Full Name
   - Role (User or Admin)
4. Click **"Create User"**

**Features:**
- Accounts are automatically approved
- Can create both regular users and admins
- Can set all profile fields during creation

---

### 3. Edit User Information

**Access:** Only Superadmin

Modify any user's account information including:

**Account Information:**
- Email address
- Password (reset)
- Role (User/Admin)
- Status (Pending/Approved/Rejected/Disabled)

**Personal Information:**
- Full Name
- NIJ number
- Class
- Gender
- District
- Address
- Date of Birth
- Phone

---

### 4. User Approval/Rejection

**Access:** Admin and Superadmin

Approve or reject pending user registrations.

**How to Approve Users:**

1. Go to **Admin** → **Approvals**
2. Review pending users
3. Click **"Approve"** or **"Reject"**

**Statuses:**
- **Pending** - User registered, waiting approval
- **Approved** - User can login and access system
- **Rejected** - User cannot login
- **Disabled** - Previously approved but now disabled

---

### 5. Manage User Roles

**Access:** Only Superadmin

Change user roles between:
- **User** - Regular member access
- **Admin** - Can manage events, approve users
- **Superadmin** - Full system access (cannot be set via UI)

**How to Change Roles:**

1. Go to **Admin** → **Manage Users**
2. Click **Edit** on user
3. Select new role from dropdown
4. Click **"Update User"**

---

### 6. Disable/Enable User Accounts

**Access:** Only Superadmin

Temporarily disable user accounts without deleting them.

**How to Disable Users:**

1. Edit the user
2. Change **Status** to "Disabled"
3. Save changes

**Effect:**
- User cannot login
- Previous data preserved
- Can be re-enabled anytime

---

## Admin Features (Admin + Superadmin)

### 1. Manage Events

**Create Events:**
- Set event details (name, description, dates)
- Set registration limits
- Create multiple sessions
- Define attendance requirements

**Edit Events:**
- Modify event information
- Update session details
- Change registration settings

**Delete Events:**
- Remove events from system
- Removes all associated registrations

---

### 2. View Event Registrations

**Access:** Event registration list for each event

**Features:**
- See all registered users
- View registration status (registered, waitlist)
- Check attendance records
- Export registration list

---

### 3. Mark Attendance

**Access:** Each event session

**Features:**
- Mark users as present/absent
- Track attendance per session
- View attendance history
- Generate attendance reports

---

## User Features (All Roles)

### 1. Profile Management

Users can update their own:
- Name
- Contact information
- Personal details
- Password (self-service)

### 2. Event Registration

- Browse available events
- Register for events
- Join waitlist if full
- Cancel registration

### 3. View My Events

- See registered events
- Check waitlist status
- View event details

---

## Permission Matrix

| Feature | User | Admin | Superadmin |
|---------|------|-------|------------|
| Register for events | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| Approve users | ❌ | ✅ | ✅ |
| Create/manage events | ❌ | ✅ | ✅ |
| Mark attendance | ❌ | ✅ | ✅ |
| Create users directly | ❌ | ❌ | ✅ |
| Edit any user | ❌ | ❌ | ✅ |
| **Reset user passwords** | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Disable user accounts | ❌ | ❌ | ✅ |

---

## API Endpoints

### Password Reset Endpoint

**Endpoint:** `PUT /api/admin/edit-user/:id`

**Access:** Superadmin only

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "newpassword123",
  "name": "User Name",
  "role": "user",
  "status": "approved"
}
```

**Notes:**
- `password` field is optional
- If `password` is provided, it will be hashed with Argon2 and updated
- If `password` is omitted or empty, current password remains unchanged

---

## Common Admin Tasks

### Reset a Forgotten Password

1. User contacts admin/superadmin
2. Superadmin goes to Manage Users → Edit user
3. Enter new temporary password
4. Communicate password securely to user
5. Recommend user changes password after login

### Create New Admin

1. Go to Manage Users → Create New User
2. Fill in admin details
3. Set Role to "Admin"
4. Set Status to "Approved"
5. Create user
6. Communicate credentials to new admin

### Disable Problematic Account

1. Go to Manage Users → Edit user
2. Change Status to "Disabled"
3. Save changes
4. User cannot login anymore

### Bulk Password Resets

Currently: Manual one-by-one through UI

Future Enhancement: Could add bulk password reset feature
