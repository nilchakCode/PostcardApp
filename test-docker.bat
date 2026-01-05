@echo off
REM Docker Build Test Script for PostcardApp (Windows)
REM This script tests the Docker builds locally before deploying to Railway

echo ======================================
echo PostcardApp Docker Build Test
echo ======================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo [OK] Docker is installed
echo.

REM Check if .env files exist
echo Checking environment files...
if not exist "backend\.env" (
    echo [WARNING] backend\.env not found
    echo Creating from .env.example...
    copy backend\.env.example backend\.env
    echo [WARNING] Please update backend\.env with your actual credentials
)

if not exist "frontend\.env.local" (
    echo [WARNING] frontend\.env.local not found
    echo Creating from .env.example...
    copy frontend\.env.example frontend\.env.local
    echo [WARNING] Please update frontend\.env.local with your actual credentials
)

echo.
echo ======================================
echo Testing Backend Build
echo ======================================
echo.

cd backend
echo Building backend Docker image...
docker build -t postcard-backend:test .

if %errorlevel% neq 0 (
    echo [FAILED] Backend build failed
    exit /b 1
)

echo [OK] Backend build successful
echo.

echo Testing backend container...
docker run --rm -d --name postcard-backend-test -p 8000:8000 --env-file .env postcard-backend:test

REM Wait for container to start
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Test health endpoint
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend health check passed
) else (
    echo [FAILED] Backend health check failed
    docker logs postcard-backend-test
    docker stop postcard-backend-test
    exit /b 1
)

REM Test API root
curl -f http://localhost:8000/ >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API is responding
) else (
    echo [WARNING] Backend API root not responding (this may be ok)
)

echo.
echo Stopping backend test container...
docker stop postcard-backend-test

cd ..

echo.
echo ======================================
echo Testing Frontend Build
echo ======================================
echo.

cd frontend
echo Building frontend Docker image...
docker build -t postcard-frontend:test .

if %errorlevel% neq 0 (
    echo [FAILED] Frontend build failed
    exit /b 1
)

echo [OK] Frontend build successful
echo.

echo Testing frontend container...
docker run --rm -d --name postcard-frontend-test -p 3000:3000 --env-file .env.local postcard-frontend:test

REM Wait for container to start
echo Waiting for frontend to start...
timeout /t 10 /nobreak >nul

REM Test frontend
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is responding
) else (
    echo [WARNING] Frontend not responding yet (may need more time)
    docker logs postcard-frontend-test
)

echo.
echo Stopping frontend test container...
docker stop postcard-frontend-test

cd ..

echo.
echo ======================================
echo Build Test Summary
echo ======================================
echo.
echo [OK] Backend Docker build: SUCCESS
echo [OK] Frontend Docker build: SUCCESS
echo.
echo Both services built successfully!
echo.
echo To run both services together, use:
echo   docker-compose up
echo.
echo Or to run in detached mode:
echo   docker-compose up -d
echo.
echo To stop services:
echo   docker-compose down
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
pause
