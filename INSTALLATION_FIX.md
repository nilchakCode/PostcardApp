# Installation Fix - Issue Resolved

## Problem
The original `requirements.txt` included packages that require C++ build tools on Windows:
- `python-jose[cryptography]` - JWT library (not needed - Supabase handles auth)
- `passlib[bcrypt]` - Password hashing (not needed - Supabase handles auth)
- `uvicorn[standard]` - Extra dependencies that may cause issues

## Solution Applied

### Updated requirements.txt
Removed problematic packages and simplified dependencies since Supabase handles authentication:

```txt
# FastAPI and server
fastapi==0.109.0
uvicorn==0.27.0
python-multipart==0.0.6

# Supabase
supabase==2.3.0

# Environment variables
python-dotenv==1.0.0

# Pydantic for data validation
pydantic==2.5.3
pydantic-settings==2.1.0
email-validator==2.1.0

# HTTP requests
httpx==0.26.0
```

### Configuration Fix
Updated `backend/app/config.py` to properly handle comma-separated `ALLOWED_ORIGINS` from .env file.

## Installation Status

**All packages installed successfully!**

Installed packages:
- ✓ FastAPI (web framework)
- ✓ Uvicorn (ASGI server)
- ✓ Supabase (database & auth client)
- ✓ Pydantic (data validation)
- ✓ Python-dotenv (environment variables)
- ✓ HTTPx (HTTP client)
- ✓ Email-validator (email validation)

## Next Steps

### 1. Set Up Supabase (Required)

You need to create a Supabase project and get your credentials:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (takes 2-3 minutes)
3. Go to Project Settings > API
4. Copy these values:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Update Backend .env File

Edit `backend/.env` and replace the placeholder values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### 3. Set Up Database Tables

1. Go to Supabase SQL Editor
2. Copy and run all SQL from `SUPABASE_SETUP.md` (section 3)
3. Verify tables are created in Table Editor

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 5. Configure Frontend

1. Copy the environment file:
   ```bash
   cp .env.local.example .env.local   # macOS/Linux
   copy .env.local.example .env.local # Windows
   ```

2. Edit `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Test It!

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account
4. You should see the feed page!

## Verification Commands

Test backend is working:
```bash
cd backend
python -c "from app.main import app; print('✓ Backend OK')"
```

Test frontend builds:
```bash
cd frontend
npm run build
```

Check backend API docs:
- Start backend server
- Visit http://localhost:8000/docs

## Troubleshooting

### Still getting build errors?

If you encounter any compilation errors with other packages:

1. Make sure you're using Python 3.9 or higher:
   ```bash
   python --version
   ```

2. Upgrade pip:
   ```bash
   python -m pip install --upgrade pip
   ```

3. Install packages one by one to identify the problem:
   ```bash
   pip install fastapi
   pip install uvicorn
   pip install supabase
   # etc.
   ```

### Backend won't start?

Check that:
- [ ] All packages are installed (`pip list`)
- [ ] `.env` file exists in `backend/` folder
- [ ] Supabase credentials are valid
- [ ] No other process is using port 8000

### Frontend won't start?

Check that:
- [ ] `node_modules` folder exists
- [ ] `.env.local` file exists in `frontend/` folder
- [ ] Node.js version is 18 or higher (`node --version`)

## Optional: Image Upload Support

If you need image processing (resizing, thumbnails, etc.), you can optionally install Pillow:

```bash
pip install Pillow
```

Then uncomment the line in `requirements.txt`:
```txt
# Image handling (optional - only if you need image processing)
Pillow==10.2.0
```

## Success Indicators

You'll know everything is working when:
- ✓ Backend starts without errors
- ✓ http://localhost:8000/docs shows API documentation
- ✓ Frontend loads at http://localhost:3000
- ✓ You can sign up with email/password
- ✓ User appears in Supabase dashboard

## Need Help?

Refer to these files for detailed instructions:
- `QUICKSTART.md` - Fast setup guide
- `SUPABASE_SETUP.md` - Database configuration
- `README.md` - Full documentation

## What Changed?

Summary of fixes applied:
1. Removed packages requiring C++ compilation
2. Simplified dependencies (Supabase handles auth)
3. Fixed CORS configuration parsing
4. Added missing `email-validator` package
5. Updated documentation

Your PostcardsTo app is now ready to use! 🎉
