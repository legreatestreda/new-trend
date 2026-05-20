// listing-card
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toggleSaveListing } from '@/lib/actions/listings'
import { toast } from 'sonner'
import { MapPin, Bookmark, BookmarkCheck, MessageCircle } from 'lucide-react'
import type { Listing } from '@/types/database'

export function ListingCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    const result = await toggleSaveListing(listing.id)
    setSaved(result)
    toast.success(result ? 'Annonce sauvegardée' : 'Annonce retirée')
  }

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <div className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow group">
        {/* Image */}
        <div className="aspect-video bg-gray-100 overflow-hidden relative">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-colors"
          >
            {saved
              ? <BookmarkCheck className="w-4 h-4 text-green-600" />
              : <Bookmark className="w-4 h-4 text-gray-500" />
            }
          </button>
          <Badge className="absolute top-2 left-2 bg-white/90 text-gray-700 backdrop-blur-sm text-xs">
            {listing.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
            {listing.price !== null && (
              <span className="text-sm font-bold text-green-600 shrink-0">
                {listing.price.toLocaleString('fr-FR')} €
              </span>
            )}
          </div>

          {listing.description && (
            <p className="text-xs text-gray-500 line-clamp-2">{listing.description}</p>
          )}

          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={listing.user?.avatar_url || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 text-[9px]">
                  {listing.user?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 truncate max-w-[80px]">
                {listing.user?.fullname}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              {listing.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}