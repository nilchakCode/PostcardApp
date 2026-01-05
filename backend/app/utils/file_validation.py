"""File validation utilities for secure file uploads."""

from typing import Tuple
import magic  # python-magic library for MIME type detection
from fastapi import UploadFile, HTTPException, status


# Allowed MIME types for image uploads
ALLOWED_IMAGE_TYPES = {
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
}

# Maximum file size (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes


def validate_image_file(file: UploadFile) -> Tuple[bool, str]:
    """
    Validate uploaded image file for type and size.

    Args:
        file: The uploaded file to validate

    Returns:
        Tuple of (is_valid, error_message)

    Raises:
        HTTPException: If validation fails
    """
    # Check file extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )

    file_ext = file.filename.split('.')[-1].lower()
    valid_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}

    if file_ext not in valid_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(valid_extensions)}"
        )

    # Read file content for validation
    file_content = file.file.read()
    file_size = len(file_content)

    # Reset file pointer for further processing
    file.file.seek(0)

    # Validate file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )

    # Validate MIME type using python-magic (more secure than trusting Content-Type header)
    # Note: This requires libmagic to be installed
    # For development without libmagic, you can check content_type from the header
    try:
        mime = magic.from_buffer(file_content, mime=True)
        if mime not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Detected: {mime}. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
    except Exception:
        # Fallback to content_type if magic is not available
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )

    return True, ""


def validate_image_url(url: str) -> bool:
    """
    Validate that a URL points to an allowed image format.

    Args:
        url: The URL to validate

    Returns:
        True if valid, False otherwise
    """
    if not url:
        return False

    # Check if URL ends with valid image extension
    valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    url_lower = url.lower()

    return any(url_lower.endswith(ext) for ext in valid_extensions)


# Sanitize filename to prevent path traversal attacks
def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and other attacks.

    Args:
        filename: The original filename

    Returns:
        Sanitized filename safe for storage
    """
    import re

    # Remove any path components
    filename = filename.split('/')[-1].split('\\')[-1]

    # Remove any non-alphanumeric characters except dots, hyphens, and underscores
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)

    # Ensure filename doesn't start with a dot
    if filename.startswith('.'):
        filename = '_' + filename[1:]

    return filename
