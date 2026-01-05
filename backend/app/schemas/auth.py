"""Authentication schemas."""

from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: str
    password: str


class SignupRequest(BaseModel):
    """Signup request schema."""
    email: str
    password: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
