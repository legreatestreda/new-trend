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
  origin_country: z.string().min(2),
  current_country: z.string().min(2),
  city: z.string().min(2),
  bio: z.string().min(10).max(160),
})

type FormData = z.infer<typeof schema>

const steps = [
  {
    title: "D'où venez-vous ?",
    fields: ['origin_country'] as (keyof FormData)[],
    placeholder: "Ex: Sénégal, Maroc, Côte d'Ivoire...",
  },
  {
    title: "Où vivez-vous ?",
    fields: ['current_country', 'city'] as (keyof FormData)[],
  },
  {
    title: "Parlez de vous",
    fields: ['bio'] as (keyof FormData)[],
    placeholder: "Votre histoire, vos passions...",
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
  })

  const stepData = steps[step]

  const next = async () => {
    const valid = await trigger(stepData.fields)
    if (!valid) return toast.error('Champ requis')
    setStep(s => s + 1)
  }

  const back = () => setStep(s => s - 1)

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return router.push('/login')

    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erreur')
      setLoading(false)
      return
    }

    router.push('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">

      <div className="w-full max-w-md">

        {/* HEADER SIMPLE */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center mx-auto mb-4">
            <Globe className="w-5 h-5 text-white" />
          </div>

          <h1 className="text-xl font-medium text-[#111]">
            {stepData.title}
          </h1>

          <p className="text-sm text-[#777] mt-1">
            Étape {step + 1} / {steps.length}
          </p>
        </div>

        {/* PROGRESS MINIMAL */}
        <div className="flex gap-1 mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-[#111]' : 'bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>

        {/* FORM ZONE */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* STEP 1 */}
          {step === 0 && (
            <Input
              placeholder="Pays d'origine"
              {...register('origin_country')}
              className="h-11"
              autoFocus
            />
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <div className="space-y-3">
              <Input
                placeholder="Pays actuel"
                {...register('current_country')}
                className="h-11"
              />
              <Input
                placeholder="Ville"
                {...register('city')}
                className="h-11"
              />
            </div>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <Textarea
              placeholder="Parlez de vous..."
              rows={5}
              {...register('bio')}
            />
          )}

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">

            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={back}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}

            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                className="flex-1 bg-[#111]"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#111]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Terminer"
                )}
              </Button>
            )}

          </div>

        </form>
      </div>
    </div>
  )
}