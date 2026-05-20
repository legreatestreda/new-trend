import { createClient } from '@/lib/supabase/server'
import { ChatWindow } from '@/components/messages/chat-window'
import { notFound } from 'next/navigation'
import type { User } from '@/types/database'

type MemberRow = {
  user: User
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: members } = await supabase
    .from('conversation_members')
    .select('user:users(*)')
    .eq('conversation_id', params.id)
    .neq('user_id', user.id)

  const otherUser: User | null = (members as unknown as MemberRow[])?.[0]?.user || null

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border overflow-hidden">
      <ChatWindow conversationId={params.id} otherUser={otherUser} />
    </div>
  )
}