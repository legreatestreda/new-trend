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
  fullname: z.string().min(2),
  bio: z.string().max(160).optional(),
  origin_country: z.string().min(2),
  current_country: z.string().min(2),
  city: z.string().min(2),
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
      const { data } = supabase.storage.from('images').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`

      setLocalAvatar(url)

      await supabase
        .from('users')
        .update({ avatar_url: url })
        .eq('id', user.id)

      toast.success('Photo mise à jour')
    } else {
      toast.error("Erreur upload")
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
      toast.error('Erreur mise à jour')
    } else {
      toast.success('Profil mis à jour')
      router.push(`/profile/${user.id}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[#777] hover:text-[#111] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* CARD */}
      <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 space-y-6">

        {/* TITLE */}
        <div>
          <h1 className="text-lg font-medium text-[#111]">
            Paramètres du profil
          </h1>
          <p className="text-sm text-[#777] mt-1">
            Gérez vos informations personnelles
          </p>
        </div>

        {/* AVATAR */}
        <div className="flex items-center gap-4">

          <div className="relative">

            <Avatar className="w-20 h-20 border border-[#EAEAEA]">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-[#F5F5F5] text-[#666] text-xl">
                {profile?.fullname?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <label className="absolute bottom-0 right-0 w-7 h-7 bg-[#111] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition">

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
            <p className="text-sm font-medium text-[#111]">
              {profile?.fullname}
            </p>
            <p className="text-xs text-[#777]">
              Cliquez pour changer la photo
            </p>
          </div>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-xs text-[#777]">
              Nom complet
            </label>

            <Input
              {...register('fullname')}
              className="mt-1 border-[#EAEAEA] focus:border-[#111]"
            />

            {errors.fullname && (
              <p className="text-xs text-red-500 mt-1">
                Requis
              </p>
            )}
          </div>

          {/* BIO */}
          <div>
            <label className="text-xs text-[#777]">
              Bio
            </label>

            <Textarea
              rows={3}
              {...register('bio')}
              className="mt-1 border-[#EAEAEA] focus:border-[#111]"
            />
          </div>

          {/* COUNTRIES */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="text-xs text-[#777]">
                Origine
              </label>
              <Input
                {...register('origin_country')}
                className="mt-1 border-[#EAEAEA] focus:border-[#111]"
              />
            </div>

            <div>
              <label className="text-xs text-[#777]">
                Actuel
              </label>
              <Input
                {...register('current_country')}
                className="mt-1 border-[#EAEAEA] focus:border-[#111]"
              />
            </div>

          </div>

          {/* CITY */}
          <div>
            <label className="text-xs text-[#777]">
              Ville
            </label>

            <Input
              {...register('city')}
              className="mt-1 border-[#EAEAEA] focus:border-[#111]"
            />
          </div>

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] hover:opacity-90 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enregistrer'
            )}
          </Button>

        </form>

      </div>
    </div>
  )
}