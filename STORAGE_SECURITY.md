# Storage Security Configuration

## Overview

This document outlines the security measures implemented for file storage in PostcardsTo using Supabase Storage.

## File Upload Security

### Frontend Validation (First Line of Defense)

**Location:**
- `frontend/components/AddPostForm.tsx` (post images)
- `frontend/app/feed/page.tsx` (avatar images)

**Validations:**
1. **File Type Validation**
   - Allowed types: JPEG, JPG, PNG, GIF, WebP
   - Validation method: Checks `file.type` MIME type
   - Rejects any other file types before upload

2. **File Size Validation**
   - Maximum size: 5MB
   - Prevents large file uploads that could consume storage/bandwidth

3. **Image Resizing**
   - Post images: Resized to max 800px
   - Avatar images: Resized to max 400px
   - Compression: JPEG quality 0.85
   - Benefits: Reduces storage costs, improves load times

### Backend Validation (Defense in Depth)

**Location:** `backend/app/utils/file_validation.py`

**Note:** Images are currently uploaded directly from frontend to Supabase Storage, bypassing the backend. The backend validation utilities are provided for future use if you implement server-side upload proxying.

**Available Functions:**
- `validate_image_file(file)` - Validates file type and size using MIME detection
- `validate_image_url(url)` - Validates image URLs
- `sanitize_filename(filename)` - Prevents path traversal attacks

**To use backend validation:**
```python
from app.utils.file_validation import validate_image_file

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    validate_image_file(file)  # Raises HTTPException if invalid
    # Process upload...
```

### Supabase Storage Policies

**Buckets:**
- `posts` - For post images (public read)
- `avatars` - For profile pictures (public read)

**Row Level Security Policies:**

See `STORAGE_POLICIES.sql` and `FIX_AVATAR_STORAGE.sql` for policy definitions.

**Current Policies:**
1. **Upload (INSERT)**: Only authenticated users can upload
2. **Update**: Users can only update their own files (identified by user ID in path)
3. **Delete**: Users can only delete their own files
4. **Read (SELECT)**: Public can view all images

**Security Considerations:**

✅ **Implemented:**
- File type validation on frontend
- File size limits on frontend
- Image resizing to prevent large files
- RLS policies on storage buckets
- Authentication required for uploads
- Ownership checks for updates/deletes

⚠️ **Recommendations:**
1. **Enable Storage Quotas:** Set per-user storage limits in Supabase dashboard
2. **Monitor Storage Usage:** Track unusual upload patterns
3. **Implement Rate Limiting:** Prevent upload spam
4. **Add Virus Scanning:** For production, integrate virus scanning (e.g., ClamAV)
5. **Content Moderation:** Consider automated NSFW detection for user-generated content

## File Naming Convention

**Format:** `{user_id}-{timestamp}.{extension}`

**Benefits:**
- Prevents filename collisions
- Associates files with users
- Enables easy cleanup of user data
- Prevents path traversal attacks

## Storage Bucket Configuration

### Public vs Private Buckets

**Current Setup:** Public buckets with RLS

**Alternative:** Private buckets with signed URLs
```typescript
// Generate signed URL (60 minute expiration)
const { data } = await supabase.storage
  .from('private-posts')
  .createSignedUrl('path/to/file', 3600)
```

**When to use Private:**
- Premium content
- Private messaging images
- Sensitive documents

## MIME Type Validation

### Frontend (Basic)
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
if (!allowedTypes.includes(file.type)) {
  // Reject
}
```

### Backend (Advanced - if implementing)
```python
import magic

# Actual file content inspection
mime = magic.from_buffer(file_content, mime=True)
if mime not in ALLOWED_IMAGE_TYPES:
    raise HTTPException(...)
```

**Why both?**
- Frontend: Better UX (immediate feedback)
- Backend: Security (can't be bypassed by malicious users)

## Attack Prevention

### 1. Path Traversal
**Attack:** Upload file named `../../etc/passwd`
**Defense:**
- Supabase generates its own file paths
- Backend sanitizes filenames if processing locally

### 2. File Type Spoofing
**Attack:** Rename `malware.exe` to `image.jpg`
**Defense:**
- Frontend checks MIME type
- Backend can use magic bytes detection
- Supabase storage doesn't execute files

### 3. Zip Bombs / Large Files
**Attack:** Upload huge compressed image
**Defense:**
- 5MB size limit enforced
- Image resizing before upload

### 4. XSS via SVG
**Attack:** Upload SVG with embedded JavaScript
**Defense:**
- SVG not in allowed types
- Content-Type validation
- CSP headers prevent execution

### 5. Storage Exhaustion
**Attack:** Upload spam to fill storage
**Defense:**
- Per-user quotas (configure in Supabase)
- Rate limiting (needs implementation)
- Monitoring alerts

## Monitoring & Alerts

### What to Monitor

1. **Upload Volume**
   - Unusual number of uploads from single user
   - Spike in total uploads

2. **File Sizes**
   - Files approaching size limits
   - Total storage consumption

3. **Failed Uploads**
   - Repeated validation failures
   - Potential attack attempts

4. **Storage Growth**
   - Unexpected storage cost increases
   - Quota approaching limits

### Supabase Dashboard

Access monitoring at: `https://app.supabase.com/project/{project-id}/storage/usage`

### Custom Logging

Add logging to track:
```python
logger.info(f"File upload: user={user_id}, size={file_size}, type={mime_type}")
```

## Production Checklist

Before deploying to production:

- [ ] Enable Supabase storage quotas
- [ ] Set up storage usage alerts
- [ ] Implement rate limiting on uploads
- [ ] Add monitoring for unusual upload patterns
- [ ] Consider virus scanning integration
- [ ] Review and test all RLS policies
- [ ] Set up automated backups
- [ ] Document disaster recovery procedures
- [ ] Test file deletion workflows
- [ ] Configure CDN caching for images
- [ ] Set up log aggregation for security events

## Additional Resources

- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security)
- [OWASP File Upload Guidelines](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
