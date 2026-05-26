'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { Globe, Home, ShoppingBag, MessageCircle, PlusSquare, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '@/lib/hooks/use-user'

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/marketplace', label: 'Marché', icon: ShoppingBag },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useUser()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#ECECEC]">

      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/feed" className="flex items-center gap-2">

          <div className="w-7 h-7 rounded-full bg-[#111] flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>

          <span className="font-medium text-[#111] hidden sm:block">
            New Trend
          </span>

        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-1">

          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition',
                  active
                    ? 'text-[#111]'
                    : 'text-[#777] hover:text-[#111]'
                )}
              >

                <Icon className="w-4 h-4" />

                <span>{label}</span>

                {/* underline active */}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#111] rounded-full" />
                )}

              </Link>
            )
          })}

        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">

          {/* CREATE */}
          <Link href="/create-post">
            <Button
              size="sm"
              className="hidden sm:flex bg-[#111] hover:opacity-90 gap-2"
            >
              <PlusSquare className="w-4 h-4" />
              Publier
            </Button>
          </Link>

          {/* NOTIF */}
          <NotificationBell />

          {/* PROFILE MENU */}
          <DropdownMenu>

            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">

                <Avatar className="w-8 h-8 border border-[#EAEAEA]">

                  <AvatarImage src={profile?.avatar_url || ''} />

                  <AvatarFallback className="bg-[#F5F5F5] text-[#666] text-xs font-medium">
                    {profile?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>

                </Avatar>

              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">

              <div className="px-3 py-2">

                <p className="text-sm font-medium text-[#111] truncate">
                  {profile?.fullname}
                </p>

                <p className="text-xs text-[#777] truncate">
                  {user?.email}
                </p>

              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={`/profile/${user?.id}`} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>

    </header>
  )
}