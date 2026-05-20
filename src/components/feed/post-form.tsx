// post-form
'use client'

import { useState } from 'react'
import { createPost } from '@/lib/actions/posts'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { createClient } from '@/lib/supabase/client'

export function PostForm({ onPost }: { onPost?: () => void }) {
  const { user, profile } = useUser()
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
      const path = `posts/${user?.id}/${Date.now()}.${ext}`

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
      toast.error('Écrivez quelque chose avant de publier')
      return
    }
    setLoading(true)
    try {
      await createPost(content, images)
      setContent('')
      setImages([])
      toast.success('Publication créée !')
      onPost?.()
    } catch {
      toast.error('Erreur lors de la publication')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border p-4 space-y-3">
      <div className="flex gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
            {profile?.fullname?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <Textarea
          placeholder="Partagez quelque chose avec la communauté..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          className="resize-none border-0 p-0 focus-visible:ring-0 text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Images preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 ml-12">
          {images.map((url, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between ml-12 pt-1 border-t">
        <label className={`cursor-pointer ${images.length >= 4 ? 'opacity-40 pointer-events-none' : ''}`}>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading || images.length >= 4}
          />
          {uploading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <ImagePlus className="w-5 h-5 text-gray-400 hover:text-green-600 transition-colors" />
          )}
        </label>

        <div className="flex items-center gap-3">
          <span className={`text-xs ${content.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
            {content.length}/500
          </span>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 px-5"
            onClick={handleSubmit}
            disabled={loading || !content.trim() || content.length > 500}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publier'}
          </Button>
        </div>
      </div>
    </div>
  )
}