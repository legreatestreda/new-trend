'use client'

import { useState } from 'react'
import { createPost } from '@/lib/actions/posts'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { createClient } from '@/lib/supabase/client'

export function PostForm({ onPost }: { onPost?: () => void }) {
  const { profile } = useUser()

  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const MAX = 4
  const LIMIT = 500

  /* UPLOAD */
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    const supabase = createClient()

    for (const file of Array.from(files)) {
      if (images.length >= MAX) break

      const ext = file.name.split('.').pop()
      const path = `posts/${Date.now()}-${Math.random()}.${ext}`

      const { error } = await supabase.storage
        .from('images')
        .upload(path, file)

      if (!error) {
        const { data } = supabase.storage
          .from('images')
          .getPublicUrl(path)

        setImages((prev) => [...prev, data.publicUrl])
      }
    }

    setUploading(false)
  }

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!content.trim()) return toast.error('Ajoute du contenu')
    if (content.length > LIMIT) return

    setLoading(true)

    try {
      await createPost(content, images)
      setContent('')
      setImages([])
      toast.success('Publication partagée')
      onPost?.()
    } catch {
      toast.error('Erreur publication')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-5 space-y-4">

      {/* INPUT AREA */}
      <div className="flex gap-3">

        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>
            {profile?.fullname?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Quoi de neuf ?"
          rows={3}
          className="
            border-0 resize-none p-0
            focus-visible:ring-0
            text-sm sm:text-[14px]
            placeholder:text-gray-400
            leading-relaxed
          "
        />
      </div>

      {/* IMAGES */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:ml-12">

          {images.map((url, i) => (
            <div
              key={i}
              className="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
            >
              <img
                src={url}
                className="w-full h-full object-cover"
              />

              <button
                onClick={() =>
                  setImages((prev) => prev.filter((_, j) => j !== i))
                }
                className="
                  absolute top-2 right-2
                  bg-black/40 hover:bg-black/60
                  p-1 rounded-full
                  transition
                "
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}

        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-between sm:ml-12 pt-3 border-t">

        {/* LEFT */}
        <label
          className={`
            flex items-center gap-2 text-gray-500 hover:text-gray-900
            cursor-pointer transition text-sm
            ${images.length >= MAX ? 'opacity-40 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageUpload}
            disabled={uploading || images.length >= MAX}
          />

          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}

          Photos
        </label>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          <span
            className={`text-xs ${
              content.length > LIMIT
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          >
            {content.length}/{LIMIT}
          </span>

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !content.trim() ||
              content.length > LIMIT
            }
            className="
              h-9 px-5 rounded-full
              bg-green-600 hover:bg-green-700
              text-white text-sm
              disabled:opacity-40
              flex items-center gap-2
              transition
            "
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Publier'
            )}
          </button>

        </div>
      </div>
    </div>
  )
}