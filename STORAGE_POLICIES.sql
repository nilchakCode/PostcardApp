-- Storage Policies for Posts Bucket
-- Run these in your Supabase SQL Editor

-- 1. Allow authenticated users to upload images to the posts bucket
CREATE POLICY "Authenticated users can upload to posts bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

-- 2. Allow authenticated users to update their own images
CREATE POLICY "Users can update their own posts images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own posts images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Allow public read access to all images in posts bucket
CREATE POLICY "Public can view posts images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- Optional: Storage Policies for Avatars Bucket (if you haven't set them up)

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload to avatars bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to view avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
