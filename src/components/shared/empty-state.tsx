// empty-state
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  ShoppingBag,
  MessageCircle,
  FileText,
  Search,
  Bell,
} from 'lucide-react'

type EmptyStateProps = {
  type: 'feed' | 'marketplace' | 'messages' | 'profile-posts' | 'profile-listings' | 'search' | 'notifications'
  action?: { label: string; href: string }
}

const config = {
  feed: {
    icon: Users,
    title: 'Aucune publication',
    description: 'Soyez le premier à partager quelque chose avec la communauté.',
    defaultAction: { label: 'Créer une publication', href: '/create-post' },
  },
  marketplace: {
    icon: ShoppingBag,
    title: 'Aucune annonce',
    description: 'Pas encore d\'annonces dans cette catégorie.',
    defaultAction: { label: 'Publier une annonce', href: '/create-listing' },
  },
  messages: {
    icon: MessageCircle,
    title: 'Aucun message',
    description: 'Contactez un membre pour démarrer une conversation.',
    defaultAction: { label: 'Explorer la communauté', href: '/explore' },
  },
  'profile-posts': {
    icon: FileText,
    title: 'Aucune publication',
    description: 'Ce membre n\'a pas encore publié de contenu.',
    defaultAction: null,
  },
  'profile-listings': {
    icon: ShoppingBag,
    title: 'Aucune annonce',
    description: 'Ce membre n\'a pas encore publié d\'annonce.',
    defaultAction: null,
  },
  search: {
    icon: Search,
    title: 'Aucun résultat',
    description: 'Essayez avec d\'autres mots-clés.',
    defaultAction: null,
  },
  notifications: {
    icon: Bell,
    title: 'Aucune notification',
    description: 'Vous êtes à jour !',
    defaultAction: null,
  },
}

export function EmptyState({ type, action }: EmptyStateProps) {
  const { icon: Icon, title, description, defaultAction } = config[type]
  const cta = action || defaultAction

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      {cta && (
        <Link href={cta.href}>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            {cta.label}
          </Button>
        </Link>
      )}
    </div>
  )
}