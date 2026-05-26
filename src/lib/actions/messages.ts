'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOrCreateConversation(otherUserId: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Chercher une conversation existante entre les deux users
  const { data: myConvos } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (myConvos && myConvos.length > 0) {
    const myConvoIds = myConvos.map(c => c.conversation_id)

    const { data: shared } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', otherUserId)
      .in('conversation_id', myConvoIds)

    if (shared && shared.length > 0) {
      return shared[0].conversation_id
    }
  }

  // Créer une nouvelle conversation
  const { data: newConvo, error } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single()

  if (error) {
    console.error('Erreur création conversation:', error)
    throw new Error(error.message)
  }

  if (!newConvo) throw new Error('Pas de conversation retournée')

  // Ajouter les deux membres
  const { error: membersError } = await supabase
    .from('conversation_members')
    .insert([
      { conversation_id: newConvo.id, user_id: user.id },
      { conversation_id: newConvo.id, user_id: otherUserId },
    ])

  if (membersError) {
    console.error('Erreur ajout membres:', membersError)
    throw new Error(membersError.message)
  }

  return newConvo.id
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    })

  if (error) throw new Error(error.message)
}