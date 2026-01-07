'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'

interface AddPostFormProps {
  userId: string
  postType: 'photo' | 'story'
  onClose: () => void
  onPostCreated: () => void
}

export default function AddPostForm({ userId, postType, onClose, onPostCreated }: AddPostFormProps) {
  const [caption, setCaption] = useState('')
  const [tags, setTags] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([]) // Multiple images for stories
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]) // Multiple previews
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maxCaptionLength = 1000

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxSize = 800 // Larger size for posts than avatars
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes

    if (postType === 'photo') {
      // Single image for photos
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
        e.target.value = ''
        return
      }

      // Validate file size
      if (file.size > maxSize) {
        setError('File too large. Please upload an image smaller than 5MB.')
        e.target.value = ''
        return
      }

      setError('')
      setImageFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      // Multiple images for stories
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      // Validate max 10 images
      if (files.length > 10) {
        setError('Maximum 10 images allowed per story.')
        e.target.value = ''
        return
      }

      // Validate each file
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          setError('Invalid file type. Please upload only JPEG, PNG, GIF, or WebP images.')
          e.target.value = ''
          return
        }

        if (file.size > maxSize) {
          setError(`File "${file.name}" is too large. Maximum size is 5MB per image.`)
          e.target.value = ''
          return
        }
      }

      setError('')
      setImageFiles(files)

      // Create previews for all images
      const previews: string[] = []
      let loadedCount = 0

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          previews.push(reader.result as string)
          loadedCount++
          if (loadedCount === files.length) {
            setImagePreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (postType === 'photo' && !imageFile) {
      setError('Please select an image for your photo post')
      return
    }

    if (!caption.trim() && postType === 'story') {
      setError('Please add some content to your story')
      return
    }

    if (caption.length > maxCaptionLength) {
      setError(`Story is too long. Maximum ${maxCaptionLength} characters allowed.`)
      return
    }

    setUploading(true)

    try {
      let imageUrl = null

      if (postType === 'photo' && imageFile) {
        // Single image upload for photos
        const resizedBlob = await resizeImage(imageFile)
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const filePath = `posts/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, resizedBlob, {
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      } else if (postType === 'story' && imageFiles.length > 0) {
        // Multiple image uploads for stories
        const uploadedUrls: string[] = []

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const resizedBlob = await resizeImage(file)
          const fileExt = file.name.split('.').pop()
          const fileName = `${userId}-${Date.now()}-${i}.${fileExt}`
          const filePath = `posts/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(filePath, resizedBlob, {
              upsert: true
            })

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('posts')
            .getPublicUrl(filePath)

          uploadedUrls.push(urlData.publicUrl)
        }

        // Store multiple URLs as comma-separated string
        imageUrl = uploadedUrls.join(',')
      }

      // Parse tags
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Create post via API
      const postData = {
        caption: caption.trim() || null,
        post_type: postType,
        image_url: imageUrl,
        tags: tagsArray.length > 0 ? tagsArray : null
      }

      await api.post('/api/posts/', postData)

      // Success - close form and refresh
      onPostCreated()
      onClose()
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Failed to create post')
    } finally {
      setUploading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget && !uploading) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-postcard-night-surface rounded-modern-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-modern-lg">
        {/* Header */}
        <div className="border-b border-postcard-gray-200 dark:border-postcard-night-border p-5 sm:p-7 bg-gradient-to-r from-postcard-blue to-postcard-blue-light dark:from-postcard-blue-bright dark:to-postcard-blue-lighter rounded-t-modern-2xl">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-xl md:text-2xl font-sans font-bold lowercase text-white" style={{ letterSpacing: '0.05em' }}>
              {postType === 'photo' ? '📸 new photo post' : '📖 new story'}
            </h2>
            <button
              onClick={onClose}
              className="bg-white/90 dark:bg-postcard-night-bg/90 hover:bg-postcard-red hover:text-white dark:hover:bg-postcard-red-bright transition-all duration-300 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0 rounded-full shadow-md hover:shadow-lg hover:scale-110"
              disabled={uploading}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 p-3 sm:p-4 border-l-4 border-red-500 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Image Upload for Photo Posts */}
          {postType === 'photo' && (
            <div className="mb-4 sm:mb-6">
              <label className="block mb-2 font-mono text-xs uppercase tracking-wider">
                Photo *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {imagePreview ? (
                <div className="border-2 border-postcard-black-text dark:border-postcard-night-border relative shadow-postcard dark:shadow-postcard-dark">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-2 right-2 bg-postcard-red dark:bg-postcard-red-bright text-white px-2 sm:px-3 py-1 text-xs font-mono uppercase hover:bg-postcard-red-dark dark:hover:bg-postcard-red shadow-md"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-postcard-gray-300 dark:border-postcard-night-border hover:border-postcard-blue dark:hover:border-postcard-blue-bright transition p-8 sm:p-12 text-center"
                >
                  <div className="text-3xl sm:text-4xl mb-2">📷</div>
                  <div className="font-mono text-xs sm:text-sm uppercase tracking-wider text-postcard-black-soft dark:text-postcard-night-muted">
                    Click to select image
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Multiple Images for Story Posts */}
          {postType === 'story' && (
            <div className="mb-4 sm:mb-6">
              <label className="block mb-2 font-mono text-xs uppercase tracking-wider">
                Images (Optional - Max 10)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              {imagePreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="border-2 border-postcard-black-text dark:border-postcard-night-border relative aspect-square shadow-postcard dark:shadow-postcard-dark">
                        <Image
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = imageFiles.filter((_, i) => i !== idx)
                            const newPreviews = imagePreviews.filter((_, i) => i !== idx)
                            setImageFiles(newFiles)
                            setImagePreviews(newPreviews)
                          }}
                          className="absolute top-1 right-1 bg-postcard-red dark:bg-postcard-red-bright text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-postcard-red-dark dark:hover:bg-postcard-red shadow-md"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  {imagePreviews.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-postcard-gray-300 dark:border-postcard-night-border hover:border-postcard-blue dark:hover:border-postcard-blue-bright transition p-4 text-center"
                    >
                      <div className="font-mono text-xs uppercase tracking-wider text-postcard-black-soft dark:text-postcard-night-muted">
                        + Add more images ({imagePreviews.length}/10)
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-postcard-gray-300 dark:border-postcard-night-border hover:border-postcard-blue dark:hover:border-postcard-blue-bright transition p-6 sm:p-8 text-center"
                >
                  <div className="text-2xl sm:text-3xl mb-1">📷</div>
                  <div className="font-mono text-xs uppercase tracking-wider text-postcard-black-soft dark:text-postcard-night-muted">
                    Add images (up to 10)
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Caption */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-mono text-xs uppercase tracking-wider">
                {postType === 'photo' ? 'Caption' : 'Story'} {postType === 'story' && '*'}
              </label>
              {postType === 'story' && (
                <span className={`font-mono text-xs ${caption.length > maxCaptionLength ? 'text-red-600' : 'text-gray-500'}`}>
                  {caption.length}/{maxCaptionLength}
                </span>
              )}
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={postType === 'story' ? 8 : 4}
              maxLength={postType === 'story' ? maxCaptionLength : undefined}
              className="w-full border-2 border-postcard-gray-300 dark:border-postcard-night-border dark:bg-postcard-night-bg dark:text-white focus:border-postcard-blue dark:focus:border-postcard-blue-bright outline-none p-2 sm:p-3 font-sans resize-none text-sm sm:text-base"
              placeholder={postType === 'photo' ? 'Add a caption...' : 'Write your story here... Share your thoughts, experiences, or memories.'}
            />
          </div>

          {/* Tags */}
          <div className="mb-4 sm:mb-6">
            <label className="block mb-2 font-mono text-xs uppercase tracking-wider dark:text-postcard-night-text">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border-2 border-postcard-gray-300 dark:border-postcard-night-border dark:bg-postcard-night-bg dark:text-white focus:border-postcard-blue dark:focus:border-postcard-blue-bright outline-none p-2 sm:p-3 font-sans text-sm sm:text-base"
              placeholder="travel, friends, adventure"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-3 border-2 border-postcard-black-text dark:border-postcard-night-border dark:text-white font-mono text-xs sm:text-sm uppercase tracking-wider hover:bg-postcard-gray-50 dark:hover:bg-postcard-night-bg transition disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3.5 bg-gradient-to-r from-postcard-red to-postcard-red-light dark:from-postcard-red-bright dark:to-postcard-red-lighter text-white font-mono text-xs sm:text-sm uppercase tracking-wider hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 rounded-modern-lg shadow-md font-semibold"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
