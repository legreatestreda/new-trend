// listings
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: {
  title: string
  description: string
  price: number | null
  category: string
  location: string
  images: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('listings')
    .insert({ ...formData, user_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/marketplace')
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/marketplace')
}

export async function toggleSaveListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: existing } = await supabase
    .from('saved_listings')
    .select('id')
    .eq('listing_id', listingId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('saved_listings').delete().eq('id', existing.id)
    return false
  } else {
    await supabase.from('saved_listings').insert({ listing_id: listingId, user_id: user.id })
    return true
  }
}