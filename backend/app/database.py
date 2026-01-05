"""Supabase client configuration."""

from supabase import create_client, Client
from app.config import settings


def get_supabase_client() -> Client:
    """Create and return Supabase client instance."""
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase_admin_client() -> Client:
    """Create and return Supabase admin client with service role key."""
    if settings.supabase_service_key:
        return create_client(settings.supabase_url, settings.supabase_service_key)
    return get_supabase_client()


# Initialize clients
supabase: Client = get_supabase_client()
supabase_admin: Client = get_supabase_admin_client()
