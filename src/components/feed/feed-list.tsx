'use client'

import { PostCard } from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePosts } from '@/lib/hooks/use-posts'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

export function FeedList() {
  const { posts, loading, refetch } = usePosts()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#ECECEC] p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-[#FAFAFA] border border-[#EDEDED] flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-[#999]" />
        </div>

        <h3 className="text-[16px] font-medium text-[#111] mb-1">
          Aucune publication
        </h3>

        <p className="text-[14px] text-[#777] max-w-sm">
          Soyez le premier à partager quelque chose avec votre communauté.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <PostCard post={post} onRefetch={refetch} />
        </motion.div>
      ))}
    </div>
  )
}