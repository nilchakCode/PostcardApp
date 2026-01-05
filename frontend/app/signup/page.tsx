'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signUpWithEmail, signInWithGoogle, signInWithApple } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signUpWithEmail(email, password, {
        username,
        first_name: firstName,
        last_name: lastName
      })

      // Check if email confirmation is required
      if (result.user && !result.session) {
        setError('Please check your email to confirm your account before logging in.')
      } else {
        router.push('/feed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
    }
  }

  const handleAppleSignup = async () => {
    try {
      await signInWithApple()
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Apple')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white border-2 border-black w-full max-w-lg">
        {/* Header Section */}
        <div className="border-b-2 border-black p-4 sm:p-6 md:p-8">
          <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
            <div className="shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 border-black bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Image src="/logo.svg" alt="PostcardsTo" width={80} height={80} className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              </div>
            </div>
            <div className="flex-1 pt-1 sm:pt-2">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1 sm:mb-2 font-mono">
                New User Registration
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold lowercase text-black mb-1 sm:mb-2" style={{ letterSpacing: '0.05em' }}>
                join us
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-mono">
                Create your profile // Start sharing
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

          <form onSubmit={handleEmailSignup} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                placeholder="user@postcardsto.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-gray-700 mb-2 font-mono">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors font-mono text-xs sm:text-sm"
                placeholder="••••••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 sm:py-3 px-6 font-mono text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 sm:my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-xs uppercase tracking-wider text-gray-500 font-mono">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 border-2 border-gray-300 py-2 sm:py-3 px-4 sm:px-6 hover:border-black transition-colors group"
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
              onClick={handleAppleSignup}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-black text-white border-2 border-black py-2 sm:py-3 px-4 sm:px-6 hover:bg-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="font-mono text-xs sm:text-sm uppercase tracking-wider">Apple</span>
            </button>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200">
            <p className="text-center text-xs sm:text-sm font-mono text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-bold hover:underline">
                Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
