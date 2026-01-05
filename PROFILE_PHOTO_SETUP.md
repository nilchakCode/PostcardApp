# Profile Photo Upload - Setup Guide

## Overview
Users can now upload a profile photo on the feed page. The photo is displayed in a passport-style ID card format with their name and email.

## Features
- ✅ Passport-size profile photo (128x160px)
- ✅ Shows user's full name (first + last name)
- ✅ Shows email address
- ✅ Shows username (if set)
- ✅ Click on photo to upload new image
- ✅ Automatic image resizing (max 400px)
- ✅ Default initials shown if no photo uploaded
- ✅ Hover effect with camera icon

## Supabase Storage Setup

### Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Click **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter these details:
   - **Name:** `avatars`
   - **Public bucket:** ✅ **YES** (check this box)
5. Click **Create Bucket**

### Step 2: Set Up Storage Policies (Optional)

The bucket is already public, but you can add extra policies for security:

```sql
-- Run this in SQL Editor (optional - for extra security)

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = split_part(name, '/', 1));

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = split_part(name, '/', 1));
```

Or use the provided SQL file: `SETUP_AVATARS_STORAGE.sql`

## How It Works

### Default State (No Photo)
- Shows user's initials in a gray box
- Example: "JD" for John Doe
- Falls back to first letter of email if no name

### Uploading a Photo
1. User clicks on the profile photo box
2. File picker opens
3. User selects an image
4. Image is automatically resized to max 400px (for faster loading)
5. Image is uploaded to Supabase Storage (`avatars/` folder)
6. User's `avatar_url` is updated in database
7. Photo appears immediately

### Image Specifications
- **Max size:** 400px (auto-resized)
- **Format:** JPEG (85% quality)
- **Storage:** Supabase Storage bucket `avatars`
- **Naming:** `{user_id}-{timestamp}.{ext}`

## UI Design

### Profile Card Layout
```
┌─────────────────────────────────┐
│  USER PROFILE                   │
│  MY ACCOUNT                     │
├─────────────────────────────────┤
│  ┌────────┐                     │
│  │        │  Full Name          │
│  │ PHOTO  │  JOHN DOE           │
│  │        │                     │
│  │  or    │  Email Address      │
│  │   JD   │  john@example.com   │
│  │        │                     │
│  └────────┘  Username           │
│              @johndoe            │
└─────────────────────────────────┘
```

### Styling
- **Border:** 2px solid black (ID card style)
- **Photo box:** 128x160px (passport size)
- **Font:** Monospace for technical feel
- **Initials:** Large, gray, centered
- **Hover:** Dark overlay with camera icon

## Testing

### Test 1: No Photo (Default)
1. Login to a fresh account
2. Go to feed page
3. Should see initials in photo box
4. Hover should show "Change Photo"

### Test 2: Upload Photo
1. Click on photo box
2. Select an image file
3. Should see "Uploading..." message
4. Photo should appear in the box
5. Refresh page - photo should persist

### Test 3: Change Photo
1. Click on existing photo
2. Select different image
3. Old photo should be replaced
4. New photo should appear

## Troubleshooting

### Error: "Failed to upload"
**Possible causes:**
1. Storage bucket doesn't exist
   - **Solution:** Create `avatars` bucket in Supabase Storage
2. Bucket is not public
   - **Solution:** Make bucket public in settings
3. No storage policies
   - **Solution:** Run the SQL setup script

### Photo not appearing after upload
1. Check browser console for errors
2. Verify image uploaded to Storage:
   - Go to Supabase > Storage > avatars
   - Should see file named `{user-id}-{timestamp}.jpg`
3. Check `avatar_url` in database:
   - Go to Table Editor > users
   - `avatar_url` column should have URL

### Image too large / slow to load
- Images are automatically resized to 400px max
- Quality set to 85%
- If still slow, check your internet connection

### Initials not showing correctly
- Check that `first_name` and `last_name` are set in database
- Falls back to email first letter if names missing
- Update profile information to fix

## File Size Limits

**Before Upload:** Any size
**After Resize:** ~50-150 KB (depending on image complexity)
**Supabase Free Tier:** 1GB storage (plenty for thousands of avatars)

## Best Practices

### For Users
- Upload square or portrait photos
- Face should be clearly visible
- Use good lighting
- Supported formats: JPG, PNG, GIF, WebP

### For Developers
- Always resize images before upload (already implemented ✓)
- Use user ID in filename to avoid conflicts (already implemented ✓)
- Set reasonable max dimensions (400px is good ✓)
- Compress images (85% quality is optimal ✓)

## Security Notes

✅ **Implemented:**
- Only authenticated users can upload
- Images resized to prevent huge uploads
- User ID in filename prevents overwrites
- Public bucket for easy access

⚠️ **Additional Security (Optional):**
- Add file type validation
- Add virus scanning
- Add upload rate limiting
- Add max file size check

## Database Schema

The profile photo URL is stored in:

```sql
public.users {
  id UUID PRIMARY KEY,
  avatar_url TEXT,  -- Stores the Supabase Storage URL
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  username TEXT,
  ...
}
```

## Next Steps

1. ✅ Create `avatars` storage bucket
2. ✅ Test photo upload
3. Optional: Add photo cropping tool
4. Optional: Add photo filters
5. Optional: Support for GIF avatars
6. Optional: Avatar gallery/history

## Summary

The profile photo feature is complete! Users can:
- See their profile in ID card style
- Upload photos by clicking
- See initials as default
- Have photos auto-resized and stored securely

Just create the `avatars` storage bucket in Supabase and you're ready to go! 🎉
