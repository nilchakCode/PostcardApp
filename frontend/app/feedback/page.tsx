'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function FeedbackPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCreator, setExpandedCreator] = useState<number | null>(null)
  const [expandedReader, setExpandedReader] = useState<number | null>(null)
  const [expandedGeneral, setExpandedGeneral] = useState<number | null>(null)

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null
    const theme = savedTheme || 'light'

    const applyTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }

    applyTheme()

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  const creatorFAQs = [
    {
      question: "How do I upload a photo?",
      answer: "Click on the '📸 Upload a Photo' button in your feed. You can then select an image from your device, add a caption, and tag your post."
    },
    {
      question: "How do I create a story with multiple images?",
      answer: "Click on '📖 Share Your Story' and select up to 4 images. You can arrange them in a grid or carousel view for your readers."
    },
    {
      question: "Can I edit my posts after publishing?",
      answer: "Yes! Click the three-dot menu on your post and select 'Edit'. You can update the caption and tags anytime."
    },
    {
      question: "How do I delete a post?",
      answer: "Click the three-dot menu on your post and select 'Delete'. You'll be asked to confirm before the post is permanently removed."
    },
    {
      question: "What image formats are supported?",
      answer: "We support JPEG, PNG, GIF, and WebP formats. Images must be under 5MB in size."
    }
  ]

  const readerFAQs = [
    {
      question: "How do I search for posts?",
      answer: "Use the search bar at the top of your feed. You can search by tags or keywords in captions to find specific content."
    },
    {
      question: "Can I like posts?",
      answer: "Yes! Click the heart icon at the bottom of any post to show your appreciation. The like count is visible to everyone."
    },
    {
      question: "How do I switch between grid and carousel view?",
      answer: "For stories with multiple images, you'll see view toggle buttons above the images. Click 'Grid' for a gallery view or 'Carousel' for a slideshow."
    },
    {
      question: "Can I share posts with friends?",
      answer: "This feature is coming soon! You'll be able to share posts directly from the three-dot menu."
    },
    {
      question: "How do I change my profile picture?",
      answer: "Click on your profile picture in the navigation bar. A camera icon will appear on hover - click it to upload a new photo."
    }
  ]

  const generalFAQs = [
    {
      question: "How do I change the theme?",
      answer: "Click the orange hamburger menu in the bottom left corner and select your preferred theme: Light, Dark, or Auto (which matches your system preference)."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use Supabase for secure authentication and data storage. All images are stored securely in the cloud."
    },
    {
      question: "Can I use PostcardApp on mobile?",
      answer: "Absolutely! PostcardApp is fully responsive and works great on phones, tablets, and desktops."
    },
    {
      question: "How do I sign out?",
      answer: "Click the 'Sign Out' button in the top navigation bar. You can sign back in anytime with your credentials."
    },
    {
      question: "Where can I report a bug?",
      answer: "If you encounter any issues, please reach out through our GitHub issues page or contact support at support@postcardapp.com"
    }
  ]

  const filterFAQs = (faqs: typeof creatorFAQs) => {
    if (!searchQuery.trim()) return faqs
    const query = searchQuery.toLowerCase()
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  }

  const filteredCreatorFAQs = filterFAQs(creatorFAQs)
  const filteredReaderFAQs = filterFAQs(readerFAQs)
  const filteredGeneralFAQs = filterFAQs(generalFAQs)

  const totalResults = filteredCreatorFAQs.length + filteredReaderFAQs.length + filteredGeneralFAQs.length

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b-2 border-black dark:border-gray-600 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="PostcardsTo Logo" width={40} height={40} />
              <h1 className="text-2xl font-sans font-bold lowercase text-black dark:text-white" style={{ letterSpacing: '0.05em' }}>
                postcard
              </h1>
            </div>
            <button
              onClick={() => router.push('/feed')}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 sm:px-6 py-2 font-mono text-xs uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-5xl sm:text-6xl mb-4">💬</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Feedback & FAQ
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-mono text-sm sm:text-base">
            Find answers to common questions or share your feedback
          </p>
        </div>

        {/* Large Search Bar */}
        <div className="mb-8 sm:mb-12">
          <div className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help topics, questions, or keywords..."
              className="w-full border-0 bg-white dark:bg-gray-700 dark:text-white outline-none px-6 sm:px-8 py-5 sm:py-6 pr-16 sm:pr-20 text-base sm:text-lg placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-normal rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow"
            />
            <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {searchQuery.trim() && (
            <div className="text-center mt-4 text-sm font-mono text-gray-600 dark:text-gray-400">
              Found {totalResults} result(s) for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {/* Creators Section */}
          {filteredCreatorFAQs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <span className="text-3xl">🎨</span>
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">For Creators</h3>
              </div>
              <div className="space-y-3">
                {filteredCreatorFAQs.map((faq, idx) => (
                  <div key={idx} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedCreator(expandedCreator === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="font-semibold text-gray-800 dark:text-white pr-4">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                          expandedCreator === idx ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCreator === idx && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Readers Section */}
          {filteredReaderFAQs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <span className="text-3xl">📖</span>
                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">For Readers</h3>
              </div>
              <div className="space-y-3">
                {filteredReaderFAQs.map((faq, idx) => (
                  <div key={idx} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedReader(expandedReader === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="font-semibold text-gray-800 dark:text-white pr-4">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                          expandedReader === idx ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedReader === idx && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General FAQ Section */}
          {filteredGeneralFAQs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <span className="text-3xl">❓</span>
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">General FAQ</h3>
              </div>
              <div className="space-y-3">
                {filteredGeneralFAQs.map((faq, idx) => (
                  <div key={idx} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedGeneral(expandedGeneral === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="font-semibold text-gray-800 dark:text-white pr-4">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                          expandedGeneral === idx ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedGeneral === idx && (
                      <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery.trim() && totalResults === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 dark:text-gray-400 font-mono">
                No results found for &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-orange-500 hover:text-orange-600 font-mono text-sm underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900 dark:to-amber-900 border-2 border-orange-300 dark:border-orange-700 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We're here to help! Reach out to our support team.
          </p>
          <a
            href="mailto:support@postcardapp.com"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider transition-colors"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  )
}
