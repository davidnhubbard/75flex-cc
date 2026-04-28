'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import { getActiveChallenge, getCommitments } from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row']

export default function ReportsContent() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hasPhotoCommitment, setHasPhotoCommitment] = useState(false)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const { toastMessage, showToast, clearToast } = useToast()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const challenge = await getActiveChallenge(supabase)
      if (!challenge) {
        router.push('/onboarding')
        return
      }

      const comms = await getCommitments(supabase, challenge.id)
      setCommitments(comms)
      setHasPhotoCommitment(comms.some(c => c.category === 'photo'))
    } catch {
      showToast('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-28 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Reports" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <p className="font-sans text-sm text-ink-soft leading-snug">
          This space is for your gallery, trends, and exports. We are setting up the structure now so these tools can expand cleanly.
        </p>

        <button
          type="button"
          onClick={() => hasPhotoCommitment && router.push('/profile/reports/gallery')}
          disabled={!hasPhotoCommitment}
          className={`w-full text-left rounded-card border-[1.5px] px-4 py-3 ${
            hasPhotoCommitment
              ? 'border-state-none bg-state-none-bg active:scale-[0.99] transition-transform'
              : 'border-border bg-card opacity-70 cursor-not-allowed'
          }`}
        >
          <p className="font-sans text-sm font-semibold text-ink">Photo Diary Gallery</p>
          <p className="font-sans text-sm text-ink-soft mt-1 leading-snug">
            Mobile-first 2-column visual diary, with responsive desktop expansion planned.
          </p>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mt-2">
            {hasPhotoCommitment ? 'Tap to open' : 'Add photo commitment first'}
          </p>
        </button>

        <div className="rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3">
          <p className="font-sans text-sm font-semibold text-ink">Progress Insights</p>
          <p className="font-sans text-sm text-ink-soft mt-1 leading-snug">
            Completion patterns, consistency trends, and reflection summaries.
          </p>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mt-2">Planned</p>
        </div>

        <div className="rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3">
          <p className="font-sans text-sm font-semibold text-ink">Data Export</p>
          <p className="font-sans text-sm text-ink-soft mt-1 leading-snug">
            Export logs, notes, and photos so users always own their data.
          </p>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mt-2">Planned</p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Btn
            variant="outline"
            onClick={() => router.push('/profile')}
          >
            Back To Profile
          </Btn>
        </div>

        {commitments.length === 0 && (
          <p className="font-sans text-xs text-ink-faint">No commitments found. Create your plan first.</p>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}

