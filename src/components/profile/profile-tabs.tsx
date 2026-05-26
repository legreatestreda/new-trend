'use client'

import { useState } from 'react'
import { PostCard } from '@/components/feed/post-card'
import { ListingCard } from '@/components/marketplace/listing-card'
import { cn } from '@/lib/utils'
import { Grid, FileText } from 'lucide-react'
import type { Post, Listing } from '@/types/database'

export function ProfileTabs({
  posts,
  listings,
}: {
  posts: Post[]
  listings: Listing[]
}) {
  const [tab, setTab] = useState<'posts' | 'listings'>('posts')

  return (
    <div className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden">

      {/* TABS */}
      <div className="flex border-b border-[#F2F2F2] bg-white">

        {/* POSTS */}
        <button
          onClick={() => setTab('posts')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm transition relative',
            tab === 'posts'
              ? 'text-[#111]'
              : 'text-[#777] hover:text-[#111]'
          )}
        >
          <FileText className="w-4 h-4" />
          Publications
          <span className="text-xs text-[#999]">
            ({posts.length})
          </span>

          {tab === 'posts' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#111] rounded-full" />
          )}
        </button>

        {/* LISTINGS */}
        <button
          onClick={() => setTab('listings')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm transition relative',
            tab === 'listings'
              ? 'text-[#111]'
              : 'text-[#777] hover:text-[#111]'
          )}
        >
          <Grid className="w-4 h-4" />
          Annonces
          <span className="text-xs text-[#999]">
            ({listings.length})
          </span>

          {tab === 'listings' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#111] rounded-full" />
          )}
        </button>

      </div>

      {/* CONTENT */}
      <div className="p-4">

        {tab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-sm text-[#999]">
                  Aucune publication
                </div>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}

        {tab === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-sm text-[#999]">
                  Aucune annonce
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {listings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}