'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommitmentCard from '@/components/CommitmentCard'
import CompleteAllSheet from '@/components/CompleteAllSheet'
import PageHeader from '@/components/PageHeader'
import { createClient } from '@/lib/supabase'
import {
  getActiveChallenge, getCommitments, getOrCreateDailyLog,
  getCommitmentLogs, saveCommitmentLog, recalcOverallState,
  calcDayNumber, todayISO,
} from '@/lib/queries'
import type { Database, DayState } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row']
type Tab = 'today' | 'yesterday' | 'daybefore'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function TodayContent() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,         setLoading]        = useState(true)
  const [dayNumber,       setDayNumber]      = useState(1)
  const [commitments,     setCommitments]    = useState<Commitment[]>([])
  const [dailyLogId,      setDailyLogId]     = useState<string | null>(null)
  const [states,          setStates]         = useState<Record<string, DayState>>({})
  const [tab,             setTab]            = useState<Tab>('today')
  const [showCompleteAll, setShowCompleteAll] = useState(false)
  const [noteOpen,        setNoteOpen]       = useState(false)
  const [note,            setNote]           = useState('')
  const [greet,           setGreet]          = useState('Good morning')

  useEffect(() => { setGreet(greeting()) }, [])
  useEffect(() => { load() }, [])

  async function load() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    const day   = calcDayNumber(challenge.start_date)
    const today = todayISO()
    const [comms, dailyLog] = await Promise.all([
      getCommitments(supabase, challenge.id),
      getOrCreateDailyLog(supabase, challenge.id, day, today),
    ])
    const logs = await getCommitmentLogs(supabase, dailyLog.id)

    const stateMap: Record<string, DayState> = {}
    for (const c of comms) {
      stateMap[c.id] = (logs.find(l => l.commitment_id === c.id)?.state as DayState) ?? 'none'
    }

    setDayNumber(day)
    setCommitments(comms)
    setDailyLogId(dailyLog.id)
    setStates(stateMap)
    setLoading(false)
  }

  async function updateState(commitmentId: string, next: DayState) {
    if (!dailyLogId) return
    setStates(prev => ({ ...prev, [commitmentId]: next }))
    await saveCommitmentLog(supabase, dailyLogId, commitmentId, next)
    const allStates = commitments.map(c => c.id === commitmentId ? next : (states[c.id] ?? 'none'))
    await recalcOverallState(supabase, dailyLogId, allStates)
  }

  async function handleCompleteAll() {
    if (!dailyLogId) return
    setStates(Object.fromEntries(commitments.map(c => [c.id, 'complete' as DayState])))
    await Promise.all(commitments.map(c => saveCommitmentLog(supabase, dailyLogId, c.id, 'complete')))
    await recalcOverallState(supabase, dailyLogId, commitments.map(() => 'complete'))
    setShowCompleteAll(false)
  }

  const progress = Math.round((dayNumber / 75) * 100)
  const allDone  = commitments.length > 0 && Object.values(states).every(s => s === 'complete')
  const tabs: Tab[] = dayNumber === 1 ? [] : dayNumber === 2
    ? ['today', 'yesterday']
    : ['today', 'yesterday', 'daybefore']
  const tabLabel = (t: Tab) =>
    t === 'today' ? 'Today' : t === 'yesterday' ? 'Yesterday' : 'Day before'

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
      <PageHeader eyebrow={`Day ${dayNumber} of 75`}>
        <h1 className="font-display text-[22px] font-bold text-surface">{greet}</h1>
        <div className="mt-4 bg-green-900 rounded-full h-[3px]">
          <div className="bg-citrus h-[3px] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-mono text-[9px] text-green-400 mt-1">{progress}% complete</p>
      </PageHeader>

      {tabs.length > 0 && (
        <div className="flex border-b border-border bg-surface">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 font-sans text-xs font-medium transition-colors ${
                tab === t ? 'text-ink border-b-2 border-green-700' : 'text-ink-faint'
              }`}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {commitments.map(c => (
          <CommitmentCard
            key={c.id}
            category={c.category}
            name={c.name}
            definition={c.definition}
            state={states[c.id] ?? 'none'}
            onChange={next => updateState(c.id, next)}
          />
        ))}
        {noteOpen && (
          <textarea
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note about today…"
            rows={3}
            className="w-full bg-green-50 border-[1.5px] border-green-200 focus:border-green-600 rounded-xl px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none resize-none"
          />
        )}
      </div>

      <div className="sticky bottom-0 bg-surface border-t border-border px-4 py-3 flex gap-3">
        <button
          onClick={() => setNoteOpen(o => !o)}
          className="flex-1 py-2.5 rounded-xl border-[1.5px] border-green-700 text-green-700 font-sans text-sm font-medium"
        >
          {noteOpen ? 'Hide note' : 'Add note'}
        </button>
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
      </div>

      {showCompleteAll && (
        <CompleteAllSheet
          dayNumber={dayNumber}
          onConfirm={handleCompleteAll}
          onCancel={() => setShowCompleteAll(false)}
        />
      )}
    </div>
  )
}
