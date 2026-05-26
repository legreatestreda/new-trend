'use client'

import { useState } from 'react'
import { ListingCard } from './listing-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListings } from '@/lib/hooks/use-listings'
import { LISTING_CATEGORIES } from '@/types/database'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = ['Tous', ...LISTING_CATEGORIES]

export function ListingGrid() {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const { listings, loading } = useListings(activeCategory)

  return (
    <div className="space-y-6">

      {/* CATEGORIES */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'shrink-0 px-4 py-1.5 rounded-full text-sm transition border',
                activeCategory === cat
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#666] border-[#EAEAEA] hover:border-[#CCC] hover:text-[#111]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* subtle fade scroll hint */}
        <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white pointer-events-none" />
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden"
            >
              <Skeleton className="aspect-[4/3] w-full" />

              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}

        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">

          <div className="w-14 h-14 rounded-full bg-[#F5F5F5] border border-[#EAEAEA] flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6 text-[#999]" />
          </div>

          <h3 className="text-[15px] font-medium text-[#111] mb-1">
            Aucune annonce
          </h3>

          <p className="text-sm text-[#777] max-w-sm">
            Soyez le premier à publier une annonce dans cette catégorie.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}

        </div>
      )}
    </div>
  )
}