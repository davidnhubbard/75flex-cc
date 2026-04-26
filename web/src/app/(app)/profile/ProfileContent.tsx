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
  createCommitments, updateHydrationGoal,
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
  const [planEditMode,   setPlanEditMode]   = useState(false)
  const [planSnapshot,   setPlanSnapshot]   = useState<Commitment[]>([])
  const [planSaving,     setPlanSaving]     = useState(false)
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

  function enterEditMode() {
    setPlanSnapshot(commitments.map(c => ({ ...c })))
    setPlanEditMode(true)
  }

  function cancelEditMode() {
    setCommitments([...planSnapshot])
    setEditing(null)
    setShowAddCommit(false)
    setPlanEditMode(false)
    setPlanSnapshot([])
  }

  async function savePlan() {
    if (!challengeId) return
    setPlanSaving(true)
    try {
      const snapshotMap = Object.fromEntries(planSnapshot.map(c => [c.id, c]))

      // Removals: in snapshot but gone from current
      const removedIds = planSnapshot
        .map(c => c.id)
        .filter(id => !commitments.find(c => c.id === id))
      await Promise.all(removedIds.map(id =>
        supabase.from('commitments').delete().eq('id', id)
      ))

      // Edits: present in both but changed
      const edited = commitments.filter(c => {
        const orig = snapshotMap[c.id]
        return orig && (
          orig.definition !== c.definition ||
          orig.required !== c.required ||
          orig.target_value !== c.target_value ||
          orig.target_unit !== c.target_unit
        )
      })
      await Promise.all(edited.map(async c => {
        const orig = snapshotMap[c.id]
        if (c.category === 'hydration' && (orig.target_value !== c.target_value || orig.target_unit !== c.target_unit)) {
          await updateHydrationGoal(supabase, c.id, c.target_value!, c.target_unit as 'oz' | 'ml')
        } else {
          if (orig.definition !== c.definition) {
            await updateCommitmentDefinition(supabase, c.id, c.definition ?? '', dayNumber)
          }
          if (c.category === 'photo' && orig.required !== c.required) {
            await updateCommitmentRequired(supabase, c.id, c.required)
          }
        }
      }))

      // Adds: temp IDs written during edit mode
      const added = commitments.filter(c => c.id.startsWith('new-'))
      if (added.length > 0) {
        await createCommitments(supabase, challengeId, added.map((c, i) => ({
          category:    c.category,
          name:        c.name,
          definition:  c.definition ?? '',
          required:    c.required,
          sortOrder:   planSnapshot.length - removedIds.length + i,
          targetValue: c.target_value ?? undefined,
          targetUnit:  (c.target_unit as 'oz' | 'ml' | null) ?? undefined,
        })))
        const updated = await getCommitments(supabase, challengeId)
        setCommitments(updated)
      }

      setPlanEditMode(false)
      setPlanSnapshot([])
    } catch {
      showToast("Couldn't save — check your connection")
    } finally {
      setPlanSaving(false)
    }
  }

  async function handleAddCommitment(categoryId: string, definition: string, required: boolean, targetValue?: number, targetUnit?: 'oz' | 'ml') {
    const { CATEGORIES } = await import('@/lib/categories')
    const cat = CATEGORIES.find(c => c.id === categoryId)!
    const temp: Commitment = {
      id:           `new-${Date.now()}`,
      challenge_id: challengeId ?? '',
      category:     categoryId,
      name:         cat.defaultName,
      definition,
      sort_order:   commitments.length,
      required,
      active_from:  dayNumber,
      target_value: targetValue ?? null,
      target_unit:  targetUnit ?? null,
      created_at:   new Date().toISOString(),
    }
    setCommitments(prev => [...prev, temp])
    setShowAddCommit(false)
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

  function handleSave(id: string, definition: string, required: boolean, targetValue?: number, targetUnit?: 'oz' | 'ml') {
    setCommitments(prev => prev.map(c =>
      c.id === id
        ? { ...c, definition, required, target_value: targetValue ?? c.target_value, target_unit: targetUnit ?? c.target_unit }
        : c
    ))
    setEditing(null)
  }

  function handleRemove(id: string) {
    setCommitments(prev => prev.filter(c => c.id !== id))
    setEditing(null)
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
          <div className="flex items-center justify-between mb-2">
            <Eyebrow>{planEditMode ? 'Editing plan' : 'My plan'}</Eyebrow>
            {!planEditMode && (
              <button
                onClick={enterEditMode}
                className="font-sans text-xs text-ink-faint"
              >
                Edit
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {commitments.map(c => (
              planEditMode ? (
                <button
                  key={c.id}
                  onClick={() => setEditing(c)}
                  className="w-full bg-card border-[1.5px] border-green-200 rounded-card px-4 py-3 flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{c.category}</p>
                    <p className="font-sans text-sm font-medium text-ink mt-0.5">{c.name}</p>
                    {c.category === 'hydration' && c.target_value ? (
                      <p className="font-sans text-[11px] text-ink-soft mt-0.5">Goal: {c.target_value} {c.target_unit ?? 'oz'}</p>
                    ) : c.definition ? (
                      <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug">{c.definition}</p>
                    ) : null}
                  </div>
                  <span className="text-ink-faint ml-3 shrink-0">›</span>
                </button>
              ) : (
                <div
                  key={c.id}
                  className="w-full bg-card border-[1.5px] border-border rounded-card px-4 py-3"
                >
                  <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{c.category}</p>
                  <p className="font-sans text-sm font-medium text-ink mt-0.5">{c.name}</p>
                  {c.category === 'hydration' && c.target_value ? (
                    <p className="font-sans text-[11px] text-ink-soft mt-0.5">Goal: {c.target_value} {c.target_unit ?? 'oz'}</p>
                  ) : c.definition ? (
                    <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug">{c.definition}</p>
                  ) : null}
                </div>
              )
            ))}

            {planEditMode && (
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
            )}

            {planEditMode && (
              <div className="flex flex-col gap-2 pt-1">
                <Btn variant="dark" onClick={savePlan} disabled={planSaving}>
                  {planSaving ? 'Saving…' : 'Save plan'}
                </Btn>
                <Btn variant="ghost" onClick={cancelEditMode} disabled={planSaving}>
                  Cancel
                </Btn>
              </div>
            )}
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
