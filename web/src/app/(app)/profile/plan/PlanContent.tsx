'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import EditCommitmentSheet from '@/components/EditCommitmentSheet'
import AddCommitmentSheet from '@/components/AddCommitmentSheet'
import RestartSheet from '@/components/RestartSheet'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import {
  calcDayNumber,
  createCommitments,
  archiveChallenge,
  getActiveChallenge,
  getCommitments,
  updateCommitmentDefinition,
  updateCommitmentRequired,
  updateHydrationGoal,
} from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row']

const FREE_TIER_MAX = 4

export default function PlanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [dayNumber, setDayNumber] = useState(1)
  const [todayLogged, setTodayLogged] = useState(false)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [editing, setEditing] = useState<Commitment | null>(null)

  const [showAddCommit, setShowAddCommit] = useState(false)
  const [addInitialCategory, setAddInitialCategory] = useState<string | undefined>(undefined)
  const [planEditMode, setPlanEditMode] = useState(false)
  const [planSnapshot, setPlanSnapshot] = useState<Commitment[]>([])
  const [planSaving, setPlanSaving] = useState(false)
  const [showRestart, setShowRestart] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const { toastMessage, showToast, clearToast } = useToast()

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (loading) return
    const addParam = searchParams.get('add')
    if (addParam !== 'photo') return
    const hasPhotoCommitment = commitments.some(c => c.category === 'photo')
    if (hasPhotoCommitment) return
    openAddCommitment('photo')
    router.replace('/profile/plan')
  }, [loading, searchParams, commitments])

  useEffect(() => {
    if (loading) return
    const enforce = searchParams.get('enforce')
    if (enforce !== 'min2') return
    showToast('Add at least 2 non-photo commitments to continue')
    router.replace('/profile/plan')
  }, [loading, searchParams])

  async function load() {
    try {
      const challenge = await getActiveChallenge(supabase)
      if (!challenge) {
        router.push('/onboarding')
        return
      }

      const day = calcDayNumber(challenge.start_date)
      const comms = await getCommitments(supabase, challenge.id)

      const today = new Date().toISOString().split('T')[0]
      const { data: log } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('log_date', today)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setChallengeId(challenge.id)
      setDayNumber(day)
      setCommitments(comms)
      setTodayLogged(!!log)
    } catch {
      showToast('Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  function enterEditMode() {
    setPlanSnapshot(commitments.map(c => ({ ...c })))
    setPlanEditMode(true)
  }

  function openAddCommitment(initialCategory?: string) {
    if (commitments.length >= FREE_TIER_MAX) {
      showToast('Free tier supports up to 4 commitments')
      return
    }
    if (!planEditMode) enterEditMode()
    setAddInitialCategory(initialCategory)
    setShowAddCommit(true)
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

      const removedIds = planSnapshot
        .map(c => c.id)
        .filter(id => !commitments.find(c => c.id === id))
      await Promise.all(removedIds.map(id =>
        supabase.from('commitments').delete().eq('id', id)
      ))

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
        if (!orig) return

        if (c.category === 'hydration' && (orig.target_value !== c.target_value || orig.target_unit !== c.target_unit)) {
          await updateHydrationGoal(supabase, c.id, c.target_value!, c.target_unit as 'oz' | 'ml')
          return
        }

        if (orig.definition !== c.definition) {
          await updateCommitmentDefinition(supabase, c.id, c.definition ?? '', dayNumber)
        }
        if (c.category === 'photo' && orig.required !== c.required) {
          await updateCommitmentRequired(supabase, c.id, c.required)
        }
      }))

      const added = commitments.filter(c => c.id.startsWith('new-'))
      if (added.length > 0) {
        await createCommitments(supabase, challengeId, added.map((c, i) => ({
          category: c.category,
          name: c.name,
          definition: c.definition ?? '',
          required: c.required,
          sortOrder: planSnapshot.length - removedIds.length + i,
          targetValue: c.target_value ?? undefined,
          targetUnit: (c.target_unit as 'oz' | 'ml' | null) ?? undefined,
        })))
        const updated = await getCommitments(supabase, challengeId)
        setCommitments(updated)
      }

      setPlanEditMode(false)
      setPlanSnapshot([])
    } catch {
      showToast("Couldn't save - check your connection")
    } finally {
      setPlanSaving(false)
    }
  }

  async function handleAddCommitment(categoryId: string, definition: string, required: boolean, targetValue?: number, targetUnit?: 'oz' | 'ml') {
    const { CATEGORIES } = await import('@/lib/categories')
    const cat = CATEGORIES.find(c => c.id === categoryId)
    if (!cat) return

    const temp: Commitment = {
      id: `new-${Date.now()}`,
      challenge_id: challengeId ?? '',
      category: categoryId,
      name: cat.defaultName,
      definition,
      sort_order: commitments.length,
      required,
      active_from: dayNumber,
      target_value: targetValue ?? null,
      target_unit: targetUnit ?? null,
      created_at: new Date().toISOString(),
    }
    setCommitments(prev => [...prev, temp])
    setShowAddCommit(false)
    setAddInitialCategory(undefined)
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
      showToast("Couldn't restart - check your connection")
    }
  }

  const atCap = commitments.length >= FREE_TIER_MAX
  const hasPhotoCommitment = commitments.some(c => c.category === 'photo')

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-28 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Plan" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <p className="font-sans text-sm text-ink-soft leading-snug">
          Your plan should be stable. Edit intentionally when your routine genuinely changes.
        </p>

        {!planEditMode && (
          <Btn variant="dark" onClick={enterEditMode}>Edit Plan</Btn>
        )}

        <div className="flex flex-col gap-2">
          {commitments.map(c => (
            planEditMode ? (
              <button
                key={c.id}
                type="button"
                onClick={() => setEditing(c)}
                className="w-full bg-state-none-bg border-[1.5px] border-state-none rounded-card px-4 py-3 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="font-sans text-sm font-medium text-ink">{c.name}</p>
                  {c.category === 'photo' ? (
                    <p className="font-sans text-sm text-ink-soft mt-0.5">{c.required ? 'Required' : 'Optional'}</p>
                  ) : c.category === 'hydration' && c.target_value ? (
                    <p className="font-sans text-sm text-ink-soft mt-0.5">Goal: {c.target_value} {c.target_unit ?? 'oz'}</p>
                  ) : c.definition ? (
                    <p className="font-sans text-sm text-ink-soft mt-0.5 leading-snug">{c.definition}</p>
                  ) : null}
                </div>
                <span className="text-ink-faint ml-3 shrink-0">›</span>
              </button>
            ) : (
              <div
                key={c.id}
                className="w-full bg-state-none-bg border-[1.5px] border-state-none rounded-card px-4 py-3"
              >
                <p className="font-sans text-sm font-medium text-ink">{c.name}</p>
                {c.category === 'photo' ? (
                  <p className="font-sans text-sm text-ink-soft mt-0.5">{c.required ? 'Required' : 'Optional'}</p>
                ) : c.category === 'hydration' && c.target_value ? (
                  <p className="font-sans text-sm text-ink-soft mt-0.5">Goal: {c.target_value} {c.target_unit ?? 'oz'}</p>
                ) : c.definition ? (
                  <p className="font-sans text-sm text-ink-soft mt-0.5 leading-snug">{c.definition}</p>
                ) : null}
              </div>
            )
          ))}

          {planEditMode && (
            <Btn
              variant="outline"
              disabled={atCap}
              onClick={() => openAddCommitment()}
              className={`flex items-center justify-center gap-2 py-3 rounded-card border-[1.5px] border-dashed ${
                atCap ? 'border-border text-ink-faint' : ''
              }`}
            >
              {atCap ? 'Commitment Limit Reached' : '+ Add Commitment'}
            </Btn>
          )}

          {!hasPhotoCommitment && (
            <div className="rounded-card border-[1.5px] border-border bg-card px-4 py-3">
              <p className="font-sans text-sm font-medium text-ink mb-1">No Photo Commitment Yet</p>
              <p className="font-sans text-sm text-ink-soft leading-snug mb-2">
                Add a photo commitment to unlock progress photos and future gallery reporting.
              </p>
              <button
                type="button"
                onClick={() => openAddCommitment('photo')}
                className="font-sans text-xs text-green-700"
              >
                Add Photo Commitment
              </button>
            </div>
          )}

          {planEditMode && (
            <div className="flex flex-col gap-2 pt-1">
              <Btn variant="dark" onClick={savePlan} disabled={planSaving}>
                {planSaving ? 'Saving...' : 'Save Plan'}
              </Btn>
              <Btn variant="ghost" onClick={cancelEditMode} disabled={planSaving}>
                Cancel
              </Btn>
            </div>
          )}

          <Btn variant="outline" onClick={() => router.push('/profile')}>
            Back To Profile
          </Btn>
        </div>

        <section className="rounded-card border-[1.5px] border-red-200 bg-red-50 px-4 py-3">
          <p className="font-sans text-sm font-semibold text-red-700 mb-1">Danger Zone</p>
          <p className="font-sans text-sm text-red-700/80 leading-snug mb-3">
            If this is a meaningful plan reset, you can restart so your scoreboard reflects your new setup.
          </p>
          <Btn
            variant="ghost"
            onClick={() => setShowRestart(true)}
            className="w-full justify-center px-0 !text-red-600"
          >
            Restart Challenge From Day 1
          </Btn>
        </section>
      </div>

      {showAddCommit && (
        <AddCommitmentSheet
          usedCategoryIds={commitments.map(c => c.category)}
          initialCategoryId={addInitialCategory}
          onAdd={handleAddCommitment}
          onClose={() => {
            setShowAddCommit(false)
            setAddInitialCategory(undefined)
          }}
        />
      )}

      {editing && (
        <EditCommitmentSheet
          commitment={{
            ...editing,
            definition: editing.definition ?? '',
            targetValue: editing.target_value ?? undefined,
            targetUnit: (editing.target_unit as 'oz' | 'ml' | null) ?? undefined,
          }}
          totalCommitments={commitments.length}
          todayLogged={todayLogged}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={() => setEditing(null)}
        />
      )}

      {showRestart && (
        <RestartSheet
          onConfirm={handleRestart}
          onCancel={() => setShowRestart(false)}
          confirming={restarting}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}

