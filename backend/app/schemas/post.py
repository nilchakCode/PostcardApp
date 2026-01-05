"""Post schemas for photos and stories."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PostType(str, Enum):
    """Post type enum."""
    PHOTO = "photo"
    STORY = "story"


class PostBase(BaseModel):
    """Base post schema."""
    caption: Optional[str] = None
    post_type: PostType = PostType.PHOTO
    image_url: Optional[str] = None
    tags: Optional[List[str]] = []


class PostCreate(PostBase):
    """Schema for creating a new post."""
    pass


class PostUpdate(BaseModel):
    """Schema for updating a post."""
    caption: Optional[str] = None
    tags: Optional[List[str]] = None


class Post(PostBase):
    """Post schema with all fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    likes_count: int = 0

    class Config:
        from_attributes = True
