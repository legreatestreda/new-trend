import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'
import { Globe } from 'lucide-react'

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: listings } = await supabase
    .from('listings')
    .select('*, user:users(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Explorer la communauté</h1>
        <p className="text-gray-500">Découvrez des membres et des annonces de la diaspora africaine</p>
      </div>

      {/* Membres récents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Membres récents</h2>
          <Link href="/register" className="text-sm text-green-600 hover:underline font-medium">
            Rejoindre →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(users || []).map(user => (
            <Link key={user.id} href={`/feed`}>
              <div className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow text-center space-y-2">
                <Avatar className="w-14 h-14 mx-auto">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="bg-green-100 text-green-700 font-bold text-lg">
                    {user.fullname?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.fullname}</p>
                  {user.current_country && (
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {user.current_country}
                    </p>
                  )}
                  {user.origin_country && (
                    <p className="text-xs text-gray-400 mt-0.5">🌍 {user.origin_country}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Annonces récentes */}
      {listings && listings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Annonces récentes</h2>
            <Link href="/marketplace" className="text-sm text-green-600 hover:underline font-medium">
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {listings.map(listing => (
              <Link key={listing.id} href={`/marketplace/${listing.id}`}>
                <div className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">{listing.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      {listing.price !== null ? (
                        <span className="text-sm font-bold text-green-600">
                          {listing.price.toLocaleString('fr-FR')} €
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Prix à discuter</span>
                      )}
                      {listing.location && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-green-600 rounded-3xl px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Rejoignez la communauté
        </h2>
        <p className="text-green-100 mb-6 text-sm">
          Créez votre compte gratuitement et connectez-vous avec la diaspora africaine
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/register"
            className="bg-white text-green-600 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
          >
            S&apos;inscrire
          </Link>
          <Link
            href="/login"
            className="border border-white/40 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}