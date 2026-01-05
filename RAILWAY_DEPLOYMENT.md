# Deploying PostcardApp to Railway

This guide will walk you through deploying both the backend (FastAPI) and frontend (Next.js) to Railway.

## ✅ Dockerfile Status: Railway Ready

**Recent Updates:**
- ✅ Backend: Dynamic PORT support (Railway auto-assigns ports)
- ✅ Frontend: Build-time environment variables (ARG) for Next.js
- ✅ Frontend: Dynamic CSP headers based on environment
- ✅ Both: Optimized .dockerignore files

## Prerequisites

1. A [Railway account](https://railway.app/) (sign up with GitHub)
2. [Railway CLI](https://docs.railway.app/develop/cli) (optional but recommended)
3. Your Supabase project already set up
4. Email credentials (Gmail, SendGrid, etc.) for invite functionality

## Option 1: Deploy via Railway Dashboard (Recommended for Beginners)

### Step 1: Create a New Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select your PostcardApp repository

### Step 2: Deploy Backend

1. In your Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your repository
4. Railway will detect the Dockerfile in the `backend` folder
5. Configure the service:
   - **Name**: `postcard-backend`
   - **Root Directory**: `/backend`
   - **Dockerfile Path**: `backend/Dockerfile`

6. Add Environment Variables (Settings → Variables):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   SECRET_KEY=your_secret_key_here
   ALLOWED_ORIGINS=https://your-frontend.railway.app

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=POSTCARD
   FRONTEND_URL=https://your-frontend.railway.app
   ```

7. Click "Deploy"

### Step 3: Deploy Frontend

1. In the same Railway project, click "+ New"
2. Select "GitHub Repo"
3. Choose your repository again
4. Configure the service:
   - **Name**: `postcard-frontend`
   - **Root Directory**: `/frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`

5. Add Environment Variables (Settings → Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

   **⚠️ IMPORTANT:** Next.js bundles these variables at BUILD TIME. You must ALSO set them as Build Arguments:

   - Go to **Settings** → **Build**
   - Scroll to **Build Arguments**
   - Add the same three variables there:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL`

6. Click "Deploy"

### Step 4: Update CORS Settings

1. Once backend is deployed, note its URL (e.g., `https://postcard-backend-production.up.railway.app`)
2. Update the backend's `ALLOWED_ORIGINS` environment variable to include your frontend URL
3. Redeploy the backend

### Step 5: Update Frontend API URL

1. Once frontend is deployed, note its URL
2. Update the backend's `FRONTEND_URL` environment variable
3. Update frontend's `NEXT_PUBLIC_API_URL` to point to your backend URL
4. Redeploy both services

## Option 2: Deploy via Railway CLI

### Installation

```bash
npm install -g @railway/cli
railway login
```

### Deploy Backend

```bash
cd backend
railway init
railway up
```

Set environment variables:
```bash
railway variables set SUPABASE_URL=your_supabase_url
railway variables set SUPABASE_KEY=your_supabase_anon_key
railway variables set SECRET_KEY=your_secret_key
# ... add all other variables
```

### Deploy Frontend

```bash
cd ../frontend
railway init
railway up
```

Set environment variables:
```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
railway variables set NEXT_PUBLIC_API_URL=https://your-backend-url
```

## Email Configuration for Gmail

To use Gmail for sending invite emails:

1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password
4. Use this password in `SMTP_PASSWORD` environment variable

## Alternative Email Providers

### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=your_mailgun_username
SMTP_PASSWORD=your_mailgun_password
```

## Custom Domain (Optional)

1. In Railway dashboard, go to your service settings
2. Click "Settings" → "Networking" → "Public Networking"
3. Click "Generate Domain" or "Add Custom Domain"
4. Follow instructions to configure DNS

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- View logs in Railway dashboard
- Ensure Supabase credentials are valid

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct (must include https://)
- Check CORS settings in backend (`ALLOWED_ORIGINS` must include frontend URL)
- Ensure backend is deployed and running
- **IMPORTANT:** Verify build arguments are set (not just environment variables)
- CSP errors: Check that frontend was built with correct `NEXT_PUBLIC_API_URL`

### Email invites not working
- Verify SMTP credentials are correct
- Check Railway logs for email sending errors
- For Gmail, ensure app password is used (not regular password)

### Build failures

**Backend:**
- Check Dockerfile syntax
- Ensure all dependencies are in requirements.txt
- Rust/Cargo installation takes time (pydantic-core dependency)
- Review Railway build logs

**Frontend:**
- Ensure build arguments are set (Settings → Build)
- All `NEXT_PUBLIC_*` variables must be in build arguments
- Check that `output: 'standalone'` is in next.config.js
- Review Railway build logs for missing dependencies

## Monitoring

1. **Logs**: View in Railway dashboard under "Deployments"
2. **Metrics**: Check CPU/Memory usage in "Metrics" tab
3. **Health Check**: Visit `https://your-backend.railway.app/health`

## Cost Optimization

Railway offers:
- Free tier: $5 of usage per month
- Hobby plan: $5/month + usage
- Pro plan: $20/month + usage

To optimize costs:
- Use Railway's sleep mode for non-production environments
- Monitor resource usage regularly
- Scale down when not needed

## Next Steps

1. Set up custom domain
2. Configure SSL certificates (automatic with Railway)
3. Set up monitoring and alerts
4. Configure database backups (Supabase handles this)
5. Set up CI/CD for automatic deployments

## Support

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Supabase Documentation](https://supabase.com/docs)
