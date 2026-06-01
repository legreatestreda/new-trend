'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useConversations } from '@/lib/hooks/use-messages'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/shared/empty-state'

export function ConversationList() {
  const { conversations, loading } = useConversations()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-40" />
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

      {conversations.map((conv) => {
        const other = conv.members?.[0]
        const isActive = pathname === `/messages/${conv.id}`
        const unread = (conv.unread_count || 0) > 0

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition",
              "hover:bg-gray-50",
              isActive && "bg-green-50"
            )}
          >

            {/* AVATAR */}
            <div className="relative shrink-0">
              <Avatar className="w-11 h-11">
                <AvatarImage src={other?.avatar_url || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                  {other?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* online dot (optionnel si tu l’ajoutes plus tard) */}
              {/* <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" /> */}
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">

              <div className="flex items-center justify-between gap-2">

                <p
                  className={cn(
                    "text-sm truncate",
                    unread
                      ? "font-semibold text-gray-900"
                      : "font-medium text-gray-700"
                  )}
                >
                  {other?.fullname}
                </p>

                {/* TIME */}
                {conv.updated_at && (
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(conv.updated_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 mt-0.5">

                <p className="text-xs text-gray-400 truncate">
                  {conv.last_message?.content || 'Démarrer la conversation'}
                </p>

                {/* UNREAD BADGE */}
                {unread && (
                  <span className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-green-600 text-white text-[10px] font-semibold shrink-0">
                    {conv.unread_count}
                  </span>
                )}

              </div>
            </div>
          </Link>
        )
      })}

    </div>
  )
}