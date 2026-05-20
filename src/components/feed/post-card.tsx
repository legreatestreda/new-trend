// post-card
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toggleLike, createComment, deletePost } from '@/lib/actions/posts'
import { toast } from 'sonner'
import { Heart, MessageCircle, Trash2, Send, MapPin } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import type { Post, Comment } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export function PostCard({ post, onRefetch }: { post: Post; onRefetch?: () => void }) {
  const { user } = useUser()
  const [liked, setLiked] = useState(post.is_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)

  const handleLike = async () => {
    setLiked(l => !l)
    setLikesCount(c => liked ? c - 1 : c + 1)
    try {
      await toggleLike(post.id)
    } catch {
      setLiked(l => !l)
      setLikesCount(c => liked ? c + 1 : c - 1)
    }
  }

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return }
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
      toast.error('Erreur lors du commentaire')
    }
    setLoadingComment(false)
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      toast.success('Publication supprimée')
      onRefetch?.()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link href={`/profile/${post.user?.id}`} className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.user?.avatar_url || ''} />
            <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
              {post.user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-gray-900 hover:underline">
              {post.user?.fullname}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {post.user?.current_country && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.user.city ? `${post.user.city}, ` : ''}{post.user.current_country}
                </span>
              )}
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}</span>
            </div>
          </div>
        </Link>

        {user?.id === post.user_id && (
          <button onClick={handleDelete} className="text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Images */}
      {post.images?.length > 0 && (
        <div className={`grid gap-2 rounded-xl overflow-hidden ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.slice(0, 4).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-full object-cover aspect-video bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments_count || 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="space-y-3 pt-2 border-t">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 text-[10px]">
                  {comment.user?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-900">{comment.user?.fullname}</p>
                <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="Écrire un commentaire..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              className="text-sm h-8"
            />
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 h-8 px-3"
              onClick={handleComment}
              disabled={loadingComment || !commentText.trim()}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}