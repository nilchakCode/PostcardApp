# Quick Start Guide

Get PostcardsTo up and running in minutes!

## Prerequisites Checklist

- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Git installed (optional)

## Step-by-Step Setup (10 minutes)

### 1. Supabase Setup (3 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. While it's being created, continue with steps below
3. Once ready, go to Project Settings > API and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Backend Setup (3 minutes)

```bash
# Open terminal in PostcardApp directory
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# OR (macOS/Linux)
source venv/bin/activate

# Install dependencies (this may take 1-2 minutes)
pip install -r requirements.txt

# Create .env file
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_KEY=your_anon_key
# SUPABASE_SERVICE_KEY=your_service_role_key
```

### 3. Frontend Setup (3 minutes)

```bash
# Open NEW terminal in PostcardApp directory
cd frontend

# Install dependencies (this may take 1-2 minutes)
npm install

# Create .env.local file
copy .env.local.example .env.local    # Windows
# cp .env.local.example .env.local    # macOS/Linux

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Database Setup (1 minute)

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Copy ALL the SQL from `SUPABASE_SETUP.md` section 3
4. Paste and click "Run"
5. You should see "Success" messages

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
# Activate venv if not already activated
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  ▲ Next.js 15.1.0
  - Local:        http://localhost:3000
```

### 6. Test It Out!

1. Open browser to `http://localhost:3000`
2. Click "Sign Up"
3. Create an account with email/password
4. You should be redirected to the feed page!

## Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access http://localhost:8000/docs (API documentation)
- [ ] Can sign up with email/password
- [ ] User appears in Supabase dashboard (Authentication > Users)
- [ ] User appears in database (Table Editor > users)

## Common Issues & Fixes

### Backend won't start

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
# Make sure venv is activated (you should see (venv) in terminal)
# Then reinstall:
pip install -r requirements.txt
```

**Error: `supabase_url is required`**
```bash
# Make sure .env file exists in backend folder
# Make sure it has valid credentials (no quotes needed)
```

### Frontend won't start

**Error: `Cannot find module 'react'`**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: `NEXT_PUBLIC_SUPABASE_URL is not defined`**
```bash
# Make sure .env.local exists in frontend folder
# Restart the dev server after creating .env.local
```

### Can't sign up/login

**Check:**
1. Backend is running (http://localhost:8000/health should return `{"status":"healthy"}`)
2. Supabase credentials are correct
3. Database tables are created (check Supabase Table Editor)
4. Check browser console for errors (F12)

### Database errors

**Error: `relation "public.users" does not exist`**
```bash
# Run the SQL setup from SUPABASE_SETUP.md
# Make sure all tables were created successfully
```

## Next Steps

### Enable OAuth Login

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and OAuth credentials
3. Add to Supabase (Authentication > Providers > Google)
4. Test the "Continue with Google" button

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com)
2. Create Services ID and Key
3. Add to Supabase (Authentication > Providers > Apple)
4. Test the "Continue with Apple" button

### Set Up Image Upload

1. In Supabase, go to Storage
2. Create a bucket named `posts`
3. Set bucket to public
4. Implement upload functionality in your app

### Add More Features

Ideas to extend the app:
- [ ] Upload photos from device
- [ ] Add comments on posts
- [ ] Implement following/followers
- [ ] Add user search
- [ ] Create notifications
- [ ] Add dark mode
- [ ] Implement infinite scroll
- [ ] Add post filtering by tags

## Development Workflow

```bash
# Always run both servers during development

# Terminal 1 - Backend
cd backend
venv\Scripts\activate  # Windows
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev

# Make changes to code
# Both servers will auto-reload on save
```

## Helpful Commands

```bash
# Backend
pip list                    # See installed packages
pip freeze > requirements.txt  # Update requirements
python -m pytest           # Run tests (if added)

# Frontend
npm run build              # Build for production
npm run start              # Run production build
npm run lint               # Check code quality

# Database
# Access Supabase SQL Editor to run queries
# Use Table Editor for visual data management
```

## Learning Resources

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

1. Check the error message carefully
2. Look in browser console (F12)
3. Check backend logs in terminal
4. Review the documentation files
5. Search Supabase docs for specific errors

## Production Deployment

When ready to deploy:

1. **Backend**: Deploy to Railway, Render, or Fly.io
2. **Frontend**: Deploy to Vercel (easiest for Next.js)
3. **Environment Variables**: Set all `.env` variables in hosting platforms
4. **Supabase**: Update redirect URLs in Authentication settings
5. **CORS**: Update allowed origins in backend

Happy coding!
