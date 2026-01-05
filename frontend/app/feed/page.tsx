'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import AddPostForm from '@/components/AddPostForm'

export default function FeedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddPost, setShowAddPost] = useState<'photo' | 'story' | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editTags, setEditTags] = useState('')
  const [updating, setUpdating] = useState(false)
  const [postViewMode, setPostViewMode] = useState<{ [key: string]: 'grid' | 'carousel' }>({})
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState<'you' | 'friends' | 'postcard'>('you')
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => {
    // Initialize theme from localStorage on first render
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'auto') || 'light'
    }
    return 'light'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user])

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.classList.toggle('dark', prefersDark)
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }

    applyTheme()
    localStorage.setItem('theme', theme)

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (openMenuId && !target.closest('.post-menu')) {
        setOpenMenuId(null)
      }

      if (sideMenuOpen && !target.closest('.side-menu') && !target.closest('.hamburger-btn')) {
        setSideMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId, sideMenuOpen])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await fetchUserProfile(currentUser.id)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchPosts = async () => {
    setLoadingPosts(true)
    try {
      const response = await api.get('/api/posts/')
      setPosts(response.data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setEditingPostId(postId)
      setEditCaption(post.caption || '')
      setEditTags(post.tags ? post.tags.join(', ') : '')
    }
    setOpenMenuId(null)
  }

  const handleCancelEdit = () => {
    setEditingPostId(null)
    setEditCaption('')
    setEditTags('')
  }

  const handleSaveEdit = async () => {
    if (!editingPostId) return

    setUpdating(true)
    try {
      const tagsArray = editTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const updateData = {
        caption: editCaption.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null
      }

      await api.patch(`/api/posts/${editingPostId}/`, updateData)

      // Refresh posts
      await fetchPosts()
      handleCancelEdit()
    } catch (error: any) {
      alert('Failed to update post: ' + (error.response?.data?.detail || error.message))
    } finally {
      setUpdating(false)
    }
  }

  const handleHidePost = async (postId: string) => {
    // TODO: Implement hide functionality
    console.log('Hide post:', postId)
    setOpenMenuId(null)
  }

  const handleSharePost = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId)
    setOpenMenuId(null)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }
    try {
      await api.delete(`/api/posts/${postId}/`)
      // Refresh posts
      fetchPosts()
      setOpenMenuId(null)
    } catch (error: any) {
      alert('Failed to delete post: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 400
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to resize image'))
          }, 'image/jpeg', 0.85)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
      e.target.value = '' // Reset input
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      alert('File too large. Please upload an image smaller than 5MB.')
      e.target.value = '' // Reset input
      return
    }

    setUploading(true)
    try {
      // Resize image
      const resizedBlob = await resizeImage(file)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, resizedBlob, {
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Refresh profile
      await fetchUserProfile(user.id)
    } catch (error: any) {
      alert('Error uploading photo: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || '?'
  }

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile?.first_name || profile?.username || 'User'
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Hamburger Menu Button - Bottom Left */}
      <button
        onClick={() => setSideMenuOpen(!sideMenuOpen)}
        className="hamburger-btn fixed bottom-6 left-6 z-50 bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Side Panel */}
      <div className={`side-menu fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 border-r-2 border-black dark:border-gray-600 shadow-2xl z-40 transform transition-transform duration-300 ${
        sideMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Settings</h2>
            <button
              onClick={() => setSideMenuOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Feedback Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-mono uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">Help & Support</h3>
            <button
              onClick={() => router.push('/feedback')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-orange-500 transition-all"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800 dark:text-white">Feedback & FAQ</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Get help and share feedback</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Theme Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h3 className="text-sm font-mono uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-4">Theme</h3>
            <div className="space-y-2">
              {/* Light Theme */}
              <button
                onClick={() => setTheme('light')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  theme === 'light'
                    ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">☀️</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">Light</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bright and clear</div>
                </div>
                {theme === 'light' && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Dark Theme */}
              <button
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">🌙</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">Dark</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</div>
                </div>
                {theme === 'dark' && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Auto Theme */}
              <button
                onClick={() => setTheme('auto')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  theme === 'auto'
                    ? 'bg-orange-100 dark:bg-orange-900 border-2 border-orange-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">🔄</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-800 dark:text-white">Auto</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Match system</div>
                </div>
                {theme === 'auto' && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {sideMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSideMenuOpen(false)}></div>
      )}

      <nav className="bg-white dark:bg-gray-800 border-b-2 border-black dark:border-gray-600 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          {/* Mobile Layout - Stacked */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="PostcardsTo Logo" width={32} height={32} />
                <h1 className="text-lg font-sans font-bold lowercase text-black dark:text-white" style={{ letterSpacing: '0.05em' }}>
                  postcard
                </h1>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                Sign Out
              </button>
            </div>

            {/* Text-based Menu */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => setActiveMenuItem('you')}
                className={`font-mono text-xs transition-colors ${
                  activeMenuItem === 'you'
                    ? 'text-amber-600 dark:text-amber-400 font-bold underline'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                You
              </button>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <button
                onClick={() => router.push('/find-friends')}
                className="font-mono text-xs text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Find Friends
              </button>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <button
                onClick={() => setActiveMenuItem('postcard')}
                className={`font-mono text-xs transition-colors ${
                  activeMenuItem === 'postcard'
                    ? 'text-amber-600 dark:text-amber-400 font-bold underline'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                Postcard It
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={handlePhotoClick}
                style={{ width: '60px', height: '60px' }}
                className="border-2 border-black cursor-pointer relative group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0"
                title="Click to change photo"
              >
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-400">
                      {getInitials()}
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    <div className="text-sm">📷</div>
                    <div className="text-[8px] font-mono uppercase tracking-wider">
                      {uploading ? 'Upload...' : 'Change'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left min-w-0 flex-1">
                <div className="font-bold tracking-tight text-amber-900 dark:text-amber-400 truncate text-xs">
                  {getFullName().toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Single Row */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="PostcardsTo Logo" width={40} height={40} />
                <h1 className="text-2xl font-sans font-bold lowercase text-black dark:text-white" style={{ letterSpacing: '0.05em' }}>
                  postcard
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Profile Stamp */}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={handlePhotoClick}
                    style={{ width: '78px', height: '78px' }}
                    className="border-2 border-black cursor-pointer relative group overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
                    title="Click to change photo"
                  >
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">
                          {getInitials()}
                        </span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                        <div className="text-lg">📷</div>
                        <div className="text-[8px] font-mono uppercase tracking-wider">
                          {uploading ? 'Upload...' : 'Change'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="font-bold tracking-tight text-amber-900 dark:text-amber-400" style={{ fontSize: '7pt' }}>
                      {getFullName().toUpperCase()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 font-mono text-xs uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Text-based Menu */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => setActiveMenuItem('you')}
                className={`font-mono text-sm transition-colors ${
                  activeMenuItem === 'you'
                    ? 'text-amber-600 dark:text-amber-400 font-bold underline'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                You
              </button>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <button
                onClick={() => router.push('/find-friends')}
                className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Find Friends
              </button>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <button
                onClick={() => setActiveMenuItem('postcard')}
                className={`font-mono text-sm transition-colors ${
                  activeMenuItem === 'postcard'
                    ? 'text-amber-600 dark:text-amber-400 font-bold underline'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                Postcard It
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Feed Section */}
        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-4 sm:p-6 md:p-8">
          <div className="border-b-2 border-black dark:border-gray-600 pb-3 sm:pb-4 mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-amber-600 dark:text-amber-400">YOUR FEED</h2>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              {/* Left side - Search */}
              <div className="flex-1">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by tags (e.g., travel, friends)"
                    className="w-full border-0 bg-white dark:bg-gray-700 dark:text-white outline-none px-5 py-3 pr-14 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-normal rounded-full shadow-lg hover:shadow-xl transition-shadow"
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 md:justify-end">
                <button
                  onClick={() => setShowAddPost('photo')}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all hover:scale-110 group"
                >
                  <span className="text-xl group-hover:animate-pulse">📸</span>
                  <span className="font-mono text-sm uppercase tracking-wider group-hover:animate-pulse">Upload a Photo</span>
                </button>

                <button
                  onClick={() => setShowAddPost('story')}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all hover:scale-110 group"
                >
                  <span className="text-xl group-hover:animate-pulse">📖</span>
                  <span className="font-mono text-sm uppercase tracking-wider group-hover:animate-pulse">Share Your Story</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Results Counter */}
          {searchQuery.trim() && !loadingPosts && posts.length > 0 && (
            <div className="mb-4 text-sm font-mono text-gray-600 dark:text-gray-400">
              Found {posts.filter(post => {
                const query = searchQuery.toLowerCase()
                if (post.tags && Array.isArray(post.tags)) {
                  return post.tags.some((tag: string) => tag.toLowerCase().includes(query))
                }
                if (post.caption) {
                  return post.caption.toLowerCase().includes(query)
                }
                return false
              }).length} post(s) matching &quot;{searchQuery}&quot;
            </div>
          )}

          {/* Posts Display */}
          {(() => {
            // Filter posts based on search query
            const filteredPosts = searchQuery.trim()
              ? posts.filter(post => {
                  const query = searchQuery.toLowerCase()
                  // Search in tags
                  if (post.tags && Array.isArray(post.tags)) {
                    return post.tags.some((tag: string) => tag.toLowerCase().includes(query))
                  }
                  // Also search in caption
                  if (post.caption) {
                    return post.caption.toLowerCase().includes(query)
                  }
                  return false
                })
              : posts

            return loadingPosts ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-mono text-sm">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📮</div>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-xs sm:text-sm">No posts yet. Be the first to share!</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-xs sm:text-sm">No posts found matching &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono text-sm underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {filteredPosts.map((post) => (
                <div key={post.id} className="border-2 border-amber-600 dark:border-amber-700 bg-white dark:bg-gray-700 overflow-hidden">
                  {/* Post Header */}
                  <div className="border-b-2 border-amber-600 dark:border-amber-700 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs uppercase tracking-wider text-black dark:text-white">
                        {post.post_type === 'photo' ? '📸 Photo' : '📖 Story'}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </div>
                        {/* Three-dot menu for post owner */}
                        {user && post.user_id === user.id && (
                          <div className="relative post-menu">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                              </svg>
                            </button>
                            {/* Dropdown Menu */}
                            {openMenuId === post.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-gray-200 shadow-lg z-10">
                                <button
                                  onClick={() => handleEditPost(post.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
                                >
                                  <span>✏️</span>
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleHidePost(post.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition border-t border-gray-200"
                                >
                                  <span>👁️</span>
                                  <span>Hide</span>
                                </button>
                                <button
                                  onClick={() => handleSharePost(post.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition border-t border-gray-200"
                                >
                                  <span>📤</span>
                                  <span>Share with Friends</span>
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 transition border-t border-gray-200"
                                >
                                  <span>🗑️</span>
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Image(s) */}
                  {post.image_url && (
                    <>
                      {post.image_url.includes(',') ? (
                        // Multiple images for stories
                        <div>
                          {/* View Mode Toggle */}
                          <div className="border-b-2 border-amber-600 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900 dark:to-yellow-900 px-3 py-2 flex items-center justify-between">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                              {post.image_url.split(',').length} Images
                            </span>
                            <div className="flex gap-1 border-2 border-black dark:border-gray-400">
                              <button
                                onClick={() => setPostViewMode(prev => ({ ...prev, [post.id]: 'grid' }))}
                                className={`px-3 py-1 text-xs font-mono uppercase transition ${
                                  (!postViewMode[post.id] || postViewMode[post.id] === 'grid')
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                                title="Grid View"
                              >
                                ⊞ Grid
                              </button>
                              <button
                                onClick={() => {
                                  setPostViewMode(prev => ({ ...prev, [post.id]: 'carousel' }))
                                  if (!currentImageIndex[post.id]) {
                                    setCurrentImageIndex(prev => ({ ...prev, [post.id]: 0 }))
                                  }
                                }}
                                className={`px-3 py-1 text-xs font-mono uppercase transition ${
                                  postViewMode[post.id] === 'carousel'
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                                title="Carousel View"
                              >
                                ◀▶ Carousel
                              </button>
                            </div>
                          </div>

                          {/* Image Display */}
                          {(!postViewMode[post.id] || postViewMode[post.id] === 'grid') ? (
                            // Grid View with layered borders
                            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800">
                              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                {post.image_url.split(',').map((url: string, idx: number) => (
                                  <div key={idx} className="relative">
                                    {/* Shadow/Background border layer */}
                                    <div className="absolute top-2 left-2 w-full h-full bg-gray-300 dark:bg-gray-600 border-2 border-black dark:border-gray-500"></div>
                                    {/* Main photo with border */}
                                    <div className="relative bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-400 p-2">
                                      <div className="relative w-full aspect-square">
                                        <Image
                                          src={url.trim()}
                                          alt={`${post.caption || 'Story image'} ${idx + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            // Carousel View with layered border
                            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800">
                              <div className="relative inline-block w-full">
                                {/* Shadow/Background border layer */}
                                <div className="absolute top-2 left-2 w-full h-full bg-gray-300 dark:bg-gray-600 border-2 border-black dark:border-gray-500"></div>
                                {/* Main carousel with border */}
                                <div className="relative bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-400 p-2 sm:p-3">
                                  <div className="relative w-full aspect-square bg-black">
                                    {post.image_url.split(',').map((url: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className={`absolute inset-0 transition-opacity duration-300 ${
                                          idx === (currentImageIndex[post.id] || 0) ? 'opacity-100' : 'opacity-0'
                                        }`}
                                      >
                                        <Image
                                          src={url.trim()}
                                          alt={`${post.caption || 'Story image'} ${idx + 1}`}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  {/* Carousel Controls */}
                                  <button
                                    onClick={() => {
                                      const images = post.image_url.split(',')
                                      const current = currentImageIndex[post.id] || 0
                                      const prev = current === 0 ? images.length - 1 : current - 1
                                      setCurrentImageIndex(p => ({ ...p, [post.id]: prev }))
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 text-white w-10 h-10 flex items-center justify-center hover:bg-black/90 transition"
                                  >
                                    ‹
                                  </button>
                                  <button
                                    onClick={() => {
                                      const images = post.image_url.split(',')
                                      const current = currentImageIndex[post.id] || 0
                                      const next = current === images.length - 1 ? 0 : current + 1
                                      setCurrentImageIndex(p => ({ ...p, [post.id]: next }))
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 text-white w-10 h-10 flex items-center justify-center hover:bg-black/90 transition"
                                  >
                                    ›
                                  </button>

                                  {/* Image Counter */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-mono">
                                    {(currentImageIndex[post.id] || 0) + 1} / {post.image_url.split(',').length}
                                  </div>

                                  {/* Dot Indicators */}
                                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                                    {post.image_url.split(',').map((_: string, idx: number) => (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(p => ({ ...p, [post.id]: idx }))}
                                        className={`w-2 h-2 rounded-full transition ${
                                          idx === (currentImageIndex[post.id] || 0)
                                            ? 'bg-white'
                                            : 'bg-white/40 hover:bg-white/70'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Single image with layered border effect
                        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800">
                          <div className="relative inline-block w-full">
                            {/* Shadow/Background border layer */}
                            <div className="absolute top-2 left-2 w-full h-full bg-gray-300 dark:bg-gray-600 border-2 border-black dark:border-gray-500"></div>
                            {/* Main photo with border */}
                            <div className="relative bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-400 p-2 sm:p-3">
                              <div className="relative w-full" style={{ minHeight: '200px' }}>
                                <Image
                                  src={post.image_url}
                                  alt={post.caption || 'Post image'}
                                  width={800}
                                  height={600}
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Post Content */}
                  <div className="p-3 sm:p-4">
                    {editingPostId === post.id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                            Caption
                          </label>
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            rows={3}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-400 outline-none p-3 text-sm resize-none rounded"
                            placeholder="Update your caption..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                          </label>
                          <input
                            type="text"
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-400 outline-none p-3 text-sm rounded"
                            placeholder="travel, friends, adventure (comma-separated)"
                          />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                          <button
                            onClick={handleCancelEdit}
                            disabled={updating}
                            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={updating}
                            className="px-4 py-2 bg-orange-500 text-white font-mono text-sm uppercase tracking-wider hover:bg-orange-600 transition disabled:opacity-50"
                          >
                            {updating ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        {post.caption && (
                          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-3">{post.caption}</p>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                            {post.tags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 px-2 py-1 text-xs font-mono dark:text-white"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button className="flex items-center gap-2 text-xs sm:text-sm font-mono hover:text-blue-600 dark:hover:text-blue-400 transition dark:text-gray-300">
                            <span>❤️</span>
                            <span>{post.likes_count || 0}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )
          })()}
        </div>
      </main>

      {/* Add Post Modal */}
      {showAddPost && user && (
        <AddPostForm
          userId={user.id}
          postType={showAddPost}
          onClose={() => setShowAddPost(null)}
          onPostCreated={fetchPosts}
        />
      )}
    </div>
  )
}
