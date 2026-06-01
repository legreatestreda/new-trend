'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ListingCard } from './listing-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListings } from '@/lib/hooks/use-listings'
import { LISTING_CATEGORIES } from '@/types/database'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'

const categories = ['Tous', ...LISTING_CATEGORIES]

export function ListingGrid() {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const { listings, loading, loadingMore, hasMore, loadMore } =
    useListings(activeCategory)

  const { ref, inView } = useInView({ threshold: 0.1 })

  useEffect(() => {
    if (inView && hasMore && !loadingMore) loadMore()
  }, [inView, hasMore, loadingMore, loadMore])

  return (
    <div className="space-y-4">

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              activeCategory === cat
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState type="marketplace" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div ref={ref} className="flex justify-center py-4">
            {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-green-500" />}
            {!hasMore && listings.length > 0 && (
              <p className="text-xs text-gray-400">
                Toutes les annonces sont affichées
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}