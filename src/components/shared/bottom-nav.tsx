'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BottomNav() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="
        inline-flex items-center gap-2
        text-sm text-[#777]
        hover:text-[#111]
        transition
        group
      "
    >
      <span
        className="
          w-7 h-7 rounded-full
          flex items-center justify-center
          bg-[#F5F5F5]
          border border-[#EAEAEA]
          group-hover:bg-[#EAEAEA]
          transition
        "
      >
        <ArrowLeft className="w-4 h-4" />
      </span>

      <span className="font-medium">
        Retour
      </span>
    </button>
  )
}