'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConversationList } from '@/components/messages/conversation-list'
import { getOrCreateConversation } from '@/lib/actions/messages'

export default function MessagesInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user')

  useEffect(() => {
    if (!userId) return

    getOrCreateConversation(userId).then((convId) => {
      router.replace(`/messages/${convId}`)
    })
  }, [userId, router])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        <ConversationList />
      </div>
    </div>
  )
}