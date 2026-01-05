# Add Post Feature - Setup Guide

The add post feature has been successfully implemented! This allows users to create both photo posts and story posts.

## What's New

### Frontend Components
- **AddPostForm Component** (`frontend/components/AddPostForm.tsx`): A modal form that handles:
  - Photo post creation with required image upload
  - Story post creation with optional image
  - Caption/text input
  - Tag management (comma-separated)
  - Image resizing and optimization
  - Upload to Supabase Storage

### Updated Feed Page
- **Two clickable cards** on the feed page to create posts:
  - 📸 Upload a Photo - Opens photo post form
  - 📖 Create a Story - Opens story post form
- **Posts display** showing all posts with:
  - Post type badge (Photo/Story)
  - Images (if available)
  - Captions
  - Tags
  - Like count
  - Creation date

## Required Setup

### 1. Create Supabase Storage Bucket (IMPORTANT!)

Before users can upload images, you need to create a storage bucket in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **"New Bucket"**
4. Create a bucket with these settings:
   - **Name**: `posts`
   - **Public**: ✅ Yes (check this box)
   - **File size limit**: Default or set to 5MB
   - **Allowed MIME types**: Leave default or set to `image/*`

5. Optionally, create another bucket for avatars if it doesn't exist:
   - **Name**: `avatars`
   - **Public**: ✅ Yes

### 2. Verify Backend Environment Variables

**CRITICAL**: Make sure your backend `.env` file has the service role key:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

To get your service role key:
1. Go to Supabase Dashboard > Project Settings > API
2. Copy the `service_role` key (keep it secret!)
3. Add it to your backend `.env` file

The backend already has all the necessary endpoints:
- `POST /api/posts/` - Create post
- `GET /api/posts/` - Get all posts
- And other post-related endpoints

Make sure the backend is running on `http://localhost:8000`

### 3. Start Using the Feature

1. Start the backend:
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   uvicorn app.main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Login to your app at `http://localhost:3000`

4. Click either card on the feed page:
   - 📸 **Upload a Photo** - Requires an image, caption optional
   - 📖 **Create a Story** - Requires text/caption, image optional

## Features

### Photo Posts
- **Required**: Image file (JPEG, PNG, etc.)
- **Optional**: Caption, tags
- Images are automatically resized to max 800px width/height
- Compressed to 85% quality JPEG for optimal performance

### Story Posts
- **Required**: Text/caption
- **Optional**: Image, tags
- Perfect for sharing thoughts, updates, or short stories

### Tags
- Add multiple tags separated by commas
- Example: `travel, friends, adventure`
- Displayed as blue chips below the post

### Post Display
- All posts appear in the feed below the creation cards
- Chronologically ordered (newest first by default)
- Shows post type, image, caption, tags, and likes
- Postcard-themed design matching the app aesthetic

## Technical Details

### Image Processing
- Client-side image resizing using Canvas API
- Maximum dimension: 800px
- Output format: JPEG at 85% quality
- Automatic orientation handling

### Data Flow
1. User fills form and selects image
2. Image is resized on client-side
3. Image uploaded to Supabase Storage `posts/` bucket
4. Post data (including image URL) sent to backend API
5. Backend creates database record
6. Frontend refreshes and displays new post

### File Naming
Images are stored with the pattern:
```
posts/{userId}-{timestamp}.{extension}
```

This ensures:
- No filename conflicts
- Easy identification of post owner
- Chronological organization

## Troubleshooting

### "new row violates row-level security policy" Error
**Cause**: Backend is missing the service role key
**Solution**:
1. Go to Supabase Dashboard > Project Settings > API
2. Copy your **service_role** key (NOT the anon key)
3. Add to backend `.env` file: `SUPABASE_SERVICE_KEY=your_service_role_key`
4. Restart the backend server
5. Try creating a post again

### "Failed to upload image" Error
**Cause**: Storage bucket doesn't exist or isn't public
**Solution**:
1. Create the `posts` bucket in Supabase Storage
2. Make sure it's set to **Public**
3. Try uploading again

### "Failed to create post" Error
**Cause**: Backend not running or API connection issue
**Solution**:
1. Check backend is running at `http://localhost:8000`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser console for detailed error

### Images Not Displaying
**Cause**: Bucket not public or RLS policies blocking access
**Solution**:
1. Set bucket to public in Supabase Storage settings
2. Or add RLS policies (see SUPABASE_SETUP.md section 4)

### "No posts yet" Message
**Cause**: No posts have been created yet, or API error
**Solution**:
1. Try creating a post
2. Check browser console for errors
3. Verify backend is returning posts: `http://localhost:8000/api/posts/`

## Design Notes

The add post feature follows the Postcard app's design system:
- **Black borders** on cards and modals (2-4px)
- **Monospace font** for labels and metadata
- **Serif font** for headings
- **Blue accents** for call-to-action buttons
- **Gradient backgrounds** on headers
- **Stamp-like aesthetic** for profile pictures

## Next Steps

Consider adding these enhancements:
- [ ] Image filters or editing before upload
- [ ] Multiple images per post
- [ ] Functional like button (currently display-only)
- [ ] Comment functionality
- [ ] Post deletion for post owners
- [ ] Post editing
- [ ] Share functionality
- [ ] Infinite scroll for posts
- [ ] Filter posts by tags

## API Reference

### Create Post
```typescript
POST /api/posts/
Content-Type: application/json
Authorization: Bearer {token}

{
  "caption": "string or null",
  "post_type": "photo" | "story",
  "image_url": "string or null",
  "tags": ["tag1", "tag2"] or null
}
```

### Get Posts
```typescript
GET /api/posts/
Authorization: Bearer {token}

Returns: Array of post objects with user info
```

## File Locations

- **AddPostForm Component**: `frontend/components/AddPostForm.tsx`
- **Feed Page**: `frontend/app/feed/page.tsx`
- **Backend Routes**: `backend/app/routes/posts.py`
- **Post Schema**: `backend/app/schemas/post.py`

Happy posting!
