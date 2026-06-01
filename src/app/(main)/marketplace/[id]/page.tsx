import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, MessageCircle } from 'lucide-react'
import { BackButton } from '@/components/shared/back-button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ImageCarousel } from '@/components/marketplace/image-carousel'
import { ShareButton } from '@/components/marketplace/share-button'
import { ReportButton } from '@/components/shared/report-button'

import type { Listing } from '@/types/database'
import { ListingCard } from '@/components/marketplace/listing-card'

/* ---------------- SEO ---------------- */

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, images, price, location')
    .eq('id', id)
    .single()

  if (!listing) {
    return { title: 'Annonce | Diaspora Marketplace' }
  }

  return {
    title: `${listing.title} | Diaspora Marketplace`,
    description: listing.description || listing.title,
    openGraph: {
      title: listing.title,
      description: `${listing.price ? `${listing.price}€ — ` : ''}${listing.description || ''}`,
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: `${listing.price ? `${listing.price}€ — ` : ''}${listing.description || ''}`,
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  }
}

/* ---------------- PAGE ---------------- */

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  /* LISTING */
  const { data: listing } = await supabase
    .from('listings')
    .select('*, user:users(*)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  /* SIMILAR */
  const { data: similar } = await supabase
    .from('listings')
    .select('*, user:users(*)')
    .eq('category', listing.category)
    .eq('is_active', true)
    .neq('id', id)
    .limit(4)

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <BackButton />

      {/* MAIN CARD */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        {/* IMAGES */}
        {listing.images?.length > 0 && (
          <ImageCarousel images={listing.images || []} />
        )}

        <div className="p-5 space-y-4">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-3">

            <div>
              <Badge className="mb-2 bg-green-50 text-green-700 border-green-200">
                {listing.category}
              </Badge>

              <h1 className="text-xl font-bold text-gray-900">
                {listing.title}
              </h1>

              {/* SHARE + REPORT */}
              <div className="flex items-center gap-3 mt-2">
                <ShareButton title={listing.title} />
                <ReportButton type="listing" refId={listing.id} />
              </div>
            </div>

            {listing.price !== null && (
              <span className="text-2xl font-bold text-green-600">
                {listing.price.toLocaleString('fr-FR')} €
              </span>
            )}
          </div>

          {/* LOCATION */}
          {listing.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              {listing.location}
            </div>
          )}

          {/* DESCRIPTION */}
          <p className="text-sm text-gray-700 leading-relaxed">
            {listing.description}
          </p>

          {/* USER */}
          <div className="border-t pt-4 flex items-center justify-between">

            <Link
              href={`/profile/${listing.user?.id}`}
              className="flex items-center gap-3"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={listing.user?.avatar_url || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                  {listing.user?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {listing.user?.fullname}
                </p>
                <p className="text-xs text-gray-500">
                  {listing.user?.current_country}
                </p>
              </div>
            </Link>

            <Link href={`/messages?user=${listing.user?.id}`}>
              <Button className="bg-green-600 hover:bg-green-700 gap-2">
                <MessageCircle className="w-4 h-4" />
                Contacter
              </Button>
            </Link>

          </div>
        </div>
      </div>

      {/* SIMILAR LISTINGS */}
      {similar && similar.length > 0 && (
        <div className="space-y-3">

          <h2 className="text-base font-bold text-gray-900">
            Annonces similaires
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {similar.map((item: Listing) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>

        </div>
      )}

    </div>
  )
}