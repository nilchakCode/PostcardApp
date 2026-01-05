# Fix: Avatar Upload RLS Error

## Problem
Getting error: "violates row level security policy" when uploading profile photo.

## Solution

### Quick Fix (2 minutes)

**Option 1: Using SQL (Recommended)**

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload
CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update
CREATE POLICY "Anyone can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete
CREATE POLICY "Anyone can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

4. Click **Run** (or Ctrl+Enter)
5. Should see "Success. No rows returned"

**Option 2: Using Dashboard UI**

1. Go to **Supabase Dashboard**
2. Navigate to **Storage**
3. If `avatars` bucket doesn't exist:
   - Click **New Bucket**
   - Name: `avatars`
   - **Check** "Public bucket"
   - Click **Create**

4. Click on the **avatars** bucket
5. Go to **Policies** tab
6. Click **New Policy**
7. Choose **"For full customization"**
8. Create these 4 policies:

**Policy 1: Read Access**
- Policy name: `Avatar images are publicly accessible`
- Allowed operation: SELECT
- Target roles: `public`
- USING expression: `bucket_id = 'avatars'`

**Policy 2: Upload Access**
- Policy name: `Anyone can upload an avatar`
- Allowed operation: INSERT
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'avatars'`

**Policy 3: Update Access**
- Policy name: `Anyone can update their own avatar`
- Allowed operation: UPDATE
- Target roles: `authenticated`
- USING expression: `bucket_id = 'avatars'`

**Policy 4: Delete Access**
- Policy name: `Anyone can delete their own avatar`
- Allowed operation: DELETE
- Target roles: `authenticated`
- USING expression: `bucket_id = 'avatars'`

---

## Verify It Works

1. Go to your app's feed page
2. Click on the profile photo box
3. Select an image
4. Should upload successfully! ✅

---

## What Went Wrong?

The storage bucket either:
- ❌ Didn't exist
- ❌ Wasn't marked as public
- ❌ Didn't have RLS policies allowing uploads

The SQL script above fixes all three issues.

---

## Understanding the Policies

### Public Read Access
```sql
SELECT ... WHERE bucket_id = 'avatars'
```
Anyone can **view** avatars (needed to display photos on the page)

### Authenticated Upload
```sql
INSERT ... WHERE bucket_id = 'avatars' AND [user is authenticated]
```
Logged-in users can **upload** avatars

### Authenticated Update
```sql
UPDATE ... WHERE bucket_id = 'avatars' AND [user is authenticated]
```
Logged-in users can **replace** avatars

### Authenticated Delete
```sql
DELETE ... WHERE bucket_id = 'avatars' AND [user is authenticated]
```
Logged-in users can **remove** avatars

---

## More Secure Policies (Optional)

If you want users to ONLY modify their own avatars:

```sql
-- Replace the INSERT policy with this:
CREATE POLICY "Users can only upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Replace the UPDATE policy with this:
CREATE POLICY "Users can only update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Replace the DELETE policy with this:
CREATE POLICY "Users can only delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

This ensures users can only modify files in their own folder (`avatars/{user-id}/...`)

---

## Troubleshooting

### Still getting RLS error after running SQL?

1. **Refresh the page** - Browser might be caching the error
2. **Check if bucket exists:**
   - Go to Storage in Supabase
   - Should see `avatars` bucket listed
3. **Check if bucket is public:**
   - Click on `avatars` bucket
   - Look for "Public" badge
4. **Check policies:**
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename = 'objects'
   AND schemaname = 'storage';
   ```
   Should see 4 policies for avatars

### Upload works but image doesn't display?

1. Check if `avatar_url` is being saved:
   - Go to Table Editor > users
   - Check `avatar_url` column
   - Should have URL like: `https://.../storage/v1/object/public/avatars/...`

2. Check if URL is accessible:
   - Copy the `avatar_url`
   - Paste in browser
   - Image should load

3. Check if bucket is public:
   - If not, make it public in Storage settings

### Different error message?

**"Row is locked"** - Another upload in progress, wait and retry

**"Bucket not found"** - Run the SQL to create the bucket

**"Invalid file type"** - Only images allowed (jpg, png, gif, webp)

**"File too large"** - Free tier limit is 50MB per file (resizing should prevent this)

---

## Testing Checklist

After running the fix:

- [ ] Can see profile photo box in feed page
- [ ] Can click on photo box
- [ ] File picker opens
- [ ] Can select an image
- [ ] Image uploads without error
- [ ] Photo appears in the box
- [ ] Refresh page - photo persists
- [ ] Can change photo by clicking again

---

## Summary

Run the SQL script from `FIX_AVATAR_STORAGE.sql` or manually create the storage bucket with policies. This will fix the RLS error and allow avatar uploads! 🎉
