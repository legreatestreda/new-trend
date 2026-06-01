'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations } from '@/lib/hooks/use-messages'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'

export function ConversationList() {
  const { conversations, loading } = useConversations()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return <EmptyState type="messages" />
  }

  return (
    <div className="divide-y">
      {conversations.map(conv => {
        const other = conv.members?.[0]
        const isActive = pathname === `/messages/${conv.id}`

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={cn(
              'flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors',
              isActive && 'bg-green-50 hover:bg-green-50'
            )}
          >
            <Avatar className="w-11 h-11">
              <AvatarImage src={other?.avatar_url || ''} />
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                {other?.fullname?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm truncate',
                (conv.unread_count || 0) > 0
                  ? 'font-bold text-gray-900'
                  : 'font-medium text-gray-800'
              )}>
                {other?.fullname}
              </p>

              <p className="text-xs text-gray-400 truncate mt-0.5">
                {conv.last_message?.content || 'Démarrer la conversation'}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}