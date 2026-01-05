"""Post routes for photos and stories."""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.schemas.post import Post, PostCreate, PostUpdate
from app.utils.auth import get_current_user
from app.database import supabase, supabase_admin
from typing import Dict, List, Optional

router = APIRouter()


@router.post("/", response_model=Post, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Create a new post (photo or story)."""
    try:
        post_data = post.dict()
        post_data["user_id"] = current_user.id

        # Use admin client to bypass RLS
        response = supabase_admin.table("posts").insert(post_data).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not create post"
            )

        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not create post: {str(e)}"
        )


@router.get("/", response_model=List[Post])
async def get_posts(
    skip: int = 0,
    limit: int = 20,
    post_type: Optional[str] = None
):
    """Get all posts with pagination."""
    try:
        query = supabase.table("posts").select("*")

        if post_type:
            query = query.eq("post_type", post_type)

        response = query.order("created_at", desc=True).range(skip, skip + limit - 1).execute()

        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch posts: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=List[Post])
async def get_user_posts(
    user_id: str,
    skip: int = 0,
    limit: int = 20
):
    """Get posts by specific user."""
    try:
        response = (
            supabase.table("posts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(skip, skip + limit - 1)
            .execute()
        )

        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch user posts: {str(e)}"
        )


@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    """Get a specific post by ID."""
    try:
        response = supabase.table("posts").select("*").eq("id", post_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not fetch post: {str(e)}"
        )


@router.put("/{post_id}", response_model=Post)
@router.patch("/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    post_update: PostUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Update a post."""
    try:
        # Check if post belongs to current user
        post_response = supabase.table("posts").select("*").eq("id", post_id).execute()

        if not post_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        if post_response.data[0]["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this post"
            )

        update_data = post_update.dict(exclude_unset=True)
        # Use admin client to bypass RLS
        response = supabase_admin.table("posts").update(update_data).eq("id", post_id).execute()

        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not update post: {str(e)}"
        )


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a post."""
    try:
        # Check if post belongs to current user
        post_response = supabase.table("posts").select("*").eq("id", post_id).execute()

        if not post_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )

        if post_response.data[0]["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this post"
            )

        # Use admin client to bypass RLS
        supabase_admin.table("posts").delete().eq("id", post_id).execute()

        return {"message": "Post deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not delete post: {str(e)}"
        )


@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Like a post."""
    try:
        # Check if already liked
        existing = (
            supabase.table("likes")
            .select("*")
            .eq("post_id", post_id)
            .eq("user_id", current_user.id)
            .execute()
        )

        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Post already liked"
            )

        # Add like - use admin client to bypass RLS
        # Note: likes_count is automatically updated by database trigger
        supabase_admin.table("likes").insert({
            "post_id": post_id,
            "user_id": current_user.id
        }).execute()

        return {"message": "Post liked successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not like post: {str(e)}"
        )


@router.delete("/{post_id}/like")
async def unlike_post(
    post_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Unlike a post."""
    try:
        # Remove like - use admin client to bypass RLS
        # Note: likes_count is automatically updated by database trigger
        supabase_admin.table("likes").delete().eq("post_id", post_id).eq("user_id", current_user.id).execute()

        return {"message": "Post unliked successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not unlike post: {str(e)}"
        )
