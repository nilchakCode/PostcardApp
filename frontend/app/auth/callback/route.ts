import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // The code will be handled by Supabase client automatically
    // Redirect to feed page
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}
