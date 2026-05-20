// conversation-list
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations } from '@/lib/hooks/use-messages'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-3">
          <MessageCircle className="w-7 h-7 text-green-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">Aucune conversation</p>
        <p className="text-xs text-gray-500 mt-1">Contactez un membre pour démarrer</p>
      </div>
    )
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
            <div className="relative shrink-0">
              <Avatar className="w-11 h-11">
                <AvatarImage src={other?.avatar_url || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                  {other?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {(conv.unread_count || 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {conv.unread_count}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  'text-sm truncate',
                  (conv.unread_count || 0) > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
                )}>
                  {other?.fullname}
                </p>
                {conv.last_message && (
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(conv.last_message.created_at), { locale: fr, addSuffix: false })}
                  </span>
                )}
              </div>
              <p className={cn(
                'text-xs truncate mt-0.5',
                (conv.unread_count || 0) > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'
              )}>
                {conv.last_message?.content || 'Démarrer la conversation'}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}