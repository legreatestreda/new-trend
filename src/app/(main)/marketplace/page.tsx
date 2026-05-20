import { ListingGrid } from '@/components/marketplace/listing-grid'
import { Button } from '@/components/ui/button'
import { PlusSquare } from 'lucide-react'
import Link from 'next/link'

export default function MarketplacePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
        <Link href="/create-listing">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
            <PlusSquare className="w-4 h-4" />
            Vendre
          </Button>
        </Link>
      </div>
      <ListingGrid />
    </div>
  )
}