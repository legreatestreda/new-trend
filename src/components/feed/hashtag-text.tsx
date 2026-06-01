'use client'

import { useRouter } from 'next/navigation'

export function HashtagText({ content }: { content: string }) {
  const router = useRouter()

  const parts = content.split(/(#\w+)/g)

  return (
    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <button
            key={i}
            onClick={() => router.push(`/search?q=${encodeURIComponent(part.slice(1))}`)}
            className="text-green-600 font-medium hover:underline"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}