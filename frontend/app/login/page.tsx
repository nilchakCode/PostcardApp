'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signInWithEmail, signInWithGoogle, signInWithApple } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@')

      if (isEmail) {
        // Login with email
        await signInWithEmail(emailOrUsername, password)
      } else {
        // Login with username - need to fetch email first
        const { supabase } = await import('@/lib/supabase')
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()

        if (fetchError || !userData) {
          // Generic error message to prevent username enumeration
          throw new Error('Invalid credentials')
        }

        await signInWithEmail(userData.email, password)
      }

      router.push('/feed')
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google')
    }
  }

  const handleAppleLogin = async () => {
    try {
      await signInWithApple()
    } catch (err: any) {
      setError(err.message || 'Failed to login with Apple')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-postcard-night-surface w-full max-w-lg shadow-modern-lg rounded-modern-2xl overflow-hidden">
        {/* Header Section */}
        <div className="border-b border-postcard-gray-200 dark:border-postcard-night-border p-6 sm:p-8 md:p-10 bg-gradient-to-br from-postcard-blue via-postcard-blue-light to-postcard-blue dark:from-postcard-blue-bright dark:via-postcard-blue-lighter dark:to-postcard-blue-bright">
          <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
            <div className="shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-3 border-white/50 bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg rounded-modern-lg">
                <Image src="/logo.svg" alt="PostcardsTo" width={80} height={80} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              </div>
            </div>
            <div className="flex-1 pt-1 sm:pt-2">
              <div className="text-xs uppercase tracking-wider text-white/70 mb-1 sm:mb-2 font-mono">
                Authentication Portal
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold lowercase text-white mb-1 sm:mb-2" style={{ letterSpacing: '0.05em' }}>
                postcard
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-mono">
                Access your moments // Share your stories
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-4 sm:p-6 md:p-8">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 border-l-4 border-red-500 bg-red-50">
              <p className="text-xs sm:text-sm text-red-700 font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="emailOrUsername" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-postcard-gray-300 dark:border-postcard-night-border dark:bg-postcard-night-bg dark:text-white focus:border-postcard-blue dark:focus:border-postcard-blue-bright focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                placeholder="user@postcardsto.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 border-postcard-gray-300 dark:border-postcard-night-border dark:bg-postcard-night-bg dark:text-white focus:border-postcard-blue dark:focus:border-postcard-blue-bright focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-postcard-red to-postcard-red-light dark:from-postcard-red-bright dark:to-postcard-red-lighter text-white py-3 sm:py-3.5 px-6 font-mono text-xs sm:text-sm uppercase tracking-wider hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md rounded-modern-lg font-semibold"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="my-6 sm:my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs uppercase tracking-wider text-gray-500 font-mono">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 border-2 border-postcard-gray-200 dark:border-postcard-night-border dark:bg-postcard-night-bg py-3 sm:py-3.5 px-4 sm:px-6 hover:border-postcard-blue dark:hover:border-postcard-blue-bright hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group rounded-modern-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-mono text-xs sm:text-sm uppercase tracking-wider">Google</span>
            </button>

            <button
              onClick={handleAppleLogin}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-postcard-black dark:bg-white text-white dark:text-black py-3 sm:py-3.5 px-4 sm:px-6 hover:bg-postcard-black-soft dark:hover:bg-postcard-gray-200 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-md rounded-modern-lg"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-mono text-xs sm:text-sm uppercase tracking-wider">Apple</span>
            </button>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200">
            <p className="text-center text-xs sm:text-sm font-mono text-gray-600">
              New user?{' '}
              <Link href="/signup" className="text-black font-bold hover:underline">
                Create Account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
