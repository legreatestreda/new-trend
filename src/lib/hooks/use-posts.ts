'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/database'

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchPosts = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*),
        likes(count),
        comments(count)
      `)
      .order('created_at', { ascending: false })
      .limit(30)

    if (data) {
      const postsWithMeta = await Promise.all(
        data.map(async (post) => {
          let is_liked = false
          if (user) {
            const { data: like } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single()
            is_liked = !!like
          }
          return {
            ...post,
            likes_count: post.likes[0]?.count || 0,
            comments_count: post.comments[0]?.count || 0,
            is_liked,
          }
        })
      )
      setPosts(postsWithMeta)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, refetch: fetchPosts }
}