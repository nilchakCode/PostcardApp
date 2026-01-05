-- ============================================
-- FIX: Like Counter Race Condition
-- ============================================
-- This creates database triggers to automatically manage like counts
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create function to increment likes_count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create function to decrement likes_count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger for when a like is added
DROP TRIGGER IF EXISTS increment_post_likes ON public.likes;
CREATE TRIGGER increment_post_likes
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

-- Step 4: Create trigger for when a like is removed
DROP TRIGGER IF EXISTS decrement_post_likes ON public.likes;
CREATE TRIGGER decrement_post_likes
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();

-- Step 5: Fix any existing incorrect counts (one-time cleanup)
UPDATE public.posts
SET likes_count = (
  SELECT COUNT(*)
  FROM public.likes
  WHERE likes.post_id = posts.id
);

-- Verify the triggers were created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'likes';
