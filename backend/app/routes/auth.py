"""Authentication routes."""

from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import Token, LoginRequest, SignupRequest
from app.database import supabase

router = APIRouter()


@router.post("/signup", response_model=Token)
async def signup(request: SignupRequest):
    """
    Sign up a new user with email and password.

    Note: For Google/Apple OAuth, this is handled by Supabase Auth on the frontend.
    """
    try:
        # Create user with Supabase Auth
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "username": request.username,
                    "first_name": request.first_name,
                    "last_name": request.last_name
                }
            }
        })

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not create user"
            )

        return Token(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            token_type="bearer",
            expires_in=response.session.expires_in
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    """
    Login with email and password.

    Note: For Google/Apple OAuth, this is handled by Supabase Auth on the frontend.
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        return Token(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            token_type="bearer",
            expires_in=response.session.expires_in
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout")
async def logout():
    """Logout current user."""
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}"
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    try:
        response = supabase.auth.refresh_session(refresh_token)

        return Token(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            token_type="bearer",
            expires_in=response.session.expires_in
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )
