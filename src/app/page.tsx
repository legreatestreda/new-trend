import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, MessageCircle, ShoppingBag, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Diaspora</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Connexion</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-green-600 hover:bg-green-700">S&apos;inscrire</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 max-w-3xl mx-auto">
        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full mb-6">
          La communauté africaine connectée
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Restez connecté à vos racines,<br />
          <span className="text-green-600">où que vous soyez</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl">
          Échangez, vendez, discutez et créez des liens avec la diaspora africaine et le continent. Une seule plateforme pour votre communauté.
        </p>
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8">
              Rejoindre gratuitement
            </Button>
          </Link>
          <Link href="/explore">
            <Button size="lg" variant="outline" className="px-8">
              Explorer
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 py-16 max-w-6xl mx-auto">
        {[
          {
            icon: <Users className="w-6 h-6 text-green-600" />,
            title: 'Réseau communautaire',
            desc: 'Suivez des membres, partagez vos expériences, restez informé.',
          },
          {
            icon: <ShoppingBag className="w-6 h-6 text-green-600" />,
            title: 'Marketplace',
            desc: 'Achetez et vendez entre membres de la communauté.',
          },
          {
            icon: <MessageCircle className="w-6 h-6 text-green-600" />,
            title: 'Messagerie privée',
            desc: 'Discutez en temps réel avec n\'importe quel membre.',
          },
          {
            icon: <Globe className="w-6 h-6 text-green-600" />,
            title: 'Diaspora mondiale',
            desc: 'Connectez-vous avec des Africains partout dans le monde.',
          },
        ].map((f, i) => (
          <div key={i} className="flex flex-col gap-3 p-6 rounded-2xl border border-gray-100 hover:border-green-100 hover:bg-green-50/30 transition">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              {f.icon}
            </div>
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-green-600 mx-6 rounded-3xl px-8 py-16 text-center max-w-4xl lg:mx-auto mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à rejoindre la communauté ?</h2>
        <p className="text-green-100 mb-8">Gratuit, rapide, et fait pour vous.</p>
        <Link href="/register">
          <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-10">
            Créer mon compte
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-8 border-t">
        © 2025 Diaspora Platform — Fait avec ❤️ pour la communauté africaine
      </footer>
    </main>
  )
}