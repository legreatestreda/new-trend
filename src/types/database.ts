// database
export type User = {
  id: string
  fullname: string
  avatar_url: string | null
  bio: string | null
  origin_country: string | null
  current_country: string | null
  city: string | null
   onboarding_completed: boolean  // ← ajouter
  created_at: string
}

export type Post = {
  id: string
  user_id: string
  content: string
  images: string[]
  created_at: string
  user?: User
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: User
}

export type Listing = {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number | null
  category: string
  images: string[]
  location: string | null
  is_active: boolean
  created_at: string
  user?: User
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  image_url: string | null
  is_read: boolean
  created_at: string
  sender?: User
}

export type Conversation = {
  id: string
  created_at: string
  members?: User[]
  last_message?: Message
  unread_count?: number
}

export type Notification = {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'message'
  ref_id: string | null
  is_read: boolean
  created_at: string
}

export const LISTING_CATEGORIES = [
  'Électronique',
  'Vêtements',
  'Automobile',
  'Immobilier',
  'Services',
  'Alimentation',
  'Divers',
] as const

export type ListingCategory = typeof LISTING_CATEGORIES[number]