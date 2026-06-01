import Link from 'next/link'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Globe className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="text-xl font-semibold text-gray-700">Page introuvable</h2>
          <p className="text-gray-500 text-sm">
            Cette page n'existe pas ou a été supprimée.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/feed">
            <Button className="bg-green-600 hover:bg-green-700">
              Retour au feed
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline">
              Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}