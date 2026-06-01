'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors"
    >
      {copied
        ? <Check className="w-4 h-4 text-green-500" />
        : <Share2 className="w-4 h-4" />
      }
      {copied ? 'Copié !' : 'Partager'}
    </button>
  )
}