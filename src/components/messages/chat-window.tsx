'use client'

import { useEffect, useRef, useState } from 'react'
import { useMessages } from '@/lib/hooks/use-messages'
import { sendMessage } from '@/lib/actions/messages'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, ArrowLeft } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/database'
import { cn } from '@/lib/utils'

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
  const [otherTyping, setOtherTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  // ✅ CORRECTION
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherTyping])

  useEffect(() => {
    if (!otherUser?.id) return

    const supabase = createClient()

    const checkOnline = async () => {
      const { data } = await supabase
        .from('users')
        .select('last_seen')
        .eq('id', otherUser.id)
        .single()

      if (data?.last_seen) {
        const diff = Date.now() - new Date(data.last_seen).getTime()
        setIsOnline(diff < 3 * 60 * 1000)
      }
    }

    checkOnline()

    const interval = setInterval(checkOnline, 30000)

    return () => clearInterval(interval)
  }, [otherUser?.id])

  useEffect(() => {
    if (!user?.id) return

    const supabase = createClient()

    const update = () =>
      supabase
        .from('users')
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id)

    update()

    const interval = setInterval(update, 60000)

    return () => clearInterval(interval)
  }, [user?.id])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user?.id) {
          setOtherTyping(true)

          setTimeout(() => {
            setOtherTyping(false)
          }, 1500)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, user?.id])

  const broadcastTyping = () => {
    const supabase = createClient()

    supabase.channel(`typing:${conversationId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user?.id,
      },
    })
  }

  const handleSend = async () => {
    if (!text.trim()) return

    setSending(true)

    try {
      await sendMessage(conversationId, text.trim())
      setText('')
    } catch {
      toast.error("Erreur d'envoi")
    } finally {
      setSending(false)
    }
  }

  const handleTyping = (value: string) => {
    setText(value)

    broadcastTyping()

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      // futur code typing stop
    }, 1000)
  }

  return (
    // ton JSX actuel...

    <div className="flex flex-col h-[100dvh] bg-gray-50">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">

        <Link
          href="/messages"
          className="md:hidden text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="relative">
          <Avatar className="w-9 h-9">
            <AvatarImage src={otherUser?.avatar_url || ''} />
            <AvatarFallback>
              {otherUser?.fullname?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">
            {otherUser?.fullname}
          </p>

          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="text-green-600 font-medium">En ligne</span>
            ) : (
              `${otherUser?.city || ''} ${otherUser?.current_country || ''}`
            )}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  i % 2 === 0 && "flex-row-reverse"
                )}
              >
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Commence la conversation 👋
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.id}
            />
          ))
        )}

        {otherTyping && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="sticky bottom-0 bg-white border-t p-3 flex items-end gap-2 pb-[env(safe-area-inset-bottom)]">

        <Input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Message..."
          className="flex-1 rounded-full bg-gray-100 border-transparent focus:bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />

        <Button
          size="icon"
          className="rounded-full bg-green-600 hover:bg-green-700 shrink-0"
          disabled={!text.trim() || sending}
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </Button>

      </div>
    </div>
  )
}