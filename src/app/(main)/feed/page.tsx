import { PostForm } from '@/components/feed/post-form'
import { FeedList } from '@/components/feed/feed-list'
import { SuggestedUsers } from '@/components/feed/suggested-users'
import { Suspense } from 'react'
import { FeedSkeleton } from '@/components/shared/page-skeleton'

export default function FeedPage() {
  return (
    <div className="flex gap-6 max-w-4xl mx-auto">
      {/* Feed principal */}
      <div className="flex-1 min-w-0 space-y-4">
        <PostForm />
        <Suspense fallback={<FeedSkeleton />}>
          <FeedList />
        </Suspense>
      </div>

      {/* Sidebar suggestions — desktop only */}
      <div className="w-72 shrink-0 hidden lg:block">
        <Suspense fallback={null}>
          <SuggestedUsers />
        </Suspense>
      </div>
    </div>
  )
}