'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, Camera, ArrowLeft } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'

const schema = z.object({
  fullname: z.string().min(2, 'Minimum 2 caractères'),
  bio: z.string().max(160, 'Maximum 160 caractères').optional(),
  origin_country: z.string().min(2, 'Requis'),
  current_country: z.string().min(2, 'Requis'),
  city: z.string().min(2, 'Requis'),
})

type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile } = useUser()

  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [localAvatar, setLocalAvatar] = useState('')

  const avatarUrl = localAvatar || profile?.avatar_url || ''

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        fullname: profile.fullname || '',
        bio: profile.bio || '',
        origin_country: profile.origin_country || '',
        current_country: profile.current_country || '',
        city: profile.city || '',
      })
    }
  }, [profile, reset])

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file || !user) return

    setUploadingAvatar(true)

    const supabase = createClient()

    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('images')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(path)

      const url = `${data.publicUrl}?t=${Date.now()}`

      setLocalAvatar(url)

      await supabase
        .from('users')
        .update({ avatar_url: url })
        .eq('id', user.id)

      toast.success('Photo mise à jour !')
    } else {
      toast.error("Erreur lors de l'upload")
    }

    setUploadingAvatar(false)
  }

  const onSubmit = async (data: FormData) => {
    if (!user) return

    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from('users')
      .update({
        fullname: data.fullname,
        bio: data.bio || null,
        origin_country: data.origin_country,
        current_country: data.current_country,
        city: data.city,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      toast.success('Profil mis à jour !')
      router.push(`/profile/${user.id}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="bg-white rounded-2xl border p-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-900">
          Modifier le profil
        </h1>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} />

              <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
                {profile?.fullname?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <label className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              {uploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              {profile?.fullname}
            </p>

            <p className="text-xs text-gray-500">
              Cliquez sur l&apos;icône pour changer la photo
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Nom complet <span className="text-red-500">*</span>
            </label>

            <Input
              {...register('fullname')}
              className={errors.fullname ? 'border-red-300' : ''}
            />

            {errors.fullname && (
              <p className="text-xs text-red-500">
                {errors.fullname.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Bio
            </label>

            <Textarea
              rows={3}
              {...register('bio')}
              className={errors.bio ? 'border-red-300' : ''}
            />

            {errors.bio && (
              <p className="text-xs text-red-500">
                {errors.bio.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Pays d&apos;origine{' '}
                <span className="text-red-500">*</span>
              </label>

              <Input
                {...register('origin_country')}
                className={
                  errors.origin_country ? 'border-red-300' : ''
                }
              />

              {errors.origin_country && (
                <p className="text-xs text-red-500">
                  {errors.origin_country.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Pays actuel{' '}
                <span className="text-red-500">*</span>
              </label>

              <Input
                {...register('current_country')}
                className={
                  errors.current_country ? 'border-red-300' : ''
                }
              />

              {errors.current_country && (
                <p className="text-xs text-red-500">
                  {errors.current_country.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Ville <span className="text-red-500">*</span>
            </label>

            <Input
              {...register('city')}
              className={errors.city ? 'border-red-300' : ''}
            />

            {errors.city && (
              <p className="text-xs text-red-500">
                {errors.city.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}