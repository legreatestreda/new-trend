'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Globe, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'

const schema = z.object({
  origin_country: z.string().min(2, 'Veuillez indiquer votre pays d\'origine'),
  current_country: z.string().min(2, 'Veuillez indiquer votre pays actuel'),
  city: z.string().min(2, 'Veuillez indiquer votre ville'),
  bio: z.string().min(10, 'Écrivez au moins 10 caractères').max(160, 'Maximum 160 caractères'),
})

type FormData = z.infer<typeof schema>

const steps = [
  {
    title: 'Votre origine',
    description: 'D\'où venez-vous ?',
    fields: ['origin_country'] as (keyof FormData)[],
  },
  {
    title: 'Votre localisation',
    description: 'Où vivez-vous actuellement ?',
    fields: ['current_country', 'city'] as (keyof FormData)[],
  },
  {
    title: 'Votre bio',
    description: 'Présentez-vous à la communauté',
    fields: ['bio'] as (keyof FormData)[],
  },
]

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const currentStep = steps[step]

  const nextStep = async () => {
    const valid = await trigger(currentStep.fields)
    if (!valid) {
      toast.error('Veuillez remplir tous les champs avant de continuer')
      return
    }
    setStep(s => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    // Valider la dernière étape avant soumission
    const valid = await trigger(currentStep.fields)
    if (!valid) {
      toast.error('Veuillez remplir tous les champs avant de continuer')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase
      .from('users')
      .update({
        origin_country: data.origin_country,
        current_country: data.current_country,
        city: data.city,
        bio: data.bio,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Une erreur est survenue')
      setLoading(false)
      return
    }

    toast.success('Profil complété ! Bienvenue 🎉')
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mb-3">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{currentStep.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{currentStep.description}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-green-600' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        {/* Étape indicator */}
        <p className="text-xs text-gray-400 text-center mb-6">
          Étape {step + 1} sur {steps.length} — tous les champs sont obligatoires
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Étape 1 — Pays d'origine */}
          {step === 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Pays d&apos;origine <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Ex: Sénégal, Côte d'Ivoire, Maroc..."
                {...register('origin_country')}
                className={errors.origin_country ? 'border-red-400 focus-visible:ring-red-400' : ''}
                autoFocus
              />
              {errors.origin_country && (
                <p className="text-xs text-red-500">{errors.origin_country.message}</p>
              )}
            </div>
          )}

          {/* Étape 2 — Localisation actuelle */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Pays actuel <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ex: France, Belgique, Canada..."
                  {...register('current_country')}
                  className={errors.current_country ? 'border-red-400 focus-visible:ring-red-400' : ''}
                  autoFocus
                />
                {errors.current_country && (
                  <p className="text-xs text-red-500">{errors.current_country.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Ville <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Ex: Paris, Bruxelles, Montréal..."
                  {...register('city')}
                  className={errors.city ? 'border-red-400 focus-visible:ring-red-400' : ''}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Étape 3 — Bio */}
          {step === 2 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                Bio <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Parlez-nous de vous, de votre parcours, de vos passions..."
                rows={5}
                {...register('bio')}
                className={errors.bio ? 'border-red-400 focus-visible:ring-red-400' : ''}
                autoFocus
              />
              <div className="flex justify-between items-center">
                {errors.bio ? (
                  <p className="text-xs text-red-500">{errors.bio.message}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-gray-400 text-right">
                  {watch('bio')?.length || 0}/160
                </p>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setStep(s => s - 1)}
              >
                <ChevronLeft className="w-4 h-4" /> Retour
              </Button>
            )}

            {step < steps.length - 1 ? (
              <Button
                type="button"
                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                onClick={nextStep}
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Terminer et rejoindre'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}