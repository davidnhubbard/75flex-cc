'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import { getActiveChallenge, getBenchmark, getCommitments } from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row']
type Benchmark = Database['public']['Tables']['benchmarks']['Row']

export default function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null)
  const { toastMessage, showToast, clearToast } = useToast()

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (loading) return
    const addParam = searchParams.get('add')
    if (addParam === 'photo') {
      router.replace('/profile/plan?add=photo')
    }
  }, [loading, searchParams])

  async function load() {
    try {
      const challenge = await getActiveChallenge(supabase)
      if (!challenge) {
        router.push('/onboarding')
        return
      }

      const [comms, bench] = await Promise.all([
        getCommitments(supabase, challenge.id),
        getBenchmark(supabase, challenge.id),
      ])

      setCommitments(comms)
      setBenchmark(bench)
    } catch {
      showToast('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const requiredCount = commitments.filter(c => c.required).length
  const hasPhotoCommitment = commitments.some(c => c.category === 'photo')

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-24 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Profile" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <p className="font-sans text-sm text-ink-soft">
          Manage your baseline, plan, and progress tools from one place.
        </p>

        <button
          type="button"
          onClick={() => router.push('/profile/benchmark')}
          className="w-full text-left rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-ink">Benchmark</p>
              <p className="font-sans text-sm text-ink-soft leading-snug mt-0.5">
                Create or edit your baseline snapshot (photo + notes) so progress is easy to see later.
              </p>
              {benchmark?.notes_text && (
                <p className="font-sans text-xs text-ink-soft mt-2 line-clamp-2">{benchmark.notes_text}</p>
              )}
            </div>
            <span className="font-mono text-[9px] text-state-none-ink uppercase tracking-widest shrink-0 mt-0.5">
              {benchmark ? 'SET' : 'EMPTY'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push('/profile/plan')}
          className="w-full text-left rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-ink">Plan</p>
              <p className="font-sans text-sm text-ink-soft leading-snug mt-0.5">
                Review or edit your commitments intentionally. Plan changes should be conscious, not daily tweaks.
              </p>
              <p className="font-sans text-xs text-ink-soft mt-2">
                {commitments.length} commitments - {requiredCount} required
              </p>
            </div>
            <span className="font-mono text-[9px] text-state-none-ink uppercase tracking-widest shrink-0 mt-0.5">
              ACTIVE
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push('/profile/personal')}
          className="w-full text-left rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-ink">About You</p>
              <p className="font-sans text-sm text-ink-soft leading-snug mt-0.5">
                Add your full name, birthday, goals, bio, and optional contact preferences.
              </p>
            </div>
            <span className="font-mono text-[9px] text-state-none-ink uppercase tracking-widest shrink-0 mt-0.5">
              OPEN
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push('/profile/reports')}
          className="w-full text-left rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-semibold text-ink">Reports</p>
              <p className="font-sans text-sm text-ink-soft leading-snug mt-0.5">
                Open your reporting tools for gallery, trends, and export options.
              </p>
              <p className="font-sans text-xs text-ink-soft mt-2">
                {hasPhotoCommitment ? 'Photo-ready' : 'Add photo commitment for gallery'}
              </p>
            </div>
            <span className="font-mono text-[9px] text-state-none-ink uppercase tracking-widest shrink-0 mt-0.5">
              OPEN
            </span>
          </div>
        </button>

        <section className="border-t border-border pt-4 flex flex-col gap-2">
          <Btn
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-center px-0"
          >
            Sign Out
          </Btn>
        </section>
      </div>

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}

