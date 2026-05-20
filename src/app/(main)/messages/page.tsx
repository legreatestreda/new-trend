import { Suspense } from 'react'
import MessagesInner from './MessagesInner'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesInner />
    </Suspense>
  )
}