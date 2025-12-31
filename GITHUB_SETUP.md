# GitHub Setup Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon in the top right → **New repository**
3. Fill in:
   - **Repository name**: `socsa` (or your preferred name)
   - **Description**: "Church Management System - SOCSA"
   - **Visibility**: Choose Private or Public
   - ⚠️ **DO NOT** initialize with README, .gitignore, or license (your project already has these)
4. Click **Create repository**

## Step 2: Initialize Git and Push to GitHub

Open your terminal in the project root directory and run:

```bash
# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Church Management System"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Example with actual values:
```bash
git init
git add .
git commit -m "Initial commit: Church Management System"
git remote add origin https://github.com/rexywijaya/socsa.git
git branch -M main
git push -u origin main
```

## Step 3: Set Up .gitignore (Already Included)

Your project already has a `.gitignore` file that excludes:
- `node_modules/`
- `.env` files
- Build outputs
- Log files

**⚠️ IMPORTANT**: Never commit your `.env` files! They contain sensitive credentials.

## Step 4: Future Updates

After making changes to your code:

```bash
# Check what changed
git status

# Add specific files
git add path/to/file.js

# Or add all changes
git add .

# Commit with a message
git commit -m "Your commit message describing changes"

# Push to GitHub
git push
```

## Common Git Commands

```bash
# View status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Pull latest changes
git pull origin main

# View remote URL
git remote -v

# Change remote URL
git remote set-url origin https://github.com/NEW_URL.git
```

## Using SSH Instead of HTTPS (Optional but Recommended)

### 1. Generate SSH Key (if you don't have one)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Optionally set a passphrase
```

### 2. Add SSH Key to GitHub
```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub

# Go to GitHub → Settings → SSH and GPG keys → New SSH key
# Paste the key and save
```

### 3. Change Remote to SSH
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

Now you won't need to enter credentials when pushing!

## Deploying with GitHub

### Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com)
2. Click **Import Project**
3. Connect your GitHub account
4. Select your repository
5. Vercel auto-detects it's a Vite project
6. Set root directory to `frontend`
7. Add environment variable: `VITE_API_URL`
8. Deploy!

### Render (Backend)
1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: socsa-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
6. Deploy!

Both platforms auto-deploy when you push to GitHub! 🚀

## Troubleshooting

**"fatal: remote origin already exists"**
```bash
git remote remove origin
git remote add origin YOUR_NEW_URL
```

**"Your branch is ahead/behind"**
```bash
# Pull first
git pull origin main

# Then push
git push origin main
```

**Merge conflicts**
```bash
# Open conflicted files and resolve manually
# Then:
git add .
git commit -m "Resolved merge conflicts"
git push
```

**Undo last commit (keep changes)**
```bash
git reset --soft HEAD~1
```

**Undo last commit (discard changes)**
```bash
git reset --hard HEAD~1
```

---

## 📝 Recommended Commit Message Format

```
feat: Add contact persons to events
fix: Resolve user approval permission issue
docs: Update deployment guide
style: Fix button spacing on dashboard
refactor: Improve event query performance
test: Add tests for user authentication
chore: Update dependencies
```

Good luck with your project! 🎉
