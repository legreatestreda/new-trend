import { Skeleton } from '@/components/ui/skeleton'

export function FeedSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border overflow-hidden">
        <Skeleton className="h-36 w-full" />
        <div className="px-5 pb-5 space-y-3 -mt-10">
          <Skeleton className="w-20 h-20 rounded-full border-4 border-white" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
          <div className="flex gap-5 pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-2xl border overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MessagesSkeleton() {
  return (
    <div className="space-y-1 divide-y">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="w-11 h-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  )
}