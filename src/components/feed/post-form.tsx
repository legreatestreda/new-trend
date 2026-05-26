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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || images.length >= 4) return

    setUploading(true)

    const supabase = createClient()

    for (const file of Array.from(files)) {
      if (images.length >= 4) break

      const ext = file.name.split('.').pop()
      const path = `posts/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('images')
        .upload(path, file)

      if (!error) {
        const { data } = supabase.storage.from('images').getPublicUrl(path)
        setImages(prev => [...prev, data.publicUrl])
      }
    }

    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Ajoutez du contenu')
      return
    }

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
    <div className="bg-white border border-[#ECECEC] rounded-2xl p-5 space-y-4 hover:shadow-sm transition">

      {/* TOP INPUT */}
      <div className="flex gap-3">
        <Avatar className="w-9 h-9">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-[#F5F5F5] text-[#666] text-xs">
            {profile?.fullname?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Partagez quelque chose avec votre communauté..."
          rows={3}
          className="border-0 p-0 resize-none focus-visible:ring-0 text-[14px] placeholder:text-[#AAA] leading-relaxed"
        />
      </div>

      {/* IMAGES */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 ml-12">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden aspect-video bg-[#F5F5F5]"
            >
              <img src={url} className="w-full h-full object-cover" />

              <button
                onClick={() =>
                  setImages(prev => prev.filter((_, j) => j !== i))
                }
                className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 transition rounded-full p-1"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center justify-between ml-12 pt-3 border-t border-[#F2F2F2]">

        {/* UPLOAD */}
        <label
          className={`flex items-center gap-2 text-[#888] hover:text-[#111] transition cursor-pointer ${
            images.length >= 4 ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading || images.length >= 4}
          />

          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}

          <span className="text-[13px]">Images</span>
        </label>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <span
            className={`text-[12px] ${
              content.length > 500 ? 'text-red-500' : 'text-[#999]'
            }`}
          >
            {content.length}/500
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim() || content.length > 500}
            className="h-9 px-5 rounded-full bg-[#111] text-white text-sm hover:opacity-90 transition disabled:opacity-40 flex items-center gap-2"
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