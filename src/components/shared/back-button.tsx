'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function BackButton() {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    setCanGoBack(window.history.length > 1)
  }, [])

  const handleBack = () => {
    if (canGoBack) router.back()
    else router.push('/feed') // fallback intelligent
  }

  return (
    <button
      onClick={handleBack}
      className={cn(
        "inline-flex items-center gap-2 group transition",
        "text-sm font-medium text-gray-500 hover:text-gray-900"
      )}
    >
      <span
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          "bg-gray-100 border border-gray-200",
          "group-hover:bg-white group-hover:shadow-sm",
          "group-hover:-translate-x-0.5 transition-all duration-200"
        )}
      >
        <ArrowLeft className="w-4 h-4" />
      </span>

      <span className="relative">
        Retour
        <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-gray-900 group-hover:w-full transition-all duration-300" />
      </span>
    </button>
  )
}