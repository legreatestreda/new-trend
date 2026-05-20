// bottom-nav
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, MessageCircle, PlusSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/lib/hooks/use-user'

const links = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/marketplace', icon: ShoppingBag, label: 'Market' },
  { href: '/create-post', icon: PlusSquare, label: 'Publier' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
              pathname.startsWith(href)
                ? 'text-green-600'
                : 'text-gray-400'
            )}
          >
            <Icon className={cn('w-5 h-5', href === '/create-post' && 'w-6 h-6')} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
        <Link
          href={`/profile/${user?.id}`}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
            pathname.startsWith('/profile') ? 'text-green-600' : 'text-gray-400'
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  )
}