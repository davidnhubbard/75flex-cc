'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BenchmarkSheet from '@/components/BenchmarkSheet'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import { getActiveChallenge, getBenchmark, saveBenchmark, uploadBenchmarkPhoto } from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type Benchmark = Database['public']['Tables']['benchmarks']['Row']

export default function BenchmarkContent() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null)
  const [showBenchmark, setShowBenchmark] = useState(false)
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

      const { data: { user } } = await supabase.auth.getUser()
      const bench = await getBenchmark(supabase, challenge.id)

      setChallengeId(challenge.id)
      setUserId(user?.id ?? '')
      setBenchmark(bench)
    } catch {
      showToast('Failed to load benchmark')
    } finally {
      setLoading(false)
    }
  }

  async function handleBenchmarkSave(notes: string, file: File | null) {
    if (!challengeId) return
    try {
      let photoUrl = benchmark?.photo_url ?? null
      if (file) photoUrl = await uploadBenchmarkPhoto(supabase, userId, challengeId, file)
      await saveBenchmark(supabase, challengeId, { notesText: notes, photoUrl })
      setBenchmark(prev => prev
        ? { ...prev, notes_text: notes || null, photo_url: photoUrl }
        : { id: '', challenge_id: challengeId, notes_text: notes || null, photo_url: photoUrl, created_at: '' }
      )
      setShowBenchmark(false)
    } catch {
      showToast("Couldn't save benchmark - check your connection")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-32 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Benchmark" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <p className="font-sans text-sm text-ink-soft leading-snug">
          Create your baseline snapshot. Add one photo and a short note describing where you are right now.
        </p>

        {benchmark ? (
          <button
            type="button"
            onClick={() => setShowBenchmark(true)}
            className="w-full text-left rounded-card border-[1.5px] border-state-none bg-state-none-bg p-3"
          >
            <div className="flex items-start gap-3">
              {benchmark.photo_url ? (
                <img
                  src={benchmark.photo_url}
                  alt="Starting benchmark"
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg border-[1.5px] border-dashed border-state-none bg-card flex items-center justify-center shrink-0">
                  <span className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">No Photo</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold text-ink">Current Benchmark</p>
                <p className="font-sans text-sm text-ink-soft mt-1 line-clamp-2">
                  {benchmark.notes_text || 'No notes yet - tap to add context.'}
                </p>
                <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mt-2">Tap To Edit</p>
              </div>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowBenchmark(true)}
            className="w-full rounded-card border-[1.5px] border-dashed border-state-none bg-state-none-bg px-4 py-6 text-center"
          >
            <p className="font-sans text-sm font-semibold text-ink">No Benchmark Yet</p>
            <p className="font-sans text-sm text-ink-soft mt-1">Add your starting photo and note so future progress has context.</p>
          </button>
        )}

        <div className="rounded-card border-[1.5px] border-border bg-card px-4 py-3">
          <p className="font-sans text-sm font-medium text-ink mb-1">What to include</p>
          <p className="font-sans text-sm text-ink-soft leading-snug">Use a consistent photo angle and short honest note. Keep it simple and repeatable.</p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Btn variant="dark" onClick={() => setShowBenchmark(true)}>
            {benchmark ? 'Edit Benchmark' : 'Create Benchmark'}
          </Btn>
          <Btn variant="outline" onClick={() => router.push('/profile')}>
            Back To Profile
          </Btn>
        </div>
      </div>

      {showBenchmark && (
        <BenchmarkSheet
          initialPhotoUrl={benchmark?.photo_url}
          initialNotes={benchmark?.notes_text}
          onSave={handleBenchmarkSave}
          onClose={() => setShowBenchmark(false)}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}

