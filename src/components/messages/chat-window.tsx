// chat-window
'use client'

import { useEffect, useRef, useState } from 'react'
import { useMessages } from '@/lib/hooks/use-messages'
import { sendMessage } from '@/lib/actions/messages'
import { MessageBubble } from './message-bubble'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, ArrowLeft } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'
import Link from 'next/link'
import type { User } from '@/types/database'

export function ChatWindow({
  conversationId,
  otherUser,
}: {
  conversationId: string
  otherUser: User | null
}) {
  const { user } = useUser()
  const { messages, loading } = useMessages(conversationId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      await sendMessage(conversationId, text.trim())
      setText('')
    } catch {
      toast.error('Erreur lors de l\'envoi')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <Link href="/messages" className="md:hidden text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar className="w-9 h-9">
          <AvatarImage src={otherUser?.avatar_url || ''} />
          <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
            {otherUser?.fullname?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-gray-900">{otherUser?.fullname}</p>
          <p className="text-xs text-gray-500">
            {otherUser?.city ? `${otherUser.city}, ` : ''}{otherUser?.current_country}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">Démarrez la conversation 👋</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex items-center gap-2">
        <Input
          placeholder="Écrire un message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 rounded-full bg-gray-50 border-gray-200"
        />
        <Button
          size="icon"
          className="rounded-full bg-green-600 hover:bg-green-700 shrink-0"
          onClick={handleSend}
          disabled={sending || !text.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}