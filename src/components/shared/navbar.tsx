'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Globe,
  Home,
  ShoppingBag,
  MessageCircle,
  PlusSquare,
  LogOut,
  User,
  Search,
} from 'lucide-react'
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
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useState } from 'react'

const navLinks = [
  { href: '/feed', label: 'Accueil', icon: Home },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile } = useUser()
  const [search, setSearch] = useState('')

  const handleLogout = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push('/login')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!search.trim()) return

    router.push(`/search?q=${encodeURIComponent(search.trim())}`)
    setSearch('')
  }

  return (
    <>
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* LOGO */}
          <Link
            href="/feed"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>

            <span className="font-semibold hidden sm:block">
              Diaspora
            </span>
          </Link>

          {/* SEARCH DESKTOP */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9 h-9 rounded-full bg-gray-100 border-transparent focus:bg-white"
              />
            </div>
          </form>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">

            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition',
                    active
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 ml-auto">

            {/* SEARCH MOBILE */}
            <Link
              href="/search"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </Link>

            {/* CREATE POST */}
            <Link
              href="/create-post"
              className="hidden sm:block"
            >
              <Button className="rounded-full bg-green-600 hover:bg-green-700 gap-2">
                <PlusSquare className="w-4 h-4" />
                Publier
              </Button>
            </Link>

            {/* NOTIFICATIONS */}
            <NotificationBell />

            {/* PROFILE MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full hover:scale-105 transition">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || ''} />

                    <AvatarFallback className="bg-gray-100 text-gray-700">
                      {profile?.fullname?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold truncate">
                    {profile?.fullname}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user?.id}`}>
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-white/95 backdrop-blur-md">
        <div className="grid grid-cols-4 h-14">

          {navLinks.map(({ href, icon: Icon }) => {
            const active = pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center justify-center transition',
                  active
                    ? 'text-green-600'
                    : 'text-gray-500'
                )}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}

          <Link
            href="/search"
            className="flex items-center justify-center text-gray-500"
          >
            <Search className="w-5 h-5" />
          </Link>

        </div>
      </nav>
    </>
  )
}