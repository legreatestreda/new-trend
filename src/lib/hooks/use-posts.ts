'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getFeedPosts } from '@/lib/actions/posts'
import type { Post } from '@/types/database'

const PAGE_SIZE = 10

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const hasFetched = useRef(false)

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    if (pageNum === 0) setLoading(true)
    else setLoadingMore(true)

    const data = await getFeedPosts(pageNum * PAGE_SIZE, PAGE_SIZE + 1)

    const hasNextPage = data.length > PAGE_SIZE
    const sliced = data.slice(0, PAGE_SIZE)

    setPosts(prev => replace ? sliced as unknown as Post[] : [...prev, ...sliced as unknown as Post[]])
    setHasMore(hasNextPage)

    if (pageNum === 0) setLoading(false)
    else setLoadingMore(false)
  }, [])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts(0, true)
  }, [fetchPosts])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }, [loadingMore, hasMore, page, fetchPosts])

  const refetch = useCallback(() => {
    setPage(0)
    hasFetched.current = false
    fetchPosts(0, true)
  }, [fetchPosts])

  return { posts, loading, loadingMore, hasMore, loadMore, refetch }
}