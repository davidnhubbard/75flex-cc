'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import CommitmentCard from '@/components/CommitmentCard'
import CompleteAllSheet from '@/components/CompleteAllSheet'
import LockedDayOverlay from '@/components/LockedDayOverlay'
import PageHeader from '@/components/PageHeader'
import { createClient } from '@/lib/supabase'
import {
  getActiveChallenge, getCommitments, getOrCreateDailyLog,
  getCommitmentLogs, saveCommitmentLog, recalcOverallState,
  calcDayNumber, todayISO, dateForDay, getNote, saveNote,
  getAllDailyLogs, calcShowUpRate,
} from '@/lib/queries'
import type { Database, DayState } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row']
type Tab = 'today' | 'yesterday' | 'daybefore'

interface TabData {
  dayNumber: number
  logDate: string
  dailyLogId: string | null
  states: Record<string, DayState>
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
  const [loading,      setLoading]     = useState(true)
  const [challengeId,  setChallengeId] = useState('')
  const [startDate,    setStartDate]   = useState('')
  const [currentDay,   setCurrentDay]  = useState(1)
  const [commitments,  setCommitments] = useState<Commitment[]>([])
  const [greet,        setGreet]       = useState('Good morning')
  const [reengaged,    setReengaged]   = useState(false)
  const [showUpRate,   setShowUpRate]  = useState(0)
  const [daysLogged,   setDaysLogged]  = useState(0)

  // ── Tab state ─────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState<Tab>('today')
  const [tabData,      setTabData]      = useState<Record<Tab, TabData>>({
    today:     { dayNumber: 1, logDate: '', dailyLogId: null, states: {}, note: '' },
    yesterday: { dayNumber: 0, logDate: '', dailyLogId: null, states: {}, note: '' },
    daybefore: { dayNumber: 0, logDate: '', dailyLogId: null, states: {}, note: '' },
  })
  const [pendingStates,  setPending]    = useState<Record<string, DayState>>({})
  const [hasChanges,     setHasChanges] = useState(false)
  const [saving,         setSaving]     = useState(false)
  const [savedFlash,     setSavedFlash] = useState(false)

  // ── Sheets ────────────────────────────────────────────────────────────────
  const [showCompleteAll, setShowCompleteAll] = useState(false)
  const [noteOpen,        setNoteOpen]        = useState(false)

  const loadedTabs = useRef<Set<Tab>>(new Set())

  useEffect(() => { setGreet(greeting()) }, [])
  useEffect(() => { init() }, [])

  // ── Init: load challenge + today's data ───────────────────────────────────

  async function init() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    const day      = calcDayNumber(challenge.start_date)
    const today    = todayISO()
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
    for (const c of comms) {
      stateMap[c.id] = (logs.find(l => l.commitment_id === c.id)?.state as DayState) ?? 'none'
    }

    const missedRecent = day > 3 && [day - 1, day - 2, day - 3].filter(d => d >= 1).every(d => {
      const log = allLogs.find(l => l.day_number === d)
      return !log || log.overall_state === 'none'
    })

    setChallengeId(challenge.id)
    setStartDate(challenge.start_date)
    setCurrentDay(day)
    setCommitments(comms)
    setReengaged(missedRecent)
    setShowUpRate(calcShowUpRate(allLogs, day))
    setDaysLogged(allLogs.filter(l => l.overall_state !== 'none').length)
    setTabData(prev => ({
      ...prev,
      today: { dayNumber: day, logDate: today, dailyLogId: dailyLog.id, states: stateMap, note },
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
    for (const c of commitments) {
      stateMap[c.id] = (logs.find(l => l.commitment_id === c.id)?.state as DayState) ?? 'none'
    }

    setTabData(prev => ({
      ...prev,
      [t]: { dayNumber: dayNum, logDate, dailyLogId: dailyLog.id, states: stateMap, note },
    }))
  }

  async function switchTab(next: Tab) {
    // Discard unsaved changes when switching away from a backdate tab
    if (tab !== 'today' && hasChanges) {
      setPending({})
      setHasChanges(false)
    }
    setNoteOpen(false)
    setTab(next)
    if (next !== 'today') await loadBackdate(next)
  }

  // ── Today: instant-save on tap ────────────────────────────────────────────

  async function updateToday(commitmentId: string, next: DayState) {
    const { dailyLogId } = tabData.today
    if (!dailyLogId) return
    setTabData(prev => ({
      ...prev,
      today: { ...prev.today, states: { ...prev.today.states, [commitmentId]: next } },
    }))
    await saveCommitmentLog(supabase, dailyLogId, commitmentId, next)
    const allStates = commitments.map(c =>
      c.id === commitmentId ? next : (tabData.today.states[c.id] ?? 'none')
    )
    await recalcOverallState(supabase, dailyLogId, allStates)
  }

  // ── Backdate: stage changes, explicit Save ────────────────────────────────

  function stageBackdate(commitmentId: string, next: DayState) {
    setPending(prev => ({ ...prev, [commitmentId]: next }))
    setHasChanges(true)
  }

  async function saveBackdate() {
    const { dailyLogId, states } = tabData[tab]
    if (!dailyLogId || !hasChanges) return
    setSaving(true)
    const merged = { ...states, ...pendingStates }
    await Promise.all(
      Object.entries(pendingStates).map(([id, state]) =>
        saveCommitmentLog(supabase, dailyLogId, id, state)
      )
    )
    await recalcOverallState(supabase, dailyLogId, commitments.map(c => merged[c.id] ?? 'none'))
    setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], states: merged } }))
    setPending({})
    setHasChanges(false)
    setSaving(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  // ── Complete All ──────────────────────────────────────────────────────────

  async function handleCompleteAll() {
    if (tab === 'today') {
      const { dailyLogId } = tabData.today
      if (!dailyLogId) return
      const all = Object.fromEntries(commitments.map(c => [c.id, 'complete' as DayState]))
      setTabData(prev => ({ ...prev, today: { ...prev.today, states: all } }))
      await Promise.all(commitments.map(c => saveCommitmentLog(supabase, dailyLogId, c.id, 'complete')))
      await recalcOverallState(supabase, dailyLogId, commitments.map(() => 'complete'))
    } else {
      const all = Object.fromEntries(commitments.map(c => [c.id, 'complete' as DayState]))
      setPending(all)
      setHasChanges(true)
    }
    setShowCompleteAll(false)
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const isToday    = tab === 'today'
  const isLocked   = !isToday && activeData.dayNumber > 0 && activeData.dayNumber < currentDay - 2
  const activeData = tabData[tab]
  const liveStates = isToday ? activeData.states : { ...activeData.states, ...pendingStates }
  const allDone    = commitments.length > 0 && commitments.every(c => liveStates[c.id] === 'complete')
  const progress   = Math.round((currentDay / 75) * 100)
  const tabs: Tab[] = currentDay === 1 ? [] : currentDay === 2
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

  return (
    <div className="flex flex-col min-h-full">

      {/* Header */}
      <PageHeader eyebrow={`Day ${currentDay} of 75`}>
        <h1 className="font-display text-[22px] font-bold text-surface">{greet}</h1>
        <div className="mt-4 bg-green-900 rounded-full h-[3px]">
          <div className="bg-citrus h-[3px] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-mono text-[9px] text-green-400 mt-1">{progress}% complete</p>
      </PageHeader>

      {/* Re-engagement card (C29, C30) */}
      {reengaged && (
        <div className="mx-4 mt-4 rounded-card border-[1.5px] border-green-700 bg-surface p-4">
          <p className="font-mono text-[9px] text-citrus uppercase tracking-widest mb-1">Still here</p>
          <p className="font-display text-[15px] font-bold text-ink leading-snug mb-3">
            You've logged {daysLogged} {daysLogged === 1 ? 'day' : 'days'}. That's real progress.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[['Days logged', daysLogged], ['Show-up rate', `${showUpRate}%`], ['Days left', 75 - currentDay + 1]].map(([label, val]) => (
              <div key={label as string} className="bg-green-50 rounded-xl p-2 text-center">
                <p className="font-display text-base font-bold text-ink">{val}</p>
                <p className="font-mono text-[8px] text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
          <p className="font-sans text-xs text-ink-soft leading-relaxed mb-3">
            Life got in the way — that happens. Log something today and keep going.
          </p>
          <button onClick={() => setReengaged(false)} className="w-full bg-green-800 text-citrus font-sans text-sm font-semibold py-2.5 rounded-xl">
            Log today
          </button>
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
          {/* Backdate context note (C26) */}
          {!isToday && activeData.dayNumber > 0 && (
            <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest px-4 pt-3">
              Day {activeData.dayNumber} · {new Date(activeData.logDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}

          {/* Cards */}
          <div className="flex-1 px-4 py-4 flex flex-col gap-3">
            {commitments.map(c => (
              <CommitmentCard
                key={c.id}
                category={c.category}
                name={c.name}
                definition={c.definition}
                state={liveStates[c.id] ?? 'none'}
                onChange={next => isToday ? updateToday(c.id, next) : stageBackdate(c.id, next)}
              />
            ))}

            {noteOpen && (
              <textarea
                autoFocus
                value={activeData.note}
                onChange={e => setTabData(prev => ({ ...prev, [tab]: { ...prev[tab], note: e.target.value } }))}
                onBlur={() => activeData.dailyLogId && saveNote(supabase, activeData.dailyLogId, activeData.note)}
                placeholder="Add a note about this day…"
                rows={3}
                className="w-full bg-green-50 border-[1.5px] border-green-200 focus:border-green-600 rounded-xl px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none resize-none"
              />
            )}
          </div>

          {/* Footer (C10: Complete All disabled on locked days) */}
          <div className="sticky bottom-0 bg-surface border-t border-border px-4 py-3 flex gap-2">
            <button
              onClick={() => setNoteOpen(o => !o)}
              className="flex-1 py-2.5 rounded-xl border-[1.5px] border-green-700 text-green-700 font-sans text-sm font-medium"
            >
              {noteOpen ? 'Hide note' : 'Add note'}
            </button>

            {isToday ? (
              <button
                onClick={() => !allDone && setShowCompleteAll(true)}
                disabled={allDone}
                className={`flex-1 py-2.5 rounded-xl font-sans text-sm font-semibold transition-colors ${
                  allDone
                    ? 'bg-green-100 text-green-700 border-[1.5px] border-green-200 cursor-default'
                    : 'bg-citrus text-ink'
                }`}
              >
                {allDone ? 'All done ✓' : 'Complete all'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => !allDone && setShowCompleteAll(true)}
                  disabled={allDone}
                  className={`py-2.5 px-3 rounded-xl font-sans text-sm font-medium border-[1.5px] transition-colors ${
                    allDone ? 'border-border text-ink-faint cursor-default' : 'border-green-700 text-green-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={saveBackdate}
                  disabled={!hasChanges || saving}
                  className={`flex-1 py-2.5 rounded-xl font-sans text-sm font-semibold transition-colors ${
                    savedFlash            ? 'bg-green-100 text-green-700 border-[1.5px] border-green-200' :
                    hasChanges && !saving ? 'bg-citrus text-ink' :
                                            'bg-border/50 text-ink-faint cursor-default'
                  }`}
                >
                  {savedFlash ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {showCompleteAll && (
        <CompleteAllSheet
          dayNumber={activeData.dayNumber}
          onConfirm={handleCompleteAll}
          onCancel={() => setShowCompleteAll(false)}
        />
      )}
    </div>
  )
}
