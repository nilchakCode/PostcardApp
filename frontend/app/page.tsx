import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="text-center px-4 py-8">
        <div className="flex items-center justify-center mb-6">
          <Image src="/logo.svg" alt="PostcardsTo Logo" width={120} height={120} className="w-20 h-20 sm:w-28 sm:h-28" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans text-black mb-4 font-bold lowercase" style={{ letterSpacing: '0.05em' }}>
          postcard
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Share your moments, stories, and memories with the world
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-lg font-semibold mb-2">Share Photos</h3>
            <p className="text-sm sm:text-base text-gray-600">Upload and share your favorite moments with friends and family</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-semibold mb-2">Tell Stories</h3>
            <p className="text-sm sm:text-base text-gray-600">Create engaging stories that disappear after 24 hours</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md sm:col-span-2 md:col-span-1">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Secure Login</h3>
            <p className="text-sm sm:text-base text-gray-600">Sign in securely with Google or Apple</p>
          </div>
        </div>
      </main>
    </div>
  );
}
