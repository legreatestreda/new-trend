'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { toggleLike, createComment, deletePost } from '@/lib/actions/posts'
import { toast } from 'sonner'
import {
  Heart,
  MessageCircle,
  Trash2,
  Send,
  MapPin,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import type { Post, Comment } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { ReportButton } from '@/components/shared/report-button'
import { HashtagText } from './hashtag-text'
import { cn } from '@/lib/utils'

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

  /* LIKE */
  const handleLike = async () => {
    const newLiked = !liked

    setLiked(newLiked)
    setLikesCount((v) => (newLiked ? v + 1 : v - 1))

    try {
      await toggleLike(post.id)
    } catch {
      setLiked(liked)
      setLikesCount((v) => (liked ? v + 1 : v - 1))
    }
  }

  /* COMMENTS */
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

  /* DELETE */
  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      toast.success('Supprimé')
      onRefetch?.()
    } catch {
      toast.error('Erreur suppression')
    }
  }

  /* MENTIONS */
  function renderComment(content: string) {
    return content.split(/(@\w+)/g).map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} className="text-green-600 font-medium">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-5 space-y-4">

      {/* HEADER */}
      <div className="flex items-start justify-between">

        <Link
          href={`/profile/${post.user?.id}`}
          className="flex items-center gap-3"
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.user?.avatar_url || ''} />
            <AvatarFallback>
              {post.user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              {post.user?.fullname}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {post.user?.current_country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.user.city ? `${post.user.city}, ` : ''}
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
            className="text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="text-sm text-gray-800 whitespace-pre-wrap">
        <HashtagText content={post.content} />
      </div>

      {/* Images style Facebook */}
{post.images?.length > 0 && (
  <div className={`
    grid gap-1 rounded-xl overflow-hidden
    ${post.images.length === 1 ? 'grid-cols-1' : ''}
    ${post.images.length === 2 ? 'grid-cols-2' : ''}
    ${post.images.length >= 3 ? 'grid-cols-2' : ''}
  `}>
    {post.images.slice(0, 4).map((url, i) => {
      const isLast = i === 3 && post.images.length > 4
      const remaining = post.images.length - 4

      return (
        <div
          key={i}
          className={`
            relative bg-gray-100 overflow-hidden
            ${post.images.length === 1 ? 'aspect-video' : 'aspect-square'}
            ${post.images.length === 3 && i === 0 ? 'col-span-2' : ''}
          `}
        >
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
          />
          {isLast && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{remaining + 1}</span>
            </div>
          )}
        </div>
      )
    })}
  </div>
)}

      {/* ACTIONS */}
      <div className="flex items-center justify-between pt-2 text-sm">

        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1 transition",
            liked ? "text-red-500" : "text-gray-500"
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          {likesCount}
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-1 text-gray-500"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments_count || 0}
        </button>

        <ReportButton type="post" refId={post.id} />
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="space-y-3 pt-2 border-t">

          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback>
                  {comment.user?.fullname?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="bg-gray-50 border rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-medium">
                  {comment.user?.fullname}
                </p>

                <p className="text-xs text-gray-600">
                  {renderComment(comment.content)}
                </p>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="text-sm"
            />

            <button
              onClick={handleComment}
              className="text-green-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  )
}