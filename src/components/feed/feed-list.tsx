// feed-list
'use client'

import { PostCard } from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePosts } from '@/lib/hooks/use-posts'
import { Users } from 'lucide-react'

export function FeedList() {
  const { posts, loading, refetch } = usePosts()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Aucune publication</h3>
        <p className="text-sm text-gray-500">Soyez le premier à partager quelque chose !</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onRefetch={refetch} />
      ))}
    </div>
  )
}