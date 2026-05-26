'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Globe, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Identifiants incorrects')
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  const signInWithGoogle = async () => {
    setGoogleLoading(true)

    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">

      <div className="w-full max-w-sm">

        {/* HEADER */}
        <div className="text-center mb-8">

          <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4">
            <Globe className="w-5 h-5 text-white" />
          </div>

          <h1 className="text-xl font-medium text-[#111]">
            Bon retour
          </h1>

          <p className="text-sm text-[#777] mt-1">
            Connectez-vous à votre compte
          </p>

        </div>

        {/* CARD */}
        <div className="bg-white border border-[#ECECEC] rounded-2xl p-6 space-y-5">

          {/* GOOGLE */}
          <Button
            variant="outline"
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="w-full h-10 border-[#EAEAEA] text-[#111] hover:bg-[#F5F5F5]"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92..." />
                </svg>
                Continuer avec Google
              </span>
            )}
          </Button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#EAEAEA]" />
            <span className="text-xs text-[#999]">ou</span>
            <div className="h-px flex-1 bg-[#EAEAEA]" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <Input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="border-[#EAEAEA] focus:border-[#111]"
            />
            {errors.email && (
              <p className="text-xs text-red-500">Email invalide</p>
            )}

            <Input
              type="password"
              placeholder="Mot de passe"
              {...register('password')}
              className="border-[#EAEAEA] focus:border-[#111]"
            />
            {errors.password && (
              <p className="text-xs text-red-500">Minimum 6 caractères</p>
            )}

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-[#777] hover:text-[#111]"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111] hover:opacity-90 text-white h-10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Se connecter'
              )}
            </Button>

          </form>

        </div>

        {/* FOOTER */}
        <p className="text-center text-sm text-[#777] mt-6">
          Pas de compte ?{' '}
          <Link
            href="/register"
            className="text-[#111] font-medium hover:underline"
          >
            S’inscrire
          </Link>
        </p>

      </div>
    </div>
  )
}