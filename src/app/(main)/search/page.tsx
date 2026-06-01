import { Suspense } from 'react'
import SearchClient from './search-client'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-10">Chargement...</div>}>
      <SearchClient />
    </Suspense>
  )
}