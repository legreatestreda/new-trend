'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  MessageCircle,
  UserPlus,
  UserMinus,
  Camera,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/actions/messages'
import { cn } from '@/lib/utils'
import type { User } from '@/types/database'

type ProfileHeaderProps = {
  profile: User
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

export function ProfileHeader({
  profile,
  postsCount,
  followersCount,
  followingCount,
  isFollowing: initialIsFollowing,
}: ProfileHeaderProps) {
  const { user } = useUser()
  const router = useRouter()

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followers, setFollowers] = useState(followersCount)
  const [loading, setLoading] = useState(false)
  const [coverUrl, setCoverUrl] = useState(profile.cover_url || '')

  const isOwnProfile = user?.id === profile.id

  /* FOLLOW */
  const handleFollow = async () => {
    if (!user || loading) return
    setLoading(true)

    const supabase = createClient()

    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)

        setIsFollowing(false)
        setFollowers((v) => v - 1)
      } else {
        await supabase.from('followers').insert({
          follower_id: user.id,
          following_id: profile.id,
        })

        setIsFollowing(true)
        setFollowers((v) => v + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  /* MESSAGE */
  const handleMessage = async () => {
    try {
      const id = await getOrCreateConversation(profile.id)
      router.push(`/messages/${id}`)
    } catch {
      toast.error('Erreur ouverture chat')
    }
  }

  /* COVER UPLOAD */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `covers/${user.id}/cover.${ext}`

    const { error } = await supabase.storage
      .from('images')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage.from('images').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`

      setCoverUrl(url)

      await supabase
        .from('users')
        .update({ cover_url: url })
        .eq('id', user.id)

      toast.success('Couverture mise à jour')
      router.refresh()
    }
  }

  return (
    <div className="bg-white border rounded-2xl overflow-hidden">

      {/* COVER */}
      <div className="relative h-40 sm:h-48 group overflow-hidden">

        {coverUrl ? (
          <img
            src={coverUrl}
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600" />
        )}

        <div className="absolute inset-0 bg-black/10" />

        {isOwnProfile && (
          <label className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-black/60 transition">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleCoverUpload}
            />
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modifier</span>
          </label>
        )}
      </div>

      {/* BODY */}
      <div className="px-4 sm:px-6 pb-6">

        {/* AVATAR + ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">

          {/* AVATAR */}
          <div className="flex justify-center sm:justify-start">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="bg-gray-100 text-gray-700 text-lg font-semibold">
                {profile.fullname?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

            {!isOwnProfile ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMessage}
                  className="w-full sm:w-auto rounded-full"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>

                <Button
                  size="sm"
                  onClick={handleFollow}
                  disabled={loading}
                  className="w-full sm:w-auto rounded-full"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-1" />
                      Suivi
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Suivre
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto rounded-full"
                onClick={() => router.push('/settings')}
              >
                Modifier profil
              </Button>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="mt-4 text-center sm:text-left space-y-2">

          <h1 className="text-xl font-semibold text-gray-900">
            {profile.fullname}
          </h1>

          {profile.bio && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* LOCATION */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-gray-500">

            {profile.current_country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city}, {profile.current_country}
              </span>
            )}

            {profile.origin_country && (
              <span>🌍 {profile.origin_country}</span>
            )}
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center sm:text-left">

            <div>
              <p className="text-sm font-semibold text-gray-900">{postsCount}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">{followers}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">{followingCount}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}