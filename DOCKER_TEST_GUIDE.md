# Docker Build Testing Guide

This guide will help you test your Docker builds locally before deploying to Railway.

## Prerequisites

1. **Docker Desktop** installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running (check system tray)

2. **Environment files configured**
   - Copy `.env.example` to `.env` in backend folder
   - Copy `.env.example` to `.env.local` in frontend folder
   - Update with your actual credentials

## Quick Test (Automated)

### Windows Users
```cmd
test-docker.bat
```

### Mac/Linux Users
```bash
chmod +x test-docker.sh
./test-docker.sh
```

## Manual Testing

### Step 1: Setup Environment Files

If not already done:

```cmd
# Backend
cd backend
copy .env.example .env
# Edit .env with your actual Supabase credentials

# Frontend
cd ..\frontend
copy .env.example .env.local
# Edit .env.local with your actual credentials
```

### Step 2: Test Backend Build

```cmd
cd C:\Workarea\Projects\PostcardApp\backend

# Build the image
docker build -t postcard-backend:test .

# Expected output: "Successfully built" and "Successfully tagged"
```

**What to look for:**
- ✅ All steps complete without errors
- ✅ Python dependencies install successfully
- ✅ Final message: "Successfully tagged postcard-backend:test"

**Common Issues:**
- ❌ `requirements.txt not found` → Make sure you're in the backend folder
- ❌ `Docker daemon not running` → Start Docker Desktop
- ❌ `Permission denied` → Run PowerShell/CMD as Administrator

### Step 3: Test Backend Container

```cmd
# Run the container
docker run --rm -d ^
  --name postcard-backend-test ^
  -p 8000:8000 ^
  --env-file .env ^
  postcard-backend:test

# Wait a few seconds for startup
timeout /t 5

# Test the health endpoint
curl http://localhost:8000/health

# Check logs
docker logs postcard-backend-test

# Test API docs
# Open in browser: http://localhost:8000/docs

# Stop the container
docker stop postcard-backend-test
```

**Expected Results:**
- ✅ Health endpoint returns: `{"status":"healthy"}`
- ✅ API docs load at http://localhost:8000/docs
- ✅ No errors in logs

### Step 4: Test Frontend Build

```cmd
cd ..\frontend

# Build the image (this takes longer)
docker build -t postcard-frontend:test .

# Expected: Build completes successfully
```

**What to look for:**
- ✅ Dependencies install successfully
- ✅ Next.js builds without errors
- ✅ Final message: "Successfully tagged postcard-frontend:test"

**Common Issues:**
- ❌ Build fails → Check package.json is valid
- ❌ Out of memory → Increase Docker memory in Docker Desktop settings
- ❌ Very slow → Normal for first build (Next.js is large)

### Step 5: Test Frontend Container

```cmd
# Run the container
docker run --rm -d ^
  --name postcard-frontend-test ^
  -p 3000:3000 ^
  --env-file .env.local ^
  postcard-frontend:test

# Wait for startup (Next.js takes ~10 seconds)
timeout /t 10

# Test the frontend
# Open in browser: http://localhost:3000

# Check logs
docker logs postcard-frontend-test

# Stop the container
docker stop postcard-frontend-test
```

**Expected Results:**
- ✅ Frontend loads at http://localhost:3000
- ✅ Login page displays correctly
- ✅ No errors in browser console

## Test Both Services Together

Use Docker Compose to run both services:

```cmd
cd C:\Workarea\Projects\PostcardApp

# Start both services
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Test the full stack:**
1. Open http://localhost:3000
2. Try to login/signup
3. Backend should be accessible at http://localhost:8000
4. Check that frontend can communicate with backend

## Troubleshooting

### Backend Issues

**Container exits immediately:**
```cmd
docker logs postcard-backend-test
```
Look for:
- Missing environment variables
- Invalid Supabase credentials
- Port already in use (another service on 8000)

**Fix port conflicts:**
```cmd
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (use PID from above)
taskkill /PID <PID> /F
```

### Frontend Issues

**Build fails with "out of memory":**
1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to at least 4GB
4. Apply & Restart

**Container starts but frontend doesn't load:**
1. Check logs: `docker logs postcard-frontend-test`
2. Wait longer (Next.js can take 15-30 seconds first time)
3. Check .env.local has correct values

**Cannot connect to backend:**
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Check CORS settings in backend

## Verify Images

List your Docker images:
```cmd
docker images | findstr postcard
```

You should see:
```
postcard-backend     test    <image-id>   <size>
postcard-frontend    test    <image-id>   <size>
```

## Clean Up

Remove test images:
```cmd
docker rmi postcard-backend:test
docker rmi postcard-frontend:test
```

Remove all stopped containers:
```cmd
docker container prune
```

Remove all unused images:
```cmd
docker image prune -a
```

## Performance Benchmarks

**Expected build times (first build):**
- Backend: 2-5 minutes
- Frontend: 5-15 minutes (Next.js is large)

**Expected build times (subsequent builds):**
- Backend: 30-60 seconds (cached layers)
- Frontend: 2-5 minutes (cached node_modules)

**Expected container startup times:**
- Backend: 2-5 seconds
- Frontend: 10-20 seconds

**Expected image sizes:**
- Backend: 400-600 MB
- Frontend: 500-800 MB

## Next Steps

Once both services build and run successfully:

1. ✅ Commit the Dockerfile changes
2. ✅ Push to GitHub
3. ✅ Deploy to Railway following RAILWAY_DEPLOYMENT.md
4. ✅ Test production deployment

## Get Help

If you encounter issues:

1. Check Docker Desktop is running
2. Check environment variables are set correctly
3. Look at container logs: `docker logs <container-name>`
4. Try rebuilding without cache: `docker build --no-cache -t <image> .`
5. Check Railway documentation: https://docs.railway.app/

## Success Checklist

Before deploying to Railway, verify:

- [ ] Backend builds without errors
- [ ] Backend container starts and health check passes
- [ ] Frontend builds without errors
- [ ] Frontend container starts and page loads
- [ ] Both services work together with docker-compose
- [ ] API calls from frontend to backend work
- [ ] No errors in container logs
- [ ] Environment variables are properly loaded

If all checks pass, you're ready to deploy to Railway! 🚀
