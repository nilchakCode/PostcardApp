# PostcardApp - Quick Start Guide

## Local Development (Without Docker)

### Backend
```cmd
cd backend
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000

### Frontend
```cmd
cd frontend
npm install
copy .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```
Frontend runs at: http://localhost:3000

---

## Docker Testing (Local)

### Quick Test (Automated)
```cmd
# Windows
test-docker.bat

# Mac/Linux
./test-docker.sh
```

### Manual Testing

**Backend:**
```cmd
cd backend
docker build -t postcard-backend:test .
docker run --rm -d --name postcard-backend-test -p 8000:8000 --env-file .env postcard-backend:test
curl http://localhost:8000/health
docker stop postcard-backend-test
```

**Frontend:**
```cmd
cd frontend
docker build -t postcard-frontend:test .
docker run --rm -d --name postcard-frontend-test -p 3000:3000 --env-file .env.local postcard-frontend:test
# Open http://localhost:3000 in browser
docker stop postcard-frontend-test
```

**Both Services:**
```cmd
docker-compose up
# Open http://localhost:3000 in browser
# Ctrl+C to stop
docker-compose down
```

---

## Deploy to Railway

### Method 1: Dashboard
1. Go to https://railway.app/new
2. Deploy from GitHub repo
3. Add two services: backend (root: `/backend`) and frontend (root: `/frontend`)
4. Set environment variables for each service
5. Deploy!

### Method 2: CLI
```cmd
npm install -g @railway/cli
railway login

# Backend
cd backend
railway init
railway up

# Frontend
cd ../frontend
railway init
railway up
```

See **RAILWAY_DEPLOYMENT.md** for detailed instructions.

---

## Essential Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SECRET_KEY=random-secret-key
ALLOWED_ORIGINS=http://localhost:3000
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Common Commands

### Docker
```cmd
# Build
docker build -t image-name .

# Run
docker run -p 8000:8000 image-name

# Stop
docker stop container-name

# Remove
docker rm container-name
docker rmi image-name

# Logs
docker logs container-name

# List
docker ps                 # running containers
docker ps -a              # all containers
docker images             # all images
```

### Docker Compose
```cmd
docker-compose up         # start services
docker-compose up -d      # start in background
docker-compose down       # stop services
docker-compose logs       # view logs
docker-compose logs -f    # follow logs
docker-compose ps         # list services
docker-compose restart    # restart services
```

### Railway CLI
```cmd
railway login             # login
railway init              # initialize project
railway up                # deploy
railway logs              # view logs
railway open              # open in browser
railway variables         # list variables
railway variables set KEY=value  # set variable
railway link              # link to existing project
```

---

## Useful Links

- **API Docs (local)**: http://localhost:8000/docs
- **Frontend (local)**: http://localhost:3000
- **Railway Dashboard**: https://railway.app/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Docker Desktop**: https://www.docker.com/products/docker-desktop

---

## Troubleshooting

**Port already in use:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Docker daemon not running:**
- Start Docker Desktop

**Module not found:**
```cmd
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

**Environment variables not loading:**
- Check file names: `.env` for backend, `.env.local` for frontend
- Check files are in correct directories
- Restart dev server after changes

---

## File Structure

```
PostcardApp/
├── backend/
│   ├── app/
│   ├── Dockerfile
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── Dockerfile
│   ├── .env.local
│   └── package.json
├── docker-compose.yml
├── RAILWAY_DEPLOYMENT.md
└── DOCKER_TEST_GUIDE.md
```

---

## Development Workflow

1. Make changes locally
2. Test with `npm run dev` / `uvicorn --reload`
3. Test Docker build: `docker build -t test .`
4. Test Docker run: `docker run -p 3000:3000 test`
5. Commit and push to GitHub
6. Railway auto-deploys from GitHub

---

## Need Help?

- **Docker Guide**: See `DOCKER_TEST_GUIDE.md`
- **Deployment Guide**: See `RAILWAY_DEPLOYMENT.md`
- **Railway Docs**: https://docs.railway.app/
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
