'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { PostCard } from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePosts } from '@/lib/hooks/use-posts'
import { Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

export function FeedList() {
  const { posts, loading, loadingMore, hasMore, loadMore, refetch } =
    usePosts()

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  })

  /* INFINITE SCROLL */
  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMore()
    }
  }, [inView, hasMore, loadingMore, loadMore])

  /* LOADING STATE */
  if (loading) {
    return (
      <div className="space-y-4 px-3 sm:px-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  /* EMPTY STATE */
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState type="feed" />
      </div>
    )
  }

  return (
    <div className="space-y-4 px-3 sm:px-0 pb-20">

      {/* POSTS */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onRefetch={refetch} />
      ))}

      {/* SENTINEL */}
      <div ref={ref} className="flex justify-center py-6">

        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            Chargement...
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-xs text-gray-400">
            Vous êtes à jour 🎉
          </p>
        )}
      </div>

    </div>
  )
}