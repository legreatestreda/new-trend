'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { toggleLike, createComment, deletePost } from '@/lib/actions/posts'
import { toast } from 'sonner'
import { Heart, MessageCircle, Trash2, Send, MapPin } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import type { Post, Comment } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export function PostCard({
  post,
  onRefetch,
}: {
  post: Post
  onRefetch?: () => void
}) {
  const { user } = useUser()

  const [liked, setLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)

  const handleLike = async () => {
    setLiked(v => !v)
    setLikesCount(v => (liked ? v - 1 : v + 1))

    try {
      await toggleLike(post.id)
    } catch {
      setLiked(v => !v)
      setLikesCount(v => (liked ? v + 1 : v - 1))
    }
  }

  const loadComments = async () => {
    if (showComments) return setShowComments(false)

    const supabase = createClient()

    const { data } = await supabase
      .from('comments')
      .select('*, user:users(*)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    setComments(data || [])
    setShowComments(true)
  }

  const handleComment = async () => {
    if (!commentText.trim()) return

    setLoadingComment(true)

    try {
      await createComment(post.id, commentText)
      setCommentText('')

      const supabase = createClient()
      const { data } = await supabase
        .from('comments')
        .select('*, user:users(*)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      setComments(data || [])
    } catch {
      toast.error('Erreur commentaire')
    }

    setLoadingComment(false)
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      toast.success('Supprimé')
      onRefetch?.()
    } catch {
      toast.error('Erreur suppression')
    }
  }

  return (
    <div className="group bg-white border border-[#ECECEC] rounded-2xl p-5 transition-all duration-300 hover:shadow-sm hover:border-[#DDDDDD]">
      
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <Link
          href={`/profile/${post.user?.id}`}
          className="flex items-center gap-3"
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.user?.avatar_url || ''} />
            <AvatarFallback className="bg-[#F5F5F5] text-[#666] text-xs">
              {post.user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-medium text-[#111] group-hover:underline">
              {post.user?.fullname}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#888]">
              {post.user?.current_country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.user.city
                    ? `${post.user.city}, `
                    : ''}
                  {post.user.current_country}
                </span>
              )}

              <span>·</span>

              <span>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </Link>

        {user?.id === post.user_id && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition text-[#AAA] hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <p className="text-sm text-[#222] leading-relaxed mt-4 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* IMAGES */}
      {post.images?.length > 0 && (
        <div
          className={`mt-4 grid gap-2 rounded-xl overflow-hidden ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.images.slice(0, 4).map((url, i) => (
            <img
              key={i}
              src={url}
              className="aspect-video w-full object-cover bg-[#F5F5F5]"
            />
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#F2F2F2] text-sm">
        
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition ${
            liked ? 'text-red-500' : 'text-[#888] hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likesCount}
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-1 text-[#888] hover:text-[#111] transition"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments_count || 0}
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-[#F2F2F2] space-y-3">
          
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback className="bg-[#F5F5F5] text-[10px] text-[#666]">
                  {comment.user?.fullname?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="bg-[#FAFAFA] border border-[#F0F0F0] rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-medium text-[#111]">
                  {comment.user?.fullname}
                </p>

                <p className="text-xs text-[#666] mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {/* INPUT */}
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Écrire un commentaire..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              className="h-9 text-sm border-[#EAEAEA]"
            />

            <button
              onClick={handleComment}
              disabled={!commentText.trim() || loadingComment}
              className="h-9 px-3 rounded-lg bg-[#111] text-white hover:opacity-90 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}