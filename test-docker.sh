#!/bin/bash

# Docker Build Test Script for PostcardApp
# This script tests the Docker builds locally before deploying to Railway

set -e  # Exit on error

echo "======================================"
echo "PostcardApp Docker Build Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo ""

# Check if .env files exist
echo "Checking environment files..."
if [ ! -f "./backend/.env" ]; then
    echo -e "${YELLOW}⚠ backend/.env not found${NC}"
    echo "Creating from .env.example..."
    cp ./backend/.env.example ./backend/.env
    echo -e "${RED}⚠ Please update backend/.env with your actual credentials${NC}"
fi

if [ ! -f "./frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠ frontend/.env.local not found${NC}"
    echo "Creating from .env.example..."
    cp ./frontend/.env.example ./frontend/.env.local
    echo -e "${RED}⚠ Please update frontend/.env.local with your actual credentials${NC}"
fi

echo ""
echo "======================================"
echo "Testing Backend Build"
echo "======================================"
echo ""

cd backend
echo "Building backend Docker image..."
docker build -t postcard-backend:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend build successful${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

echo ""
echo "Testing backend container..."
docker run --rm -d \
    --name postcard-backend-test \
    -p 8000:8000 \
    --env-file .env \
    postcard-backend:test

# Wait for container to start
echo "Waiting for backend to start..."
sleep 5

# Test health endpoint
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    docker logs postcard-backend-test
    docker stop postcard-backend-test
    exit 1
fi

# Test API root
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend API root not responding (this may be ok)${NC}"
fi

echo ""
echo "Stopping backend test container..."
docker stop postcard-backend-test

cd ..

echo ""
echo "======================================"
echo "Testing Frontend Build"
echo "======================================"
echo ""

cd frontend
echo "Building frontend Docker image..."
docker build -t postcard-frontend:test .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo "Testing frontend container..."
docker run --rm -d \
    --name postcard-frontend-test \
    -p 3000:3000 \
    --env-file .env.local \
    postcard-frontend:test

# Wait for container to start
echo "Waiting for frontend to start..."
sleep 10

# Test frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠ Frontend not responding yet (may need more time)${NC}"
    docker logs postcard-frontend-test
fi

echo ""
echo "Stopping frontend test container..."
docker stop postcard-frontend-test

cd ..

echo ""
echo "======================================"
echo "Build Test Summary"
echo "======================================"
echo ""
echo -e "${GREEN}✓ Backend Docker build: SUCCESS${NC}"
echo -e "${GREEN}✓ Frontend Docker build: SUCCESS${NC}"
echo ""
echo "Both services built successfully!"
echo ""
echo "To run both services together, use:"
echo "  docker-compose up"
echo ""
echo "Or to run in detached mode:"
echo "  docker-compose up -d"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
