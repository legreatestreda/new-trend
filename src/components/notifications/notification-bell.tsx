// notification-bell
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Notification } from '@/types/database'

const notifLabel = (type: string) => {
  switch (type) {
    case 'like': return '❤️ a aimé votre publication'
    case 'comment': return '💬 a commenté votre publication'
    case 'follow': return '👤 vous suit maintenant'
    case 'message': return '✉️ vous a envoyé un message'
    default: return 'Nouvelle notification'
  }
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const hasFetched = useRef(false)

  const fetchNotifs = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    setNotifications(data || [])
  }, [])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifs()

    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => { fetchNotifs() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchNotifs])

  const markAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
          onClick={() => { if (!open) markAllRead() }}
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-green-600 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-green-600 hover:underline">
              Tout marquer lu
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Aucune notification
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notif => (
              <DropdownMenuItem
                key={notif.id}
                className={`flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer ${
                  !notif.is_read ? 'bg-green-50' : ''
                }`}
              >
                <p className="text-sm text-gray-800">{notifLabel(notif.type)}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notif.created_at), { locale: fr, addSuffix: true })}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}