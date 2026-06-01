import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'

/* ---------------- SEO ---------------- */

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('fullname, bio, avatar_url, current_country')
    .eq('id', id)
    .single()

  if (!profile) {
    return {
      title: 'Profil | Diaspora',
    }
  }

  return {
    title: `${profile.fullname} | Diaspora`,
    description:
      profile.bio ||
      `${profile.fullname} — ${profile.current_country || ''} • Diaspora africaine`,

    openGraph: {
      title: `${profile.fullname} | Diaspora`,
      description: profile.bio || `Profil de ${profile.fullname}`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },

    twitter: {
      card: 'summary',
      title: `${profile.fullname} | Diaspora`,
      description: profile.bio || `Profil de ${profile.fullname}`,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}

/* ---------------- PAGE ---------------- */

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* PROFILE */
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  /* POSTS */
  const { data: posts } = await supabase
    .from('posts')
    .select('*, user:users(*), likes(count), comments(count)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  /* LISTINGS */
  const { data: listings } = await supabase
    .from('listings')
    .select('*, user:users(*)')
    .eq('user_id', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  /* FOLLOWERS COUNT */
  const { count: followersCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', id)

  /* FOLLOWING COUNT */
  const { count: followingCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', id)

  /* IS FOLLOWING */
  let isFollowing = false

  if (user && user.id !== id) {
    const { data: follow } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', id)
      .single()

    isFollowing = !!follow
  }

  /* POSTS META */
  const postsWithMeta = (posts || []).map((post: any) => ({
    ...post,
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
    is_liked: false,
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      <BackButton />

      <ProfileHeader
        profile={profile}
        postsCount={posts?.length || 0}
        followersCount={followersCount || 0}
        followingCount={followingCount || 0}
        isFollowing={isFollowing}
      />

      <ProfileTabs
        posts={postsWithMeta}
        listings={listings || []}
      />

    </div>
  )
}