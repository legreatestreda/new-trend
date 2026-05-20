// profile-tabs
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
    <div className="bg-white rounded-2xl border overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('posts')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors',
            tab === 'posts'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <FileText className="w-4 h-4" />
          Publications ({posts.length})
        </button>
        <button
          onClick={() => setTab('listings')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors',
            tab === 'listings'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Grid className="w-4 h-4" />
          Annonces ({listings.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Aucune publication pour le moment
              </div>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {tab === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Aucune annonce pour le moment
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}