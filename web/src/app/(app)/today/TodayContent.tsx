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
import {
  getActiveChallenge, getCommitments, getOrCreateDailyLog,
  getCommitmentLogs, saveCommitmentLog, recalcOverallState,
  calcDayNumber, todayISO, dateForDay, getNote, saveNote,
  getAllDailyLogs, calcShowUpRate,
  uploadProgressPhoto, savePhotoUrl,
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
  note: string
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
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
  const [commitments,   setCommitments]  = useState<Commitment[]>([])
  const [greet,         setGreet]        = useState('Good morning')
  const [reengaged,     setReengaged]    = useState(false)
  const [showUpRate,    setShowUpRate]   = useState(0)
  const [daysLogged,    setDaysLogged]   = useState(0)
  const [challengeDone, setChallengeDone] = useState(false)  // C32: Day 76+

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState<Tab>('today')
  const [tabData,      setTabData]      = useState<Record<Tab, TabData>>({
    today:     { dayNumber: 1, logDate: '', dailyLogId: null, states: {}, photoUrls: {}, note: '' },
    yesterday: { dayNumber: 0, logDate: '', dailyLogId: null, states: {}, photoUrls: {}, note: '' },
    daybefore: { dayNumber: 0, logDate: '', dailyLogId: null, states: {}, photoUrls: {}, note: '' },
  })
  const [pendingStates,  setPending]    = useState<Record<string, DayState>>({})
  const [hasChanges,     setHasChanges] = useState(false)
  const [saving,         setSaving]     = useState(false)
  const [savedFlash,     setSavedFlash] = useState(false)

  // ── Sheets ────────────────────────────────────────────────────────────────
  const [noteOpen,     setNoteOpen]     = useState(false)
  const [cameraForId,  setCameraForId]  = useState<string | null>(null)

  const [uploadingPhotoId, setUploadingPhotoId] = useState<string | null>(null)
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
    const startD = new Date(challenge.start_date)
    startD.setHours(0, 0, 0, 0)
    const nowD = new Date()
    nowD.setHours(0, 0, 0, 0)
    const rawDiff = Math.floor((nowD.getTime() - startD.getTime()) / 86_400_000)
    const done = rawDiff >= 75  // C32: Day 76+

    const day   = Math.min(75, Math.max(1, rawDiff + 1))
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
    for (const c of comms) {
      const log = logs.find(l => l.commitment_id === c.id)
      stateMap[c.id] = (log?.state as DayState) ?? 'none'
      if (log?.photo_url) photoMap[c.id] = log.photo_url
    }

    const missedRecent = day > 3 && [day - 1, day - 2, day - 3].filter(d => d >= 1).every(d => {
      const log = allLogs.find(l => l.day_number === d)
      return !log || log.overall_state === 'none'
    })

    // C31: already complete on day 75 → celebration screen
    if (day === 75 && dailyLog.overall_state === 'complete' && !done) {
      router.push('/complete')
      return
    }

    setChallengeId(challenge.id)
    setUserId(user?.id ?? '')
    setStartDate(challenge.start_date)
    setCurrentDay(day)
    setCommitments(comms)
    setChallengeDone(done)
    setReengaged(!done && missedRecent)
    setShowUpRate(calcShowUpRate(allLogs, day))
    setDaysLogged(allLogs.filter(l => l.overall_state !== 'none').length)
    setTabData(prev => ({
      ...prev,
      today: { dayNumber: day, logDate: today, dailyLogId: dailyLog.id, states: stateMap, photoUrls: photoMap, note },
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
    for (const c of commitments) {
      const log = logs.find(l => l.commitment_id === c.id)
      stateMap[c.id] = (log?.state as DayState) ?? 'none'
      if (log?.photo_url) photoMap[c.id] = log.photo_url
    }

    setTabData(prev => ({
      ...prev,
      [t]: { dayNumber: dayNum, logDate, dailyLogId: dailyLog.id, states: stateMap, photoUrls: photoMap, note },
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
      if (overall === 'complete' && currentDay === 75) router.push('/complete')
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
      if (currentDay === 75) { router.push('/complete'); return }
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
      if (tab === 'today' && overall === 'complete' && currentDay === 75) router.push('/complete')
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
  const coreCommitments = commitments.filter(c => c.category !== 'photo' || c.required)
  const allDone  = coreCommitments.length > 0 && coreCommitments.every(c => liveStates[c.id] === 'complete')
  const progress = Math.round((currentDay / 75) * 100)
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
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-surface">75 days. Done.</h1>
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
      <PageHeader eyebrow={`Day ${currentDay} of 75`}>
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
            {[['Days logged', daysLogged], ['Show-up rate', `${showUpRate}%`], ['Days left', 75 - currentDay + 1]].map(([label, val]) => (
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
              className={`flex-1 py-2.5 font-sans text-xs font-medium transition-colors ${
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
              const isPhoto = c.category === 'photo'
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
                  onChange={next =>
                    isPhoto
                      ? handlePhotoCardTap(c.id, next)
                      : isToday ? updateToday(c.id, next) : stageBackdate(c.id, next)
                  }
                />
              )
            })}

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
