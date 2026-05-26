'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createListing } from '@/lib/actions/listings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X, ArrowLeft } from 'lucide-react'
import { LISTING_CATEGORIES } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.string().optional(),
  category: z.string().min(1),
  location: z.string().min(2),
})

type FormData = z.infer<typeof schema>

export function ListingForm() {
  const router = useRouter()
  const { user } = useUser()

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || images.length >= 4) return

    setUploading(true)

    const supabase = createClient()

    for (const file of Array.from(files)) {
      if (images.length >= 4) break

      const ext = file.name.split('.').pop()
      const path = `listings/${user?.id}/${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('images')
        .upload(path, file)

      if (!error) {
        const { data } = supabase.storage
          .from('images')
          .getPublicUrl(path)

        setImages(prev => [...prev, data.publicUrl])
      }
    }

    setUploading(false)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      await createListing({
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
        category: data.category,
        location: data.location,
        images,
      })

      toast.success('Annonce publiée')
      router.push('/marketplace')
    } catch {
      toast.error('Erreur publication')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#777] hover:text-[#111] transition mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* CARD */}
      <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 space-y-6">

        {/* TITLE */}
        <div>
          <h1 className="text-xl font-medium text-[#111]">
            Nouvelle annonce
          </h1>

          <p className="text-sm text-[#777] mt-1">
            Publiez un produit ou service pour votre communauté
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* TITLE */}
          <div className="space-y-1">
            <label className="text-sm text-[#555]">Titre *</label>
            <Input
              placeholder="Ex: iPhone 14, Cours de français..."
              {...register('title')}
              className={`h-10 border-[#EAEAEA] focus-visible:ring-0 ${
                errors.title ? 'border-red-300' : ''
              }`}
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-1">
            <label className="text-sm text-[#555]">Catégorie *</label>

            <select
              {...register('category')}
              className={`w-full h-10 px-3 rounded-md border border-[#EAEAEA] text-sm bg-white focus:outline-none ${
                errors.category ? 'border-red-300' : ''
              }`}
            >
              <option value="">Choisir une catégorie</option>
              {LISTING_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-sm text-[#555]">Description *</label>

            <Textarea
              rows={4}
              placeholder="Décrivez votre annonce..."
              {...register('description')}
              className="border-[#EAEAEA] focus-visible:ring-0 resize-none"
            />
          </div>

          {/* PRICE + LOCATION */}
          <div className="grid grid-cols-2 gap-3">

            <div className="space-y-1">
              <label className="text-sm text-[#555]">Prix</label>
              <Input
                type="number"
                placeholder="0"
                {...register('price')}
                className="h-10 border-[#EAEAEA] focus-visible:ring-0"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#555]">Localisation *</label>
              <Input
                placeholder="Paris, Dakar..."
                {...register('location')}
                className={`h-10 border-[#EAEAEA] focus-visible:ring-0 ${
                  errors.location ? 'border-red-300' : ''
                }`}
              />
            </div>

          </div>

          {/* IMAGES */}
          <div className="space-y-3">

            <div className="flex items-center justify-between">
              <label className="text-sm text-[#555]">
                Photos <span className="text-[#999]">(max 4)</span>
              </label>
            </div>

            {/* PREVIEW */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F5F5]"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setImages(prev =>
                          prev.filter((_, j) => j !== i)
                        )
                      }
                      className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 rounded-full p-1 transition"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* UPLOAD */}
            {images.length < 4 && (
              <label className="flex items-center justify-center gap-2 h-20 border border-dashed border-[#E5E5E5] rounded-xl cursor-pointer hover:border-[#111] transition">

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />

                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#777]" />
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4 text-[#777]" />
                    <span className="text-sm text-[#777]">
                      Ajouter des images
                    </span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-[#111] text-white hover:opacity-90 transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Publier l'annonce"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}