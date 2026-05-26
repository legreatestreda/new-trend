'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toggleSaveListing } from '@/lib/actions/listings'
import { toast } from 'sonner'
import { MapPin, Bookmark, BookmarkCheck } from 'lucide-react'
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
      <div className="group bg-white border border-[#ECECEC] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-[#DDDDDD]">

        {/* IMAGE */}
        <div className="relative aspect-[4/3] bg-[#F5F5F5] overflow-hidden">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#CCC] text-3xl">
              📦
            </div>
          )}

          {/* SAVE */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-md rounded-full p-1.5 border border-[#EDEDED] hover:bg-white transition"
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4 text-[#111]" />
            ) : (
              <Bookmark className="w-4 h-4 text-[#777]" />
            )}
          </button>

          {/* CATEGORY */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/80 text-[#555] border border-[#EDEDED] text-[11px] px-2 py-1 backdrop-blur-md">
              {listing.category}
            </Badge>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-3">

          {/* TITLE + PRICE */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[14px] font-medium text-[#111] line-clamp-1">
              {listing.title}
            </h3>

            {listing.price !== null && (
              <span className="text-[14px] font-semibold text-[#111] shrink-0">
                {listing.price.toLocaleString('fr-FR')} €
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          {listing.description && (
            <p className="text-[13px] text-[#777] line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}

          {/* FOOTER */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F2F2F2]">

            {/* USER */}
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={listing.user?.avatar_url || ''} />
                <AvatarFallback className="bg-[#F5F5F5] text-[#666] text-[10px]">
                  {listing.user?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <span className="text-[12px] text-[#777] truncate max-w-[90px]">
                {listing.user?.fullname}
              </span>
            </div>

            {/* LOCATION */}
            {listing.location && (
              <div className="flex items-center gap-1 text-[12px] text-[#999]">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">
                  {listing.location}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}