'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ListingCard } from '@/components/marketplace/listing-card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import type { User, Listing } from '@/types/database'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [users, setUsers] = useState<User[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) return
    const search = async () => {
      setLoading(true)
      const supabase = createClient()

      const [{ data: foundUsers }, { data: foundListings }] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .or(`fullname.ilike.%${q}%,current_country.ilike.%${q}%,origin_country.ilike.%${q}%,city.ilike.%${q}%`)
          .limit(10),
        supabase
          .from('listings')
          .select('*, user:users(*)')
          .or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,location.ilike.%${q}%`)
          .eq('is_active', true)
          .limit(12),
      ])

      setUsers(foundUsers || [])
      setListings(foundListings || [])
      setLoading(false)
    }
    search()
  }, [q])

  if (!q) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Rechercher</h2>
        <p className="text-sm text-gray-500">Membres, annonces, pays...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-bold text-gray-900">
        Résultats pour <span className="text-green-600">"{q}"</span>
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Membres */}
          {users.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Membres ({users.length})
              </h2>
              <div className="space-y-2">
                {users.map(user => (
                  <Link key={user.id} href={`/profile/${user.id}`}>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border hover:shadow-sm transition-shadow">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {user.fullname?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{user.fullname}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {user.current_country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.city ? `${user.city}, ` : ''}{user.current_country}
                            </span>
                          )}
                          {user.origin_country && (
                            <span>🌍 {user.origin_country}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Annonces */}
          {listings.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Annonces ({listings.length})
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          )}

          {users.length === 0 && listings.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Aucun résultat pour "{q}"</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}