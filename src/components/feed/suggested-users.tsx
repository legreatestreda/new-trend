import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { MapPin, UserPlus } from 'lucide-react'

export async function SuggestedUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  /* FOLLOWING LIST */
  const { data: following } = await supabase
    .from('followers')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (following || []).map(f => f.following_id)
  followingIds.push(user.id)

  /* PROFILE */
  const { data: profile } = await supabase
    .from('users')
    .select('current_country, origin_country')
    .eq('id', user.id)
    .single()

  /* SUGGESTIONS */
  const { data: suggestions } = await supabase
    .from('users')
    .select('*')
    .not('id', 'in', `(${followingIds.join(',')})`)
    .or(
      `current_country.eq.${profile?.current_country},origin_country.eq.${profile?.origin_country}`
    )
    .limit(5)

  if (!suggestions?.length) return null

  return (
    <div className="bg-white border rounded-2xl p-4 space-y-4 sticky top-20">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Suggestions
        </h3>

        <Link
          href="/explore"
          className="text-xs text-green-600 hover:underline"
        >
          Voir plus
        </Link>
      </div>

      {/* LIST */}
      <div className="space-y-3">

        {suggestions.map((s) => (
          <Link
            key={s.id}
            href={`/profile/${s.id}`}
            className="flex items-center gap-3 group"
          >

            {/* AVATAR */}
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src={s.avatar_url || ''} />
              <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
                {s.fullname?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* INFO */}
            <div className="flex-1 min-w-0">

              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-600 transition">
                {s.fullname}
              </p>

              {s.current_country && (
                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {s.city ? `${s.city}, ` : ''}
                  {s.current_country}
                </p>
              )}
            </div>

            {/* CTA */}
            <button
              className="
                text-xs px-3 py-1.5 rounded-full
                bg-gray-100 hover:bg-green-600 hover:text-white
                transition flex items-center gap-1
              "
            >
              <UserPlus className="w-3 h-3" />
              Suivre
            </button>

          </Link>
        ))}

      </div>
    </div>
  )
}