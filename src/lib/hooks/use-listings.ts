// use-listings
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types/database'

export function useListings(category?: string) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchListings = useCallback(async () => {
    const supabase = createClient()

    let query = supabase
      .from('listings')
      .select('*, user:users(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(40)

    if (category && category !== 'Tous') {
      query = query.eq('category', category)
    }

    const { data } = await query
    setListings(data || [])
    setLoading(false)
  }, [category])

  useEffect(() => {
    hasFetched.current = false
  }, [category])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings()
  }, [fetchListings])

  return { listings, loading, refetch: fetchListings }
}