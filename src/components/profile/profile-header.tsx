// profile-header
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
      setFollowers(f => f - 1)
    } else {
      await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true)
      setFollowers(f => f + 1)
    }
    setLoading(false)
  }

  const handleMessage = async () => {
    try {
      const convId = await getOrCreateConversation(profile.id)
      router.push(`/messages/${convId}`)
    } catch {
      toast.error('Erreur lors de l\'ouverture du chat')
    }
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      {/* Banner */}
      <div className="h-28 bg-gradient-to-br from-green-400 to-green-600" />

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Avatar className="w-20 h-20 border-4 border-white shadow-sm">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
              {profile.fullname?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {!isOwnProfile && (
            <div className="flex gap-2 mt-10">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={handleMessage}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
              <Button
                size="sm"
                className={isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 gap-1.5'
                  : 'bg-green-600 hover:bg-green-700 gap-1.5'
                }
                onClick={handleFollow}
                disabled={loading}
              >
                {isFollowing
                  ? <><UserMinus className="w-4 h-4" /> Suivi</>
                  : <><UserPlus className="w-4 h-4" /> Suivre</>
                }
              </Button>
            </div>
          )}

          {isOwnProfile && (
            <Button
              size="sm"
              variant="outline"
              className="mt-10"
              onClick={() => router.push('/settings')}
            >
              Modifier le profil
            </Button>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">{profile.fullname}</h1>

          {profile.bio && (
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {profile.current_country && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city ? `${profile.city}, ` : ''}{profile.current_country}
              </span>
            )}
            {profile.origin_country && (
              <span className="flex items-center gap-1">
                🌍 Origine : {profile.origin_country}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-5 pt-2">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{postsCount}</p>
              <p className="text-xs text-gray-500">Publications</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{followers}</p>
              <p className="text-xs text-gray-500">Abonnés</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{followingCount}</p>
              <p className="text-xs text-gray-500">Abonnements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}