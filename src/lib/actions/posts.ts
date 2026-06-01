'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type RawPost = {
  id: string
  user_id: string
  content: string
  images: string[]
  created_at: string
  user: any
  likes: { count: number }[]
  comments: { count: number }[]
}

function scorePost(
  post: RawPost,
  followingIds: string[],
  userCountry: string | null,
  now: number
): number {
  const likes = post.likes[0]?.count || 0
  const comments = post.comments[0]?.count || 0
  const ageHours = (now - new Date(post.created_at).getTime()) / 3600000

  let score = likes * 3 + comments * 5
  score += Math.max(0, 100 - ageHours * 2)

  if (followingIds.includes(post.user_id)) score *= 2
  if (userCountry && post.user?.current_country === userCountry) score *= 1.5
  if (ageHours > 72) score *= 0.5

  return score
}

export async function getFeedPosts(offset = 0, limit = 11) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userCountry: string | null = null
  let followingIds: string[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('current_country')
      .eq('id', user.id)
      .single()

    userCountry = profile?.current_country || null

    const { data: following } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id)

    followingIds = (following || []).map(f => f.following_id)
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // 1. recent posts
  let { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(*),
      likes(count),
      comments(count)
    `)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // 2. fallback
  if (!posts || posts.length === 0) {
    const result = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*),
        likes(count),
        comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    posts = result.data || []
  }

  if (!posts) return []

  const now = Date.now()

  const scored = (posts as RawPost[]).map(post => ({
    ...post,
    likes_count: post.likes[0]?.count || 0,
    comments_count: post.comments[0]?.count || 0,
    is_liked: false,
    _score: scorePost(post, followingIds, userCountry, now),
  }))

  scored.sort((a, b) => b._score - a._score)

  if (user) {
    const postIds = scored.map(p => p.id)

    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds)

    const likedIds = new Set((userLikes || []).map(l => l.post_id))

    scored.forEach(p => {
      p.is_liked = likedIds.has(p.id)
    })
  }

  return scored
}

export async function createComment(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })

  if (error) throw new Error(error.message)
}
export async function createPost(content: string, images: string[] = []) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content,
      images,
    })

  if (error) throw new Error(error.message)

  revalidatePath('/feed')
}
export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id) // sécurité: seul le owner peut supprimer

  if (error) throw new Error(error.message)

  revalidatePath('/feed')
}
export async function toggleLike(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  // vérifier si le like existe déjà
  const { data: existing, error: fetchError } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(fetchError.message)
  }

  // si déjà liké → unlike
  if (existing) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existing.id)

    if (error) throw new Error(error.message)

    return { liked: false }
  }

  // sinon → like
  const { error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      user_id: user.id,
    })

  if (error) throw new Error(error.message)

  return { liked: true }
}