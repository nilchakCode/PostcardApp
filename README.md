# PostcardsTo

<div align="center">
  <img src="frontend/public/logo.svg" alt="PostcardsTo Logo" width="120"/>
  <p><strong>Share your moments, stories, and memories with the world</strong></p>
</div>

A modern social media web application for sharing photos and stories, built with FastAPI (Python) backend and Next.js (React) frontend, powered by Supabase.

## Features

- User authentication with Google and Apple OAuth
- Email/password authentication
- Photo and story sharing
- User profiles
- Like functionality
- Real-time updates with Supabase
- Secure file storage with Supabase Storage
- RESTful API with FastAPI
- Modern, responsive UI with Tailwind CSS

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - Backend-as-a-Service (Database, Auth, Storage)
- **Pydantic** - Data validation
- **Python 3.9+**

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase JS Client** - Database and Auth
- **Axios** - HTTP client

## Project Structure

```
PostcardsTo/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routes/      # API endpoints
│   │   ├── schemas/     # Pydantic models
│   │   ├── utils/       # Helper functions
│   │   ├── config.py    # Configuration
│   │   ├── database.py  # Supabase client
│   │   └── main.py      # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── lib/           # Utilities and configs
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier available)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

3. Set up the database tables (see SUPABASE_SETUP.md for detailed SQL)

4. Enable authentication providers:
   - Go to Authentication > Providers
   - Enable Google OAuth (add Client ID and Secret)
   - Enable Apple OAuth (add Service ID and Key)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
copy .env.example .env
# Edit .env with your Supabase credentials

# Run the backend
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file and configure
copy .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SECRET_KEY=your-secret-key-change-this
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/{user_id}` - Get user by ID

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/{post_id}` - Get specific post
- `PUT /api/posts/{post_id}` - Update post
- `DELETE /api/posts/{post_id}` - Delete post
- `POST /api/posts/{post_id}/like` - Like a post
- `DELETE /api/posts/{post_id}/like` - Unlike a post
- `GET /api/posts/user/{user_id}` - Get user's posts

## Database Schema

See `SUPABASE_SETUP.md` for the complete database schema and setup instructions.

## Authentication Flow

1. **OAuth (Google/Apple)**:
   - User clicks "Continue with Google/Apple"
   - Redirected to provider's OAuth page
   - After approval, redirected to `/auth/callback`
   - Supabase handles token exchange
   - User redirected to `/feed`

2. **Email/Password**:
   - User submits email and password
   - Backend validates credentials with Supabase
   - Returns access token and refresh token
   - Frontend stores session
   - User redirected to `/feed`

## Deployment

### Backend Deployment (Railway, Render, or Fly.io)

1. Set environment variables in your hosting platform
2. Deploy the backend directory
3. Update CORS allowed origins

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

1. Set environment variables in Vercel dashboard
2. Update Supabase redirect URLs to include production domain

## Development Tips

1. **Hot Reload**: Both backend and frontend support hot reload during development
2. **API Docs**: Visit `/docs` on the backend for interactive API documentation
3. **Type Safety**: Use TypeScript interfaces that match Pydantic schemas
4. **Database**: Use Supabase Studio to view and edit data visually

## Security Considerations

- Never commit `.env` files
- Use service role key only in backend, never expose to frontend
- Enable Row Level Security (RLS) in Supabase
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
