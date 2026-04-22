'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { createClient } from '@/lib/supabase'
import {
  getActiveChallenge, getAllDailyLogs, calcDayNumber,
  calcStreak, calcShowUpRate,
} from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']
type DayState = 'complete' | 'partial' | 'none' | 'future' | 'today'

interface DayInfo {
  dayNumber: number
  date: Date
  state: DayState
  log: DailyLog | null
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CELL_STATE: Record<DayState, string> = {
  complete: 'bg-citrus',
  partial:  'bg-amber',
  none:     'bg-surface border-[1.5px] border-border',
  future:   'bg-border/40',
  today:    'bg-surface border-[1.5px] border-green-700 ring-1 ring-green-700',
}

const DOT_COLOR: Record<string, string> = {
  complete: 'bg-green-700',
  partial:  'bg-amber',
  none:     'bg-border',
}

export default function ProgressContent() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,      setLoading]      = useState(true)
  const [days,         setDays]         = useState<DayInfo[]>([])
  const [dayNumber,    setDayNumber]    = useState(1)
  const [streak,       setStreak]       = useState(0)
  const [showUpRate,   setShowUpRate]   = useState(0)
  const [startDay,     setStartDay]     = useState(0) // weekday index of Day 1 (0=Sun)
  const [selected,     setSelected]     = useState<DayInfo | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    const currentDay = calcDayNumber(challenge.start_date)
    const logs       = await getAllDailyLogs(supabase, challenge.id)
    const start      = new Date(challenge.start_date)

    const daysList: DayInfo[] = Array.from({ length: 75 }, (_, i) => {
      const n    = i + 1
      const date = addDays(start, i)
      const log  = logs.find(l => l.day_number === n) ?? null

      let state: DayState
      if (n > currentDay)       state = 'future'
      else if (n === currentDay) state = 'today'
      else if (!log || log.overall_state === 'none') state = 'none'
      else state = log.overall_state as 'complete' | 'partial'

      return { dayNumber: n, date, state, log }
    })

    setDays(daysList)
    setDayNumber(currentDay)
    setStreak(calcStreak(logs, currentDay))
    setShowUpRate(calcShowUpRate(logs, currentDay))
    setStartDay(new Date(challenge.start_date).getDay())
    setLoading(false)
  }

  function handleCellTap(day: DayInfo) {
    if (day.state === 'future') return
    if (day.state === 'today') { router.push('/today'); return }
    setSelected(prev => prev?.dayNumber === day.dayNumber ? null : day)
  }

  const daysLogged    = days.filter(d => d.log && d.state !== 'future').length
  const daysRemaining = Math.max(0, 75 - dayNumber)

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-28 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-6 grid grid-cols-7 gap-1.5">
          {Array.from({ length: 75 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-border/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Progress" />

      {/* Stats row */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        {/* Streak (C17) */}
        <div className={`rounded-card px-3 py-3 text-center ${streak > 0 ? 'bg-green-800' : 'bg-surface border-[1.5px] border-border'}`}>
          <p className={`font-display text-2xl font-black ${streak > 0 ? 'text-citrus' : 'text-ink-faint'}`}>
            {streak > 0 ? streak : '—'}
          </p>
          <p className={`font-mono text-[8px] uppercase tracking-widest mt-0.5 ${streak > 0 ? 'text-green-400' : 'text-ink-faint'}`}>
            {streak > 0 ? 'Day streak' : 'No streak yet'}
          </p>
          {streak === 0 && (
            <p className="font-sans text-[9px] text-ink-faint mt-0.5">Ready for a new one</p>
          )}
        </div>

        {/* Show-up rate (C18: hidden until Day 4) */}
        <div className="bg-surface border-[1.5px] border-border rounded-card px-3 py-3 text-center">
          <p className="font-display text-2xl font-black text-ink">
            {dayNumber >= 4 ? `${showUpRate}%` : '—'}
          </p>
          <p className="font-mono text-[8px] text-ink-faint uppercase tracking-widest mt-0.5">Show-up rate</p>
        </div>

        {/* Days remaining */}
        <div className="bg-surface border-[1.5px] border-border rounded-card px-3 py-3 text-center">
          <p className="font-display text-2xl font-black text-ink">{daysRemaining}</p>
          <p className="font-mono text-[8px] text-ink-faint uppercase tracking-widest mt-0.5">Days left</p>
        </div>
      </div>

      {/* Calendar (C19: Sunday-aligned grid) */}
      <div className="px-4 pb-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <p key={i} className="font-mono text-[8px] text-ink-faint text-center">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Blank leading cells (C19) */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}

          {days.map(day => (
            <button
              key={day.dayNumber}
              onClick={() => handleCellTap(day)}
              disabled={day.state === 'future'}
              className={`aspect-square rounded-lg flex items-center justify-center transition-transform active:scale-95 ${CELL_STATE[day.state]} ${day.state !== 'future' ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`font-mono text-[8px] ${
                day.state === 'complete' ? 'text-ink' :
                day.state === 'partial'  ? 'text-ink' :
                day.state === 'today'    ? 'text-green-700 font-bold' :
                day.state === 'future'   ? 'text-border' :
                'text-ink-faint'
              }`}>
                {day.dayNumber}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail bar (C16) */}
      {selected && (
        <div className="mx-4 mb-4 bg-surface border-[1.5px] border-border rounded-card px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${DOT_COLOR[selected.log?.overall_state ?? 'none']}`} />
            <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">
              Day {selected.dayNumber} · {formatDate(selected.date)}
            </p>
          </div>
          <p className="font-sans text-sm font-medium text-ink">
            {selected.log?.overall_state === 'complete' ? 'Full day — all commitments done' :
             selected.log?.overall_state === 'partial'  ? 'Partial day — some commitments done' :
             'Missed — nothing logged this day'}
          </p>
          {selected.log?.overall_state === 'none' && (
            <p className="font-sans text-xs text-ink-soft mt-0.5">
              Every day you show up counts. Keep going.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
