'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import CommitmentCard from '@/components/CommitmentCard'
import CameraSheet from '@/components/CameraSheet'
import LockedDayOverlay from '@/components/LockedDayOverlay'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Textarea from '@/components/ui/Textarea'
import StatCard from '@/components/ui/StatCard'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import { getDailyMessage } from '@/lib/messages'
import {
  getActiveChallenge, getCommitments, getOrCreateDailyLog,
  getCommitmentLogs, saveCommitmentLog, recalcOverallState,
  calcDayNumber, todayISO, dateForDay, getNote, saveNote,
  getAllDailyLogs, calcShowUpRate,
  uploadProgressPhoto, savePhotoUrl,
  addHydration, setHydration,
  saveReflection, type Reflection,
} from '@/lib/queries'
import type { Database, DayState } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row']
type Tab = 'today' | 'yesterday' | 'daybefore'

interface TabData {
  dayNumber: number
  logDate: string
  dailyLogId: string | null
  states: Record<string, DayState>
  photoUrls: Record<string, string>
  values: Record<string, number>   // numeric totals for hydration
  note: string
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const TAB_LABEL: Record<Tab, string> = {
  today:     'Today',
  yesterday: 'Yesterday',
  daybefore: 'Day before',
}

export default function TodayContent() {
  const router   = useRouter()
  const supabase = createClient()

  // ── Challenge / commitment context ────────────────────────────────────────
  const [loading,       setLoading]      = useState(true)
  const [challengeId,   setChallengeId]  = useState('')
  const [userId,        setUserId]       = useState('')
  const [startDate,     setStartDate]    = useState('')
  const [currentDay,    setCurrentDay]   = useState(1)
  const [durationDays,  setDurationDays] = useState(75)
  const [commitments,   setCommitments]  = useState<Commitment[]>([])
  const [greet,         setGreet]        = useState('Good morning')
  const [reengaged,     setReengaged]    = useState(false)
  const [showUpRate,    setShowUpRate]   = useState(0)
  const [daysLogged,    setDaysLogged]   = useState(0)
  const [challengeDone, setChallengeDone] = useState(false)  // C32: Day 76+

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState<Tab>('today')
  const [tabData,      setTabData]      = useState<Record<Tab, TabData>>({
    today:     { dayNumber: 1, logDate: '', dailyLogId: null, states: {}, photoUrls: {}, values: {}, note: '' },
    yesterday: { dayNumber: 0, logDate: '', dailyLogId: null, states: {}, photoUrls: {}, values: {}, note: '' },
    daybefore: { dayNumber: 0, logDate: '', dailyLogId: null, states: {}, photoUrls: {}, values: {}, note: '' },
  })
  const [pendingStates,  setPending]    = useState<Record<string, DayState>>({})
  const [hasChanges,     setHasChanges] = useState(false)
  const [saving,         setSaving]     = useState(false)
  const [savedFlash,     setSavedFlash] = useState(false)

  // ── Sheets ────────────────────────────────────────────────────────────────
  const [noteOpen,     setNoteOpen]     = useState(false)
  const [cameraForId,  setCameraForId]  = useState<string | null>(null)

  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null)
  const [reflection,       setReflection]       = useState<Reflection | null>(null)
  const { toastMessage, showToast, clearToast } = useToast()

  const loadedTabs = useRef<Set<Tab>>(new Set())
  const loadedDate = useRef('')

  useEffect(() => { setGreet(greeting()) }, [])
  useEffect(() => { init().catch((e: any) => showToast(e?.message ?? 'Failed to load')) }, [])

  // C27: day rollover — re-init when app comes back to foreground after midnight
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && loadedDate.current && todayISO() !== loadedDate.current) {
        loadedTabs.current.clear()
        init().catch((e: any) => showToast(e?.message ?? 'Failed to reload'))
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // ── Init: load challenge + today's data ───────────────────────────────────

  async function init() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    // Compute raw diff for C32 detection (uncapped, unlike calcDayNumber)
    const duration = challenge.duration_days ?? 75
    const startD = new Date(challenge.start_date)
    startD.setHours(0, 0, 0, 0)
    const nowD = new Date()
    nowD.setHours(0, 0, 0, 0)
    const rawDiff = Math.floor((nowD.getTime() - startD.getTime()) / 86_400_000)
    const done = rawDiff >= duration  // C32: challenge complete

    const day   = Math.min(duration, Math.max(1, rawDiff + 1))
    const today = todayISO()
    loadedDate.current = today

    const { data: { user } } = await supabase.auth.getUser()

    const [comms, dailyLog, allLogs] = await Promise.all([
      getCommitments(supabase, challenge.id),
      getOrCreateDailyLog(supabase, challenge.id, day, today),
      getAllDailyLogs(supabase, challenge.id),
    ])
    const [logs, note] = await Promise.all([
      getCommitmentLogs(supabase, dailyLog.id),
      getNote(supabase, dailyLog.id),
    ])

    const stateMap: Record<string, DayState> = {}
    const photoMap: Record<string, string> = {}
    const valuesMap: Record<string, number> = {}
    for (const c of comms) {
      const log = logs.find(l => l.commitment_id === c.id)
      stateMap[c.id] = (log?.state as DayState) ?? 'none'
      if (log?.photo_url) photoMap[c.id] = log.photo_url
      if (c.category === 'hydration' && log?.numeric_value != null) valuesMap[c.id] = log.numeric_value
    }

    const missedRecent = day > 3 && [day - 1, day - 2, day - 3].filter(d => d >= 1).every(d => {
      const log = allLogs.find(l => l.day_number === d)
      return !log || log.overall_state === 'none'
    })

    // C31: already complete on final day → celebration screen
    if (day === duration && dailyLog.overall_state === 'complete' && !done) {
      router.push('/complete')
      return
    }

    setChallengeId(challenge.id)
    setUserId(user?.id ?? '')
    setStartDate(challenge.start_date)
    setCurrentDay(day)
    setDurationDays(duration)
    setCommitments(comms)
    setChallengeDone(done)
    setReengaged(!done && missedRecent)
    setShowUpRate(calcShowUpRate(allLogs, day))
    setDaysLogged(allLogs.filter(l => l.overall_state !== 'none').length)
    setReflection((dailyLog.reflection as Reflection | null) ?? null)
    setTabData(prev => ({
      ...prev,
      today: { dayNumber: day, logDate: today, dailyLogId: dailyLog.id, states: stateMap, photoUrls: photoMap, values: valuesMap, note },
    }))
    loadedTabs.current.add('today')
    setLoading(false)
  }

  // ── Load a backdate tab on first visit ───────────────────────────────────

  async function loadBackdate(t: 'yesterday' | 'daybefore') {
    if (loadedTabs.current.has(t) || !challengeId || !startDate) return
    loadedTabs.current.add(t)

    const offset    = t === 'yesterday' ? 1 : 2
    const dayNum    = currentDay - offset
    if (dayNum < 1) return

    const logDate   = dateForDay(startDate, dayNum)
    const dailyLog  = await getOrCreateDailyLog(supabase, challengeId, dayNum, logDate)
    const [logs, note] = await Promise.all([
      getCommitmentLogs(supabase, dailyLog.id),
      getNote(supabase, dailyLog.id),
    ])

    const stateMap: Record<string, DayState> = {}
    const photoMap: Record<string, string> = {}
    const valuesMap: Record<string, number> = {}
    for (const c of commitments) {
      const log = logs.find(l => l.commitment_id === c.id)
      stateMap[c.id] = (log?.state as DayState) ?? 'none'
      if (log?.photo_url) photoMap[c.id] = log.photo_url
      if (c.category === 'hydration' && log?.numeric_value != null) valuesMap[c.id] = log.numeric_value
    }

    setTabData(prev => ({
      ...prev,
      [t]: { dayNumber: dayNum, logDate, dailyLogId: dailyLog.id, states: stateMap, photoUrls: photoMap, values: valuesMap, note },
    }))
  }

  async function switchTab(next: Tab) {
    if (tab !== 'today' && hasChanges) {
      setPending({})
      setHasChanges(false)
    }
    setNoteOpen(false)
    setTab(next)
    if (next !== 'today') {
      try {
        await loadBackdate(next)
      } catch (e: any) {
        showToast(e?.message ?? "Couldn't load that day")
      }
    }
  }

  // ── Today: instant-save on tap ────────────────────────────────────────────

  async function updateToday(commitmentId: string, next: DayState) {
    const { dailyLogId } = tabData.today
    if (!dailyLogId) return
    const prev = tabData.today.states[commitmentId]
    const newStates = { ...tabData.today.states, [commitmentId]: next }
    setTabData(p => ({ ...p, today: { ...p.today, states: newStates } }))
    try {
      await saveCommitmentLog(supabase, dailyLogId, commitmentId, next)
      const coreStates = commitments.filter(c => c.category !== 'photo' || c.required).map(c => newStates[c.id] ?? 'none')
      const overall    = await recalcOverallState(supabase, dailyLogId, coreStates)
      if (overall === 'complete' && currentDay === durationDays) router.push('/complete')
    } catch {
      setTabData(p => ({ ...p, today: { ...p.today, states: { ...p.today.states, [commitmentId]: prev } } }))
      showToast("Couldn't save — check your connection")
    }
  }

  // ── Backdate: stage changes, explicit Save ────────────────────────────────

  function stageBackdate(commitmentId: string, next: DayState) {
    setPending(prev => ({ ...prev, [commitmentId]: next }))
    setHasChanges(true)
  }

  async function saveBackdate() {
    const { dailyLogId, states, note } = tabData[tab]
    if (!dailyLogId || !hasChanges) return
    setSaving(true)
    const merged = { ...states, ...pendingStates }
    try {
      await Promise.all([
        ...Object.entries(pendingStates).map(([id, state]) =>
          saveCommitmentLog(supabase, dailyLogId, id, state)
        ),
        saveNote(supabase, dailyLogId, note),
      ])
      const coreComms = commitments.filter(c => c.category !== 'photo' || c.required)
      await recalcOverallState(supabase, dailyLogId, coreComms.map(c => merged[c.id] ?? 'none'))
      setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], states: merged } }))
      setPending({})
      setHasChanges(false)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    } catch {
      showToast("Couldn't save — check your connection")
    } finally {
      setSaving(false)
    }
  }

  // ── Complete All / Clear All ──────────────────────────────────────────────

  async function handleCompleteAll() {
    const nonPhotoComms = commitments.filter(c => c.category !== 'photo')
    if (tab === 'today') {
      const { dailyLogId } = tabData.today
      if (!dailyLogId) return
      const all = Object.fromEntries(nonPhotoComms.map(c => [c.id, 'complete' as DayState]))
      setTabData(prev => ({ ...prev, today: { ...prev.today, states: { ...prev.today.states, ...all } } }))
      await Promise.all(nonPhotoComms.map(c => saveCommitmentLog(supabase, dailyLogId, c.id, 'complete')))
      await recalcOverallState(supabase, dailyLogId, nonPhotoComms.map(() => 'complete'))
      if (currentDay === durationDays) { router.push('/complete'); return }
    } else {
      const all = Object.fromEntries(nonPhotoComms.map(c => [c.id, 'complete' as DayState]))
      setPending(prev => ({ ...prev, ...all }))
      setHasChanges(true)
    }
  }

  async function handleClearAll() {
    const nonPhotoComms = commitments.filter(c => c.category !== 'photo')
    const cleared = Object.fromEntries(nonPhotoComms.map(c => [c.id, 'none' as DayState]))
    if (tab === 'today') {
      const { dailyLogId } = tabData.today
      if (!dailyLogId) return
      setTabData(prev => ({ ...prev, today: { ...prev.today, states: { ...prev.today.states, ...cleared } } }))
      await Promise.all(nonPhotoComms.map(c => saveCommitmentLog(supabase, dailyLogId, c.id, 'none')))
      await recalcOverallState(supabase, dailyLogId, nonPhotoComms.map(() => 'none'))
    } else {
      setPending(prev => ({ ...prev, ...cleared }))
      setHasChanges(true)
    }
  }

  // ── Photo capture ─────────────────────────────────────────────────────────

  function handlePhotoCardTap(commitmentId: string, next: DayState) {
    if (next === 'complete') {
      setCameraForId(commitmentId)
    } else {
      handlePhotoRemove(commitmentId)
    }
  }

  async function handlePhotoRemove(commitmentId: string) {
    const { dailyLogId } = tabData[tab]
    if (!dailyLogId) return
    const newStates = { ...tabData[tab].states, [commitmentId]: 'none' as DayState }
    const newPhotos = { ...tabData[tab].photoUrls }
    delete newPhotos[commitmentId]
    setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], states: newStates, photoUrls: newPhotos } }))
    await saveCommitmentLog(supabase, dailyLogId, commitmentId, 'none')
    await savePhotoUrl(supabase, dailyLogId, commitmentId, null)
    const coreStates = commitments.filter(c => c.category !== 'photo' || c.required).map(c => newStates[c.id] ?? 'none')
    await recalcOverallState(supabase, dailyLogId, coreStates)
  }

  // ── Hydration ─────────────────────────────────────────────────────────────

  async function handleHydrationAdd(commitmentId: string, amount: number) {
    const { dailyLogId } = tabData.today
    if (!dailyLogId) return
    const c = commitments.find(c => c.id === commitmentId)
    if (!c?.target_value) return

    const prevValue = tabData.today.values[commitmentId] ?? 0
    const prevState = tabData.today.states[commitmentId] ?? 'none'
    const newValue  = prevValue + amount
    const newState: DayState = newValue >= c.target_value ? 'complete' : 'partial'

    setTabData(p => ({ ...p, today: { ...p.today,
      values: { ...p.today.values, [commitmentId]: newValue },
      states: { ...p.today.states, [commitmentId]: newState },
    }}))
    try {
      const { state } = await addHydration(supabase, dailyLogId, commitmentId, amount, c.target_value)
      const newStates = { ...tabData.today.states, [commitmentId]: state }
      const coreStates = commitments.filter(c => c.category !== 'photo' || c.required).map(c => newStates[c.id] ?? 'none')
      const overall = await recalcOverallState(supabase, dailyLogId, coreStates)
      if (overall === 'complete' && currentDay === durationDays) router.push('/complete')
    } catch {
      setTabData(p => ({ ...p, today: { ...p.today,
        values: { ...p.today.values, [commitmentId]: prevValue },
        states: { ...p.today.states, [commitmentId]: prevState },
      }}))
      showToast("Couldn't save — check your connection")
    }
  }

  async function handleHydrationSet(commitmentId: string, value: number) {
    const { dailyLogId } = tabData.today
    if (!dailyLogId) return
    const c = commitments.find(c => c.id === commitmentId)
    if (!c?.target_value) return

    const prevValue = tabData.today.values[commitmentId] ?? 0
    const prevState = tabData.today.states[commitmentId] ?? 'none'
    const newState: DayState = value >= c.target_value ? 'complete' : value > 0 ? 'partial' : 'none'

    setTabData(p => ({ ...p, today: { ...p.today,
      values: { ...p.today.values, [commitmentId]: value },
      states: { ...p.today.states, [commitmentId]: newState },
    }}))
    try {
      const { state } = await setHydration(supabase, dailyLogId, commitmentId, value, c.target_value)
      const newStates = { ...tabData.today.states, [commitmentId]: state }
      const coreStates = commitments.filter(c => c.category !== 'photo' || c.required).map(c => newStates[c.id] ?? 'none')
      const overall = await recalcOverallState(supabase, dailyLogId, coreStates)
      if (overall === 'complete' && currentDay === durationDays) router.push('/complete')
    } catch {
      setTabData(p => ({ ...p, today: { ...p.today,
        values: { ...p.today.values, [commitmentId]: prevValue },
        states: { ...p.today.states, [commitmentId]: prevState },
      }}))
      showToast("Couldn't save — check your connection")
    }
  }

  async function handleReflection(value: Reflection) {
    const { dailyLogId } = tabData.today
    if (!dailyLogId) return
    const next = reflection === value ? null : value   // tap again to deselect
    setReflection(next)
    try {
      await saveReflection(supabase, dailyLogId, next)
    } catch {
      setReflection(reflection)
      showToast("Couldn't save — check your connection")
    }
  }

  async function handleCameraCapture(file: File) {
    const commitmentId = cameraForId
    setCameraForId(null)
    if (!commitmentId || !userId || !challengeId) return

    const { dailyLogId, dayNumber } = tabData[tab]
    if (!dailyLogId) return

    setUploadingPhotoId(commitmentId)
    try {
      const url = await uploadProgressPhoto(supabase, userId, challengeId, dayNumber, file)
      await saveCommitmentLog(supabase, dailyLogId, commitmentId, 'complete')
      await savePhotoUrl(supabase, dailyLogId, commitmentId, url)

      const newStates = { ...tabData[tab].states, [commitmentId]: 'complete' as DayState }
      const newPhotos = { ...tabData[tab].photoUrls, [commitmentId]: url }
      setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], states: newStates, photoUrls: newPhotos } }))
      const coreStates = commitments.filter(c => c.category !== 'photo' || c.required).map(c => newStates[c.id] ?? 'none')
      const overall = await recalcOverallState(supabase, dailyLogId, coreStates)
      if (tab === 'today' && overall === 'complete' && currentDay === durationDays) router.push('/complete')
    } catch {
      showToast("Photo didn't upload — try again")
    } finally {
      setUploadingPhotoId(null)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const isToday       = tab === 'today'
  const activeData    = tabData[tab]
  const isLocked      = !isToday && activeData.dayNumber > 0 && activeData.dayNumber < currentDay - 2
  const liveStates    = isToday ? activeData.states : { ...activeData.states, ...pendingStates }
  const livePhotoUrls = activeData.photoUrls
  const liveValues    = activeData.values
  const coreCommitments = commitments.filter(c => c.category !== 'photo' || c.required)
  const allDone  = coreCommitments.length > 0 && coreCommitments.every(c => liveStates[c.id] === 'complete')
  const progress = Math.round((currentDay / durationDays) * 100)
  const tabs: Tab[] = challengeDone || currentDay === 1 ? [] : currentDay === 2
    ? ['today', 'yesterday']
    : ['today', 'yesterday', 'daybefore']

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-6 animate-pulse">
          <div className="h-3 w-20 bg-green-700 rounded mb-3" />
          <div className="h-7 w-40 bg-green-700 rounded" />
          <div className="mt-4 bg-green-900 rounded-full h-[3px]" />
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  // C32: post-challenge read-only state (Day 76+)
  if (challengeDone) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader eyebrow="Challenge complete">
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-surface">{durationDays} Days. Done.</h1>
          <div className="mt-4 bg-green-900 rounded-full h-[3px]">
            <div className="bg-heart h-[3px] rounded-full w-full" />
          </div>
          <p className="font-mono text-[9px] text-green-400 mt-1">100% complete</p>
        </PageHeader>

        <div className="flex-1 px-4 py-4 flex flex-col gap-3 opacity-40 pointer-events-none select-none">
          {commitments.map(c => (
            <CommitmentCard
              key={c.id}
              category={c.category}
              name={c.name}
              definition={c.definition}
              state={tabData.today.states[c.id] ?? 'none'}
              onChange={() => {}}
            />
          ))}
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-border px-4 py-3 flex flex-col gap-2">
          <Btn variant="dark" onClick={() => router.push('/complete')}>
            View your results
          </Btn>
          <Btn variant="outline" onClick={() => router.push('/profile')}>
            Start a new challenge
          </Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Header */}
      <PageHeader eyebrow={`Day ${currentDay} of ${durationDays}`}>
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-surface">{greet}</h1>
        <div className="mt-4 bg-green-900 rounded-full h-[3px]">
          <div className="bg-heart h-[3px] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-mono text-[9px] text-green-400 mt-1">{progress}% complete</p>
      </PageHeader>

      {/* Re-engagement card (C29, C30) */}
      {reengaged && (
        <div className="mx-4 mt-4 rounded-card border-[1.5px] border-green-600 bg-card p-4">
          <p className="font-mono text-[9px] text-heart uppercase tracking-widest mb-1">Welcome back</p>
          <p className="font-display text-[15px] font-bold text-ink leading-snug mb-3">
            You've logged {daysLogged} {daysLogged === 1 ? 'day' : 'days'}. Keep going or start fresh.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[['Days logged', daysLogged], ['Show-up rate', `${showUpRate}%`], ['Days left', durationDays - currentDay + 1]].map(([label, val]) => (
              <StatCard key={label as string} value={val} label={label as string} className="!bg-green-100 !border-green-200" />
            ))}
          </div>
          <p className="font-sans text-xs text-ink-soft leading-relaxed mb-3">
            Life got in the way — that happens. Jump back in today or restart the challenge from Day 1.
          </p>
          <div className="flex flex-col gap-2">
            <Btn variant="dark" onClick={() => setReengaged(false)}>Log today</Btn>
            <Btn variant="ghost" onClick={() => router.push('/profile')} className="text-center w-full">Restart from Day 1</Btn>
          </div>
        </div>
      )}

      {/* Tab row (C6) */}
      {tabs.length > 0 && (
        <div className="flex border-b border-border bg-surface">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 font-sans text-sm font-medium transition-colors ${
                tab === t ? 'text-ink border-b-2 border-green-700' : 'text-ink-faint'
              }`}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
      )}

      {/* Locked day (C15) */}
      {isLocked ? (
        <LockedDayOverlay
          dayNumber={activeData.dayNumber}
          logDate={activeData.logDate}
          onDismiss={() => switchTab('today')}
        />
      ) : (
        <>
          {/* Backdate context note (C26) — eyebrow header with separator */}
          {!isToday && activeData.dayNumber > 0 && (
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">
                Day {activeData.dayNumber} · {new Date(activeData.logDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          )}

          {/* Daily message (B28) — today only, not when re-engagement card is showing */}
          {isToday && !reengaged && commitments.length > 0 && (() => {
            const msg = getDailyMessage(currentDay, daysLogged)
            return (
              <>
                <div className="mx-4 mt-4 rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3 flex flex-col gap-3">
                  <div>
                    <p className="font-sans text-sm font-medium text-ink mb-1">Daily Inspiration</p>
                    <p className="font-sans text-sm text-ink-soft leading-snug">{msg.inspiration}</p>
                  </div>
                  <div className="h-px bg-state-none" />
                  <p className="font-sans text-sm text-ink-soft leading-snug">
                    <span className="font-semibold text-ink">Pro tip:</span> {msg.tip}
                  </p>
                </div>
                <div className="mx-4 mt-4 flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">Update your progress</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )
          })()}

          {/* Mark all complete / Clear all */}
          {commitments.length > 0 && (
            <div className={`px-4 flex justify-end ${isToday ? 'pt-3' : ''}`}>
              {allDone ? (
                <button onClick={handleClearAll} className="font-sans text-xs text-ink-faint">
                  Clear all →
                </button>
              ) : (
                <button onClick={handleCompleteAll} className="font-sans text-xs text-ink-faint">
                  Mark all complete →
                </button>
              )}
            </div>
          )}

          {/* Cards */}
          <div className="flex-1 px-4 py-4 flex flex-col gap-3">
            {commitments.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-2">
                <p className="font-sans text-sm font-medium text-ink">No commitments yet</p>
                <p className="font-sans text-xs text-ink-soft">Add at least one commitment in Profile to start tracking.</p>
              </div>
            )}
            {commitments.map(c => {
              const isPhoto     = c.category === 'photo'
              const isHydration = c.category === 'hydration' && !!c.target_value
              return (
                <CommitmentCard
                  key={c.id}
                  category={c.category}
                  name={c.name}
                  definition={c.definition}
                  required={c.required}
                  state={liveStates[c.id] ?? 'none'}
                  photoUrl={livePhotoUrls[c.id]}
                  uploading={uploadingPhotoId === c.id}
                  targetValue={isHydration ? c.target_value : undefined}
                  targetUnit={isHydration ? c.target_unit : undefined}
                  currentValue={isHydration ? (liveValues[c.id] ?? 0) : undefined}
                  onAddAmount={isHydration && isToday ? amt => handleHydrationAdd(c.id, amt) : undefined}
                  onSetValue={isHydration && isToday ? val => handleHydrationSet(c.id, val) : undefined}
                  onChange={next =>
                    isPhoto
                      ? handlePhotoCardTap(c.id, next)
                      : isToday ? updateToday(c.id, next) : stageBackdate(c.id, next)
                  }
                />
              )
            })}

            {/* End-of-day reflection (B31) — today only, once something is logged */}
            {isToday && Object.values(liveStates).some(s => s !== 'none') && (
              <div className="rounded-card border-[1.5px] border-state-none bg-state-none-bg px-4 py-3 flex flex-col gap-3">
                <p className="font-sans text-sm font-medium text-ink">How did today go?</p>
                <div className="flex flex-col gap-2">
                  {([
                    { value: 'felt_good',     emoji: '✦', label: 'Felt good' },
                    { value: 'tough_but_done', emoji: '💪', label: 'Tough, but done' },
                    { value: 'almost_quit',   emoji: '😤', label: 'Almost quit' },
                  ] as { value: Reflection; emoji: string; label: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleReflection(opt.value)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border-[1.5px] flex items-center gap-3 transition-colors ${
                        reflection === opt.value
                          ? 'bg-state-done-bg border-state-done'
                          : 'bg-surface border-border'
                      }`}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      <span className={`font-sans text-sm ${reflection === opt.value ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                        {opt.label}
                      </span>
                      {reflection === opt.value && (
                        <span className="ml-auto font-mono text-[9px] text-state-done-ink uppercase tracking-widest">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {noteOpen && (
              <Textarea
                variant="light"
                autoFocus
                value={activeData.note}
                onChange={e => {
                  setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], note: e.target.value } }))
                  if (!isToday) setHasChanges(true)
                }}
                onBlur={() => {
                  if (isToday && activeData.dailyLogId) saveNote(supabase, activeData.dailyLogId, activeData.note)
                }}
                placeholder="Add a note about this day…"
                rows={3}
              />
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-surface border-t border-border px-4 py-3 flex gap-2">
            <Btn
              variant="outline"
              onClick={() => setNoteOpen(o => !o)}
              className={`px-5 border-green-600 text-green-700 ${isToday ? 'flex-1' : ''}`}
            >
              {noteOpen ? 'Hide note' : 'Add note'}
            </Btn>

            {!isToday && (
              <Btn
                variant="dark"
                onClick={saveBackdate}
                disabled={!hasChanges || saving}
                className={`flex-1 ${
                  savedFlash            ? 'bg-green-100 text-green-700 border-[1.5px] border-green-200' :
                  !hasChanges || saving ? 'bg-border/50 text-ink-faint' :
                                          ''
                }`}
              >
                {savedFlash ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
              </Btn>
            )}
          </div>
        </>
      )}

      {cameraForId && (
        <CameraSheet
          onCapture={handleCameraCapture}
          onClose={() => setCameraForId(null)}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}
