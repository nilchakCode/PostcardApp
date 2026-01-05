"""FastAPI main application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, posts, users, invites
from app.middleware.security import SecurityHeadersMiddleware
from app.middleware.monitoring import SecurityMonitoringMiddleware

app = FastAPI(
    title=settings.app_name,
    description="Backend API for PostcardsTo - A social media platform for photos and stories",
    version="0.1.0"
)

# Add security monitoring middleware
app.add_middleware(SecurityMonitoringMiddleware)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(invites.router, prefix="/api/invites", tags=["Invites"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to PostcardsTo API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
