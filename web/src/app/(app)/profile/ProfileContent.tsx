'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EditCommitmentSheet from '@/components/EditCommitmentSheet'
import RestartSheet from '@/components/RestartSheet'
import BenchmarkSheet from '@/components/BenchmarkSheet'
import AddCommitmentSheet from '@/components/AddCommitmentSheet'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Eyebrow from '@/components/ui/Eyebrow'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import {
  getActiveChallenge, getCommitments, updateCommitmentDefinition, updateCommitmentRequired,
  archiveChallenge, calcDayNumber, getBenchmark, saveBenchmark, uploadBenchmarkPhoto,
  createCommitments,
} from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row'] & {
  changeLog?: { day: number; from: string; to: string }[]
}
type Benchmark = Database['public']['Tables']['benchmarks']['Row']

const FREE_TIER_MAX = 4

export default function ProfileContent() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,     setLoading]     = useState(true)
  const [dayNumber,   setDayNumber]   = useState(1)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [challengeId,    setChallengeId]    = useState<string | null>(null)
  const [userId,         setUserId]         = useState('')
  const [benchmark,      setBenchmark]      = useState<Benchmark | null>(null)
  const [editing,        setEditing]        = useState<Commitment | null>(null)
  const [todayLogged,    setTodayLogged]    = useState(false)
  const [showRestart,    setShowRestart]    = useState(false)
  const [restarting,     setRestarting]     = useState(false)
  const [showBenchmark,  setShowBenchmark]  = useState(false)
  const [showAddCommit,  setShowAddCommit]  = useState(false)
  const { toastMessage, showToast, clearToast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    const day   = calcDayNumber(challenge.start_date)
    const { data: { user } } = await supabase.auth.getUser()

    const [comms, bench] = await Promise.all([
      getCommitments(supabase, challenge.id),
      getBenchmark(supabase, challenge.id),
    ])

    // Check if today already has a log
    const today = new Date().toISOString().split('T')[0]
    const { data: log } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('log_date', today)
      .maybeSingle()

    setChallengeId(challenge.id)
    setUserId(user?.id ?? '')
    setDayNumber(day)
    setCommitments(comms)
    setBenchmark(bench)
    setTodayLogged(!!log)
    setLoading(false)
  }

  async function handleAddCommitment(categoryId: string, definition: string, required: boolean) {
    if (!challengeId) return
    const { CATEGORIES } = await import('@/lib/categories')
    const cat = CATEGORIES.find(c => c.id === categoryId)!
    try {
      await createCommitments(supabase, challengeId, [{
        category:   categoryId,
        name:       cat.defaultName,
        definition,
        sortOrder:  commitments.length,
        required,
      }])
      const updated = await getCommitments(supabase, challengeId)
      setCommitments(updated)
      setShowAddCommit(false)
    } catch {
      showToast("Couldn't add commitment — check your connection")
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
      showToast("Couldn't save benchmark — check your connection")
    }
  }

  async function handleSave(id: string, definition: string, required: boolean) {
    try {
      const commitment = commitments.find(c => c.id === id)
      await updateCommitmentDefinition(supabase, id, definition, dayNumber)
      if (commitment?.category === 'photo') {
        await updateCommitmentRequired(supabase, id, required)
      }
      setCommitments(prev => prev.map(c => c.id === id ? { ...c, definition, required } : c))
      setEditing(null)
    } catch {
      showToast("Couldn't save — check your connection")
    }
  }

  async function handleRemove(id: string) {
    try {
      const { error } = await supabase.from('commitments').delete().eq('id', id)
      if (error) throw new Error(error.message)
      setCommitments(prev => prev.filter(c => c.id !== id))
      setEditing(null)
    } catch {
      showToast("Couldn't remove — check your connection")
    }
  }

  async function handleRestart() {
    if (!challengeId) return
    setRestarting(true)
    try {
      await archiveChallenge(supabase, challengeId)
      router.push('/onboarding')
    } catch {
      setRestarting(false)
      setShowRestart(false)
      showToast("Couldn't restart — check your connection")
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const atCap = commitments.length >= FREE_TIER_MAX

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-24 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Profile" />

      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Benchmark */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <Eyebrow>Starting benchmark</Eyebrow>
            <button
              onClick={() => setShowBenchmark(true)}
              className="font-sans text-xs text-ink-faint"
            >
              {benchmark ? 'Edit' : '+ Add'}
            </button>
          </div>

          {benchmark ? (
            <button
              onClick={() => setShowBenchmark(true)}
              className="w-full text-left bg-card border-[1.5px] border-border rounded-card overflow-hidden"
            >
              {benchmark.photo_url && (
                <img
                  src={benchmark.photo_url}
                  alt="Starting benchmark"
                  className="w-full aspect-video object-cover"
                />
              )}
              <div className="px-4 py-3">
                {benchmark.notes_text ? (
                  <p className="font-sans text-sm text-ink leading-snug line-clamp-3">
                    {benchmark.notes_text}
                  </p>
                ) : (
                  <p className="font-sans text-xs text-ink-faint">No notes — tap to add</p>
                )}
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowBenchmark(true)}
              className="w-full bg-surface border-[1.5px] border-dashed border-border rounded-card px-4 py-5 flex flex-col items-center text-center gap-1"
            >
              <p className="font-sans text-sm font-medium text-ink">No starting benchmark</p>
              <p className="font-sans text-xs text-ink-soft">Add a photo and notes to remember where you started.</p>
            </button>
          )}
        </section>

        {/* My Plan */}
        <section>
          <Eyebrow className="mb-2">My plan</Eyebrow>
          <div className="flex flex-col gap-2">
            {commitments.map(c => (
              <button
                key={c.id}
                onClick={() => setEditing(c)}
                className="w-full bg-card border-[1.5px] border-border rounded-card px-4 py-3 flex items-center justify-between hover:border-green-400 transition-colors"
              >
                <div className="text-left">
                  <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{c.category}</p>
                  <p className="font-sans text-sm font-medium text-ink mt-0.5">{c.name}</p>
                  {c.definition && (
                    <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug">{c.definition}</p>
                  )}
                </div>
                <span className="text-ink-faint ml-3 shrink-0">›</span>
              </button>
            ))}

            <Btn
              variant="outline"
              disabled={atCap}
              onClick={() => !atCap && setShowAddCommit(true)}
              className={`flex items-center justify-center gap-2 py-3 rounded-card border-[1.5px] border-dashed ${
                atCap ? 'border-border text-ink-faint' : ''
              }`}
            >
              {atCap ? (
                <><span>Add commitment</span><span className="font-mono text-[9px] bg-ink-faint/10 text-ink-faint px-1.5 py-0.5 rounded">FREE</span></>
              ) : '+ Add commitment'}
            </Btn>
          </div>
        </section>

        <section className="border-t border-border pt-4 flex flex-col gap-1">
          <Btn
            variant="ghost"
            onClick={() => setShowRestart(true)}
            className="w-full justify-center px-0"
          >
            Restart challenge from Day 1
          </Btn>
          <Btn
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-center px-0"
          >
            Sign out
          </Btn>
        </section>
      </div>

      {showAddCommit && (
        <AddCommitmentSheet
          usedCategoryIds={commitments.map(c => c.category)}
          onAdd={handleAddCommitment}
          onClose={() => setShowAddCommit(false)}
        />
      )}

      {showBenchmark && (
        <BenchmarkSheet
          initialPhotoUrl={benchmark?.photo_url}
          initialNotes={benchmark?.notes_text}
          onSave={handleBenchmarkSave}
          onClose={() => setShowBenchmark(false)}
        />
      )}

      {showRestart && (
        <RestartSheet
          onConfirm={handleRestart}
          onCancel={() => setShowRestart(false)}
          confirming={restarting}
        />
      )}

      {editing && (
        <EditCommitmentSheet
          commitment={editing}
          totalCommitments={commitments.length}
          todayLogged={todayLogged}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={() => setEditing(null)}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}
