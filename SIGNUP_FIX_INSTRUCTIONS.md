# Fix: User Records Not Being Created in public.users

## Problem
When users sign up, a record is created in `auth.users` but NOT in `public.users` table.

## Solution
Add a database trigger that automatically creates a `public.users` record whenever someone signs up.

## Steps to Fix

### Option 1: Run the SQL File (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Open the file `FIX_USER_CREATION.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see a success message

### Option 2: Copy/Paste This SQL

Go to Supabase SQL Editor and run this:

```sql
-- Function to automatically create user profile in public.users
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Verify It Works

After running the SQL:

1. Go to your PostcardsTo signup page
2. Create a new test account
3. Go to Supabase Dashboard > Table Editor > `users`
4. You should see the new user record!

## How It Works

**Before:**
- User signs up → Record created in `auth.users` only
- `public.users` remains empty ❌

**After:**
- User signs up → Record created in `auth.users`
- Trigger automatically fires → Record also created in `public.users` ✓

The trigger extracts metadata from the signup (first_name, last_name, username) and creates the corresponding profile record automatically.

## What Gets Stored

The trigger copies these fields from signup metadata:
- `id` - User UUID from auth.users
- `email` - User's email
- `username` - Optional username
- `first_name` - First name from signup form
- `last_name` - Last name from signup form
- `avatar_url` - Profile picture URL (for OAuth)

## Testing

Test the signup with:
- Email: test@example.com
- Password: testpass123
- First Name: John
- Last Name: Doe
- Username: johndoe

Check `public.users` table - you should see John Doe's record!

## Troubleshooting

### Error: "function public.handle_new_user() does not exist"
- Make sure you ran the function creation part first
- Check Database > Functions in Supabase dashboard

### Users still not appearing
1. Check Table Editor > `users` - refresh the page
2. Go to Authentication > Users - verify user was created
3. Check Database > Logs for any errors
4. Verify the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

### Need to migrate existing users?
Run this to create profiles for existing auth users:
```sql
INSERT INTO public.users (id, email, username, first_name, last_name)
SELECT
  id,
  email,
  raw_user_meta_data->>'username',
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

## Done!
Your signup should now work correctly! 🎉
