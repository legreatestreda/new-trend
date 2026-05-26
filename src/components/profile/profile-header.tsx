'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MapPin, MessageCircle, UserPlus, UserMinus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/use-user'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/actions/messages'
import { toast } from 'sonner'
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

  const isOwnProfile = user?.id === profile.id

  const handleFollow = async () => {
    if (!user) return

    setLoading(true)

    const supabase = createClient()

    if (isFollowing) {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)

      setIsFollowing(false)
      setFollowers(v => v - 1)
    } else {
      await supabase
        .from('followers')
        .insert({
          follower_id: user.id,
          following_id: profile.id,
        })

      setIsFollowing(true)
      setFollowers(v => v + 1)
    }

    setLoading(false)
  }

  const handleMessage = async () => {
    try {
      const id = await getOrCreateConversation(profile.id)
      router.push(`/messages/${id}`)
    } catch {
      toast.error('Erreur ouverture chat')
    }
  }

  return (
    <div className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden">

      {/* BANNER */}
      <div className="h-28 bg-gradient-to-br from-[#F5F5F5] to-[#EDEDED]" />

      <div className="px-6 pb-6">

        {/* HEADER ROW */}
        <div className="flex items-end justify-between -mt-10">

          {/* AVATAR */}
          <Avatar className="w-20 h-20 border-4 border-white shadow-sm">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-[#F5F5F5] text-[#666] text-xl font-medium">
              {profile.fullname?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* ACTIONS */}
          {!isOwnProfile ? (
            <div className="flex gap-2">

              <Button
                size="sm"
                variant="outline"
                onClick={handleMessage}
                className="h-9 border-[#EAEAEA] text-[#555] hover:text-[#111]"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>

              <Button
                size="sm"
                onClick={handleFollow}
                disabled={loading}
                className={`h-9 px-4 rounded-full transition ${
                  isFollowing
                    ? 'bg-[#F5F5F5] text-[#111] hover:bg-[#EAEAEA]'
                    : 'bg-[#111] text-white hover:opacity-90'
                }`}
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

            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/settings')}
              className="h-9 border-[#EAEAEA] text-[#555]"
            >
              Modifier
            </Button>
          )}
        </div>

        {/* INFO */}
        <div className="mt-4 space-y-2">

          <h1 className="text-xl font-medium text-[#111]">
            {profile.fullname}
          </h1>

          {profile.bio && (
            <p className="text-sm text-[#666] leading-relaxed max-w-xl">
              {profile.bio}
            </p>
          )}

          {/* LOCATION */}
          <div className="flex flex-wrap gap-3 text-xs text-[#888] pt-1">

            {profile.current_country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city ? `${profile.city}, ` : ''}
                {profile.current_country}
              </span>
            )}

            {profile.origin_country && (
              <span>🌍 {profile.origin_country}</span>
            )}

          </div>

          {/* STATS */}
          <div className="flex gap-8 pt-4">

            <div>
              <p className="text-sm font-medium text-[#111]">
                {postsCount}
              </p>
              <p className="text-xs text-[#777]">Publications</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#111]">
                {followers}
              </p>
              <p className="text-xs text-[#777]">Abonnés</p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#111]">
                {followingCount}
              </p>
              <p className="text-xs text-[#777]">Abonnements</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}