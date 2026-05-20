import { PostForm } from '@/components/feed/post-form'
import { FeedList } from '@/components/feed/feed-list'

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <PostForm />
      <FeedList />
    </div>
  )
}