# Login Page Fixes

## Issue 1: "Email Not Confirmed" Error

### Cause
By default, Supabase requires users to confirm their email before they can log in.

### Solution (Choose One)

#### Option A: Disable Email Confirmation (Development Only)

**Steps:**
1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Uncheck** "Confirm email"
4. Click **Save**

✅ Users can now login immediately after signup

#### Option B: Keep Email Confirmation (Production)

The signup page now shows a message if confirmation is required:
- User signs up
- Gets message: "Please check your email to confirm your account before logging in."
- User clicks confirmation link in email
- User can then login

**To customize the confirmation email:**
1. Go to **Authentication** → **Email Templates** in Supabase
2. Edit the "Confirm signup" template
3. Customize the message and styling

---

## Issue 2: Login with Email OR Username

### Previous Behavior
- Login only accepted **email addresses**
- Username couldn't be used to login

### New Behavior
The login form now accepts **BOTH**:
- ✅ Email: `user@postcardsto.com`
- ✅ Username: `johndoe`

### How It Works

**Login Logic:**
1. User enters email or username
2. System checks if input contains `@`
3. If YES → Login with email directly
4. If NO → Look up email from username, then login

**Example:**
```
Input: "john@example.com" → Login with email
Input: "johndoe" → Find email for username "johndoe" → Login with that email
```

### Label Updated
- Old: "Email Address"
- New: "Email or Username"
- Placeholder: "user@postcardsto.com or username"

---

## Testing the Fixes

### Test 1: Email Confirmation

**With confirmation disabled:**
1. Sign up with new account
2. Should redirect to feed immediately ✓

**With confirmation enabled:**
1. Sign up with new account
2. See message about checking email
3. Check email inbox
4. Click confirmation link
5. Now login works ✓

### Test 2: Login with Username

1. Sign up with:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`

2. Logout

3. Try logging in with email:
   - Email: `test@example.com`
   - Password: `password123`
   - Should work ✓

4. Try logging in with username:
   - Username: `testuser`
   - Password: `password123`
   - Should work ✓

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Email not confirmed" | User hasn't confirmed email | Check email and click link, or disable confirmation |
| "Username not found" | Username doesn't exist | Use email instead or check spelling |
| "Invalid login credentials" | Wrong password | Check password |
| "Failed to login" | Network/server issue | Check internet connection |

---

## Additional Notes

### Username Requirements
When signing up, username should:
- Be unique
- Be optional (users can skip it)
- Can be used for login if provided

### Email Requirements
- Must be valid email format
- Must be unique
- Always required

### Password Requirements
Default Supabase requirements:
- Minimum 6 characters
- Can be configured in Supabase → Authentication → Policies

---

## Troubleshooting

### Login with username not working?

**Check:**
1. User has a username set (not null)
2. `public.users` table exists and has data
3. RLS policies allow reading username:
   ```sql
   -- Verify this policy exists
   SELECT * FROM pg_policies
   WHERE tablename = 'users'
   AND policyname = 'Users can view all profiles';
   ```

### Still getting "email not confirmed"?

1. Check Supabase → Authentication → Users
2. Look at "Email Confirmed" column
3. If false, either:
   - Manually confirm (click ... → Confirm)
   - Disable confirmation requirement
   - Have user click email link

### Username lookup slow?

Add an index on username:
```sql
CREATE INDEX idx_users_username ON public.users(username);
```

---

## Summary

✅ **Fixed "Email not confirmed" error**
- Added signup message for email confirmation
- Instructions to disable confirmation for dev

✅ **Added username login support**
- Login accepts email OR username
- Automatically detects which one was entered
- Looks up email if username provided

✅ **Improved UX**
- Clear error messages
- Helpful placeholders
- Better form labels
