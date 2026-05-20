import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/back-button'

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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  // Posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, user:users(*), likes(count), comments(count)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // Listings
  const { data: listings } = await supabase
    .from('listings')
    .select('*, user:users(*)')
    .eq('user_id', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Followers count
  const { count: followersCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', id)

  // Following count
  const { count: followingCount } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', id)

  // Is following
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

  const postsWithMeta = (posts || []).map((post) => ({
    ...post,
    likes_count: post.likes[0]?.count || 0,
    comments_count: post.comments[0]?.count || 0,
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