'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types/database'

const PAGE_SIZE = 12

export function useListings(category?: string) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const hasFetched = useRef(false)

  const fetchListings = useCallback(async (pageNum: number, replace = false) => {
    const supabase = createClient()
    if (pageNum === 0) setLoading(true)
    else setLoadingMore(true)

    let query = supabase
      .from('listings')
      .select('*, user:users(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE)

    if (category && category !== 'Tous') {
      query = query.eq('category', category)
    }

    const { data } = await query
    const hasNextPage = (data || []).length > PAGE_SIZE
    const sliced = (data || []).slice(0, PAGE_SIZE)

    setListings(prev => replace ? sliced : [...prev, ...sliced])
    setHasMore(hasNextPage)

    if (pageNum === 0) setLoading(false)
    else setLoadingMore(false)
  }, [category])

  useEffect(() => {
    hasFetched.current = false
    setPage(0)
    setListings([])
  }, [category])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings(0, true)
  }, [fetchListings])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchListings(nextPage)
  }, [loadingMore, hasMore, page, fetchListings])

  return { listings, loading, loadingMore, hasMore, loadMore }
}