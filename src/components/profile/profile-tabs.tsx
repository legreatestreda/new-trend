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

  const TabButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    count,
  }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-1 flex items-center justify-center gap-2",
        "py-3 text-sm font-medium transition",
        active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="text-xs text-gray-400">({count})</span>

      {/* ACTIVE INDICATOR */}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-gray-900 rounded-full" />
      )}
    </button>
  )

  return (
    <div className="bg-white border rounded-2xl overflow-hidden">

      {/* TABS */}
      <div className="flex border-b bg-white">

        <TabButton
          active={tab === 'posts'}
          onClick={() => setTab('posts')}
          icon={FileText}
          label="Publications"
          count={posts.length}
        />

        <TabButton
          active={tab === 'listings'}
          onClick={() => setTab('listings')}
          icon={Grid}
          label="Annonces"
          count={listings.length}
        />
      </div>

      {/* CONTENT */}
      <div className="p-3 sm:p-4">

        {/* POSTS */}
        {tab === 'posts' && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                Aucune publication pour le moment
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}

        {/* LISTINGS */}
        {tab === 'listings' && (
          <div>
            {listings.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                Aucune annonce pour le moment
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((listing) => (
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