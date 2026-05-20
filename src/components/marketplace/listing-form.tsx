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
  title: z.string().min(3, 'Minimum 3 caractères'),
  description: z.string().min(10, 'Minimum 10 caractères'),
  price: z.string().optional(),
  category: z.string().min(1, 'Choisissez une catégorie'),
  location: z.string().min(2, 'Indiquez une localisation'),
})

type FormData = z.infer<typeof schema>

export function ListingForm() {
  const router = useRouter()
  const { user } = useUser()
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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
      const { error } = await supabase.storage.from('images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('images').getPublicUrl(path)
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
      toast.success('Annonce publiée !')
      router.push('/marketplace')
    } catch {
      toast.error('Erreur lors de la publication')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="bg-white rounded-2xl border p-6 space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Nouvelle annonce</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Titre <span className="text-red-500">*</span></label>
            <Input placeholder="Ex: iPhone 14 Pro, Cours de français..." {...register('title')} className={errors.title ? 'border-red-300' : ''} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Catégorie <span className="text-red-500">*</span></label>
            <select
              {...register('category')}
              className={`w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.category ? 'border-red-300' : 'border-input'}`}
            >
              <option value="">Choisir une catégorie</option>
              {LISTING_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <Textarea placeholder="Décrivez votre annonce en détail..." rows={4} {...register('description')} className={errors.description ? 'border-red-300' : ''} />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Prix (€)</label>
              <Input type="number" placeholder="0.00" min="0" step="0.01" {...register('price')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Localisation <span className="text-red-500">*</span></label>
              <Input placeholder="Paris, Lyon..." {...register('location')} className={errors.location ? 'border-red-300' : ''} />
              {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Photos <span className="text-gray-400 font-normal">(max 4)</span>
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 4 && (
              <label className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                {uploading
                  ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  : <><ImagePlus className="w-5 h-5 text-gray-400" /><span className="text-sm text-gray-400">Ajouter des photos</span></>
                }
              </label>
            )}
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier l'annonce"}
          </Button>
        </form>
      </div>
    </div>
  )
}