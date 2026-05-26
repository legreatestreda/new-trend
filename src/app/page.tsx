'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-[#111] overflow-hidden">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#111]" />

            <span className="text-[15px] font-medium tracking-tight">
              New Trend
            </span>
          </Link>

          

          {/* CTA */}
          <Link href="/register">
            <button className="h-10 px-5 rounded-full bg-[#111] text-white text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              Commencer
            </button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Small badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <span className="inline-flex items-center rounded-full border border-[#E5E5E5] px-4 py-2 text-[12px] text-[#555] bg-[#FAFAFA]">
              Conçu pour les communautés africaines du monde entier
            </span>
          </motion.div>

          {/* Main content */}
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="text-[48px] md:text-[72px] lg:text-[88px] leading-[0.98] tracking-[-0.06em] font-medium"
            >
              Restez connecté
              <br />
              où que
              <br />
              vous soyez.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.1,
              }}
              className="mt-8 max-w-lg text-[16px] leading-relaxed text-[#666]"
            >
              Une plateforme moderne pensée pour connecter les communautés
              africaines, les opportunités et les cultures à travers le monde.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.2,
              }}
              className="flex items-center gap-5 mt-10"
            >
              <Link href="/register">
                <button className="group h-12 px-6 rounded-full bg-[#111] text-white text-[14px] flex items-center gap-3 hover:shadow-xl transition-all duration-300">
                  Rejoindre maintenant

                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link
                href="/explore"
                className="text-[14px] text-[#666] hover:text-black transition-colors"
              >
                Explorer la plateforme
              </Link>
            </motion.div>
          </div>

          {/* Floating UI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: {
                duration: 1,
              },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="relative mt-24"
          >
            <div className="rounded-[36px] border border-[#ECECEC] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Top */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-[#F1F1F1]">
                <div>
                  <p className="text-sm text-[#888]">
                    Fil communautaire
                  </p>

                  <h3 className="text-[18px] font-medium mt-1">
                    Réseau Africain Global
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />

                  <span className="text-sm text-[#666]">
                    En ligne
                  </span>
                </div>
              </div>

              {/* Feed */}
              <div className="grid lg:grid-cols-3 gap-5 p-6">
                {[
                  {
                    title: 'Entrepreneurs à Paris 🇫🇷',
                    text: 'Découvrez des fondateurs, événements et opportunités.',
                  },
                  {
                    title: 'Marketplace 🌍',
                    text: 'Achetez et vendez au sein de votre communauté.',
                  },
                  {
                    title: 'Communautés 💬',
                    text: 'Gardez un lien avec votre culture et votre réseau.',
                  },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    whileHover={{
                      y: -5,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="rounded-[24px] border border-[#F0F0F0] bg-[#FAFAFA] p-5"
                  >
                    <h4 className="text-[16px] font-medium leading-tight">
                      {card.title}
                    </h4>

                    <p className="mt-3 text-[14px] leading-relaxed text-[#666]">
                      {card.text}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Bottom */}
              <div className="px-8 py-5 border-t border-[#F1F1F1] flex items-center justify-between">
                <div>
                  <p className="text-[24px] font-medium tracking-tight">
                    12K+
                  </p>

                  <p className="text-sm text-[#777] mt-1">
                    Membres actifs
                  </p>
                </div>

                <div>
                  <p className="text-[24px] font-medium tracking-tight">
                    35+
                  </p>

                  <p className="text-sm text-[#777] mt-1">
                    Pays connectés
                  </p>
                </div>

                <div>
                  <p className="text-[24px] font-medium tracking-tight">
                    24/7
                  </p>

                  <p className="text-sm text-[#777] mt-1">
                    Communauté active
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}