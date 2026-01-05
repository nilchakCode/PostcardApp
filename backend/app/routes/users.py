"""User routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import User, UserUpdate
from app.utils.auth import get_current_user
from app.database import supabase
from typing import Dict

router = APIRouter()


@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: Dict = Depends(get_current_user)):
    """Get current user profile."""
    try:
        # Fetch user profile from users table
        response = supabase.table("users").select("*").eq("id", current_user.id).execute()

        if not response.data:
            # If profile doesn't exist, create it
            user_data = {
                "id": current_user.id,
                "email": current_user.email,
                "username": current_user.user_metadata.get("username"),
                "first_name": current_user.user_metadata.get("first_name"),
                "last_name": current_user.user_metadata.get("last_name"),
                "avatar_url": current_user.user_metadata.get("avatar_url"),
            }
            response = supabase.table("users").insert(user_data).execute()

        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch user profile: {str(e)}"
        )


@router.put("/me", response_model=User)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update current user profile."""
    try:
        update_data = user_update.dict(exclude_unset=True)

        response = supabase.table("users").update(update_data).eq("id", current_user.id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update user profile: {str(e)}"
        )


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(user_id: str):
    """Get user profile by ID."""
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch user: {str(e)}"
        )
