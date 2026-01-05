'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  avatar_url?: string
}

export default function FindFriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [suggestedFriends, setSuggestedFriends] = useState<UserProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchSuggestedFriends()
    }
  }, [user])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuggestedFriends = async () => {
    try {
      // Get users who might have added current user as friend
      // For now, just fetch random users excluding current user
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, username, email, avatar_url')
        .neq('id', user.id)
        .limit(6)

      if (data) {
        setSuggestedFriends(data)
      }
    } catch (error) {
      console.error('Error fetching suggested friends:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const query = searchQuery.trim().toLowerCase()

      // Search by name or email
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, username, email, avatar_url')
        .neq('id', user.id)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      if (data) {
        setSearchResults(data)
        if (data.length === 0) {
          setInviteEmail(searchQuery.includes('@') ? searchQuery : '')
        }
      }
    } catch (error) {
      console.error('Error searching friends:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    setSendingInvite(true)
    try {
      const response = await api.post('/api/invites/send', {
        email: inviteEmail
      })

      if (response.data.success) {
        setInviteMessage(response.data.message)
        setTimeout(() => {
          setInviteMessage('')
          setInviteEmail('')
        }, 3000)
      } else {
        throw new Error('Failed to send invite')
      }
    } catch (error: any) {
      console.error('Error sending invite:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to send invite. Please try again.'
      alert(errorMessage)
    } finally {
      setSendingInvite(false)
    }
  }

  const getInitials = (profile: UserProfile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    return profile.email?.[0]?.toUpperCase() || '?'
  }

  const getFullName = (profile: UserProfile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.first_name || profile.username || 'User'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
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
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 font-mono text-xs uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-200 transition"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-4 sm:p-6 md:p-8 mb-6">
          <div className="border-b-2 border-black dark:border-gray-600 pb-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">FIND FRIENDS</h2>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <label className="block text-sm font-mono uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
              Search by name or email
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter friend's name or email..."
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-orange-400 outline-none px-4 py-3 text-sm rounded"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-mono text-sm uppercase tracking-wider transition disabled:opacity-50 rounded"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 font-mono uppercase tracking-wider">
                Search Results ({searchResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    className="border-2 border-gray-300 dark:border-gray-600 p-4 flex items-center gap-4 hover:border-orange-400 transition rounded"
                  >
                    <div
                      style={{ width: '60px', height: '60px' }}
                      className="border-2 border-black dark:border-gray-400 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0"
                    >
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-400">
                            {getInitials(profile)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 dark:text-white truncate">
                        {getFullName(profile)}
                      </div>
                      {profile.username && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{profile.username}
                        </div>
                      )}
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-mono text-xs uppercase tracking-wider transition rounded">
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results - Invite Section */}
          {searchQuery.trim() && searchResults.length === 0 && !searching && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">😔</div>
                <p className="text-gray-600 dark:text-gray-400 font-mono text-sm mb-4">
                  No friends found matching "{searchQuery}"
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 font-mono uppercase tracking-wider">
                  Send an Invite
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Invite your friend to join POSTCARD - an authentic social experience free from engagement farming and AI-generated content.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@email.com"
                    className="flex-1 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-orange-400 outline-none px-4 py-2 text-sm rounded"
                  />
                  <button
                    onClick={handleSendInvite}
                    disabled={sendingInvite}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 font-mono text-xs uppercase tracking-wider transition disabled:opacity-50 rounded"
                  >
                    {sendingInvite ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
                {inviteMessage && (
                  <div className="mt-3 text-green-600 dark:text-green-400 text-sm font-mono text-center">
                    {inviteMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Friends Section */}
        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 p-4 sm:p-6 md:p-8">
          <div className="border-b-2 border-black dark:border-gray-600 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">SUGGESTED FRIENDS</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              People you might know
            </p>
          </div>

          {suggestedFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedFriends.map((profile) => (
                <div
                  key={profile.id}
                  className="border-2 border-gray-300 dark:border-gray-600 p-4 hover:border-orange-400 transition rounded"
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      style={{ width: '80px', height: '80px' }}
                      className="border-2 border-black dark:border-gray-400 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-3"
                    >
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {getInitials(profile)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-gray-800 dark:text-white mb-1">
                      {getFullName(profile)}
                    </div>
                    {profile.username && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        @{profile.username}
                      </div>
                    )}
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 font-mono text-xs uppercase tracking-wider transition w-full rounded">
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-mono text-sm">
              No suggested friends at the moment
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
