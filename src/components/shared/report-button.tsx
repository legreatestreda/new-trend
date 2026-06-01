'use client'

import { Flag } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const reasons = [
  'Contenu inapproprié',
  'Spam',
  'Fausse information',
  'Harcèlement',
  'Escroquerie',
  'Autre',
]

export function ReportButton({
  type,
  refId,
}: {
  type: 'post' | 'listing' | 'user'
  refId: string
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReport = async () => {
    if (!selected || loading) return

    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase.from('reports').insert({
        user_id: user.id,
        type,
        ref_id: refId,
        reason: selected,
      })

      toast.success('Signalement envoyé')
      setOpen(false)
      setSelected('')
    } catch (err) {
      toast.error('Erreur lors du signalement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* TRIGGER */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs",
          "text-gray-400 hover:text-red-500",
          "transition group"
        )}
      >
        <Flag className="w-3.5 h-3.5 group-hover:scale-110 transition" />
        Signaler
      </button>

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl">

          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Signaler ce contenu
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-3">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelected(reason)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm transition-all",
                  "border",
                  selected === reason
                    ? "bg-red-50 border-red-300 text-red-700 font-medium scale-[1.01]"
                    : "border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                )}
              >
                {reason}
              </button>
            ))}
          </div>

          <Button
            onClick={handleReport}
            disabled={!selected || loading}
            className={cn(
              "w-full rounded-xl transition",
              "bg-red-500 hover:bg-red-600"
            )}
          >
            {loading ? 'Envoi...' : 'Envoyer le signalement'}
          </Button>

        </DialogContent>
      </Dialog>
    </>
  )
}