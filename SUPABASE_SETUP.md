# Supabase Setup Guide

This guide will walk you through setting up your Supabase database for PostcardsTo.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Name: PostcardsTo
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created (1-2 minutes)

## 2. Get Your API Credentials

1. Go to Project Settings > API
2. Copy the following:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret!)

## 3. Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

### Users Table

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Posts Table

```sql
-- Create posts table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  caption TEXT,
  post_type TEXT CHECK (post_type IN ('photo', 'story')) DEFAULT 'photo',
  image_url TEXT,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX posts_user_id_idx ON public.posts(user_id);
CREATE INDEX posts_created_at_idx ON public.posts(created_at DESC);
```

### Likes Table

```sql
-- Create likes table
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX likes_post_id_idx ON public.likes(post_id);
CREATE INDEX likes_user_id_idx ON public.likes(user_id);
```

### Comments Table (Optional)

```sql
-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX comments_post_id_idx ON public.comments(post_id);
```

### Updated At Trigger

```sql
-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for posts table
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for comments table
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Set Up Storage for Images

1. Go to Storage in your Supabase dashboard
2. Click "New Bucket"
3. Create a bucket named `posts`
4. Set it to **Public** (or create policies for authenticated users)
5. Optionally create another bucket named `avatars` for profile pictures

### Storage Policies (if using private buckets)

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');
```

## 5. Enable Authentication Providers

### Email Authentication (Already enabled by default)

1. Go to Authentication > Providers
2. Email is enabled by default

### Google OAuth

1. Go to Authentication > Providers
2. Enable Google
3. Go to [Google Cloud Console](https://console.cloud.google.com)
4. Create a new project or select existing one
5. Enable Google+ API
6. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
7. Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
8. Copy Client ID and Client Secret to Supabase

### Apple OAuth

1. Go to Authentication > Providers
2. Enable Apple
3. Go to [Apple Developer](https://developer.apple.com)
4. Create a Services ID
5. Configure Sign in with Apple
6. Add redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
7. Copy Service ID and generate a Key
8. Paste credentials in Supabase

## 6. Configure Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the confirmation email
3. Customize the password reset email
4. Add your branding

## 7. Set Up Realtime (Optional)

1. Go to Database > Replication
2. Enable replication for tables you want to subscribe to:
   - `posts`
   - `likes`
   - `comments`

This allows real-time updates in your frontend.

## 8. Test Your Setup

1. Copy your credentials to `.env` files in backend and frontend
2. Start both servers
3. Try signing up with email
4. Check if user appears in `auth.users` and `public.users` tables
5. Try OAuth login after configuring providers

## Security Best Practices

1. **Row Level Security**: Always enabled for all tables
2. **Service Role Key**: Only use in backend, never expose to frontend
3. **API Keys**: Use anon key in frontend
4. **Policies**: Review and test all RLS policies
5. **Storage**: Set appropriate bucket policies
6. **CORS**: Configure allowed origins in Supabase settings

## Monitoring

1. Go to Logs to view:
   - API logs
   - Database logs
   - Auth logs
2. Set up alerts for unusual activity
3. Monitor database size and API usage

## Backup

1. Supabase automatically backs up your database
2. You can also export data manually:
   - Go to Database > Backups
   - Download backups periodically

## Troubleshooting

### Can't connect to database
- Check if credentials are correct
- Verify network access (Supabase allows all IPs by default)

### OAuth not working
- Verify redirect URIs match exactly
- Check provider credentials
- Ensure providers are enabled in Supabase

### RLS blocking queries
- Check policies in SQL Editor
- Test with service role key (backend only)
- Review logs for policy violations

## Next Steps

1. Customize the schema for your needs
2. Add more tables (followers, notifications, etc.)
3. Set up database functions for complex queries
4. Enable database webhooks for automations
5. Set up database migrations for version control

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Auth Guide](https://supabase.com/docs/guides/auth)
