'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message, User } from '@/types/database'

type ConversationMemberRow = {
  conversation: {
    id: string
    created_at: string
    messages: {
      id: string
      content: string
      created_at: string
      sender_id: string
      is_read: boolean
    }[]
  }
}

type MemberRow = {
  user: User
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchConversations = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('conversation_members')
      .select(`
        conversation:conversations(
          id,
          created_at,
          messages(
            id, content, created_at, sender_id, is_read
          )
        )
      `)
      .eq('user_id', user.id)

    if (data) {
      const convos: Conversation[] = await Promise.all(
        (data as unknown as ConversationMemberRow[]).map(async (item) => {
          const conv = item.conversation

          const { data: members } = await supabase
            .from('conversation_members')
            .select('user:users(*)')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)

          const messages = conv.messages || []
          const lastMessage = [...messages].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]

          const unreadCount = messages.filter(
            m => !m.is_read && m.sender_id !== user.id
          ).length

          return {
            id: conv.id,
            created_at: conv.created_at,
            members: (members as unknown as MemberRow[])?.map(m => m.user) || [],
            last_message: lastMessage as unknown as Message,
            unread_count: unreadCount,
          }
        })
      )

      convos.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at
        const bTime = b.last_message?.created_at || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })

      setConversations(convos)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations()
  }, [fetchConversations])

  return { conversations, loading, refetch: fetchConversations }
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  const fetchMessages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    setLoading(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)
    }
  }, [conversationId])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages()

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, sender:users(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages(prev => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, fetchMessages])

  return { messages, loading, refetch: fetchMessages }
}