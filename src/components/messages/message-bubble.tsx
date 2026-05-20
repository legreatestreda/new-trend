// message-bubble
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Message } from '@/types/database'

export function MessageBubble({
  message,
  isOwn,
}: {
  message: Message
  isOwn: boolean
}) {
  return (
    <div className={cn('flex gap-2 items-end', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarImage src={message.sender?.avatar_url || ''} />
          <AvatarFallback className="bg-green-100 text-green-700 text-xs">
            {message.sender?.fullname?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('max-w-[70%] space-y-1', isOwn && 'items-end flex flex-col')}>
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-green-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}
        >
          {message.image_url && (
            <img
              src={message.image_url}
              alt=""
              className="rounded-xl mb-2 max-w-full"
            />
          )}
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 px-1">
          {formatDistanceToNow(new Date(message.created_at), { locale: fr, addSuffix: true })}
        </span>
      </div>
    </div>
  )
}