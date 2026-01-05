"""Application configuration settings."""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "PostcardsTo"
    debug: bool = True
    secret_key: str = "change-this-secret-key-in-production"

    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str = ""

    # CORS - can be a comma-separated string or list
    allowed_origins: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000"

    # OAuth (optional)
    google_client_id: str = ""
    google_client_secret: str = ""
    apple_client_id: str = ""
    apple_client_secret: str = ""

    # Email settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "POSTCARD"
    frontend_url: str = "http://localhost:3000"

    @field_validator('allowed_origins', mode='before')
    @classmethod
    def split_origins(cls, v):
        """Convert comma-separated string to list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
