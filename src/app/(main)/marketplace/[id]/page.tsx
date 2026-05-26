import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, MessageCircle } from 'lucide-react'
import { BackButton } from '@/components/shared/back-button'
import { notFound } from 'next/navigation'
import Link from 'next/link'


export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('*, user:users(*)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <BackButton />

      <div className="bg-white rounded-2xl border overflow-hidden">
        {/* Images */}
        {listing.images?.length > 0 && (
          <div className={`grid gap-1 ${listing.images.length > 1 ? 'grid-cols-2' : ''}`}>
            {listing.images.slice(0, 4).map((url: string, i: number) => (
              <img key={i} src={url} alt="" className="w-full aspect-video object-cover bg-gray-100" />
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge className="mb-2 bg-green-50 text-green-700 border-green-200">
                {listing.category}
              </Badge>
              <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
            </div>
            {listing.price !== null && (
              <span className="text-2xl font-bold text-green-600 shrink-0">
                {listing.price.toLocaleString('fr-FR')} €
              </span>
            )}
          </div>

          {listing.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              {listing.location}
            </div>
          )}

          <p className="text-sm text-gray-700 leading-relaxed">{listing.description}</p>

          <div className="border-t pt-4 flex items-center justify-between">
            <Link href={`/profile/${listing.user?.id}`} className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={listing.user?.avatar_url || ''} />
                <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                  {listing.user?.fullname?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">{listing.user?.fullname}</p>
                <p className="text-xs text-gray-500">{listing.user?.current_country}</p>
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
    </div>
  )
}