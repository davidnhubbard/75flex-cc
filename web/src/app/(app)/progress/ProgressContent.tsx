'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/ui/StatCard'
import DayDetailSheet from '@/components/DayDetailSheet'
import { createClient } from '@/lib/supabase'
import {
  getActiveChallenge, getAllDailyLogs, calcDayNumber,
  calcStreak, calcShowUpRate, getCommitments, getCommitmentLogs, getNote,
} from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type DailyLog      = Database['public']['Tables']['daily_logs']['Row']
type Commitment    = Database['public']['Tables']['commitments']['Row']
type CommitmentLog = Database['public']['Tables']['commitment_logs']['Row']
type DayState      = 'complete' | 'partial' | 'none' | 'future' | 'today'

interface DayInfo {
  dayNumber: number
  date:      Date
  state:     DayState
  log:       DailyLog | null
}

interface DetailData {
  logs: CommitmentLog[]
  note: string
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
  complete: 'bg-heart',
  partial:  'bg-heart-soft',
  none:     'bg-card border-[1.5px] border-border',
  future:   'bg-border/40',
  today:    'bg-card border-[1.5px] border-green-700 ring-1 ring-green-700',
}

export default function ProgressContent() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,       setLoading]       = useState(true)
  const [days,          setDays]          = useState<DayInfo[]>([])
  const [dayNumber,     setDayNumber]     = useState(1)
  const [durationDays,  setDurationDays]  = useState(75)
  const [streak,        setStreak]        = useState(0)
  const [showUpRate,    setShowUpRate]    = useState(0)
  const [startDay,      setStartDay]      = useState(0)
  const [commitments,   setCommitments]   = useState<Commitment[]>([])
  const [selected,      setSelected]      = useState<DayInfo | null>(null)
  const [detailData,    setDetailData]    = useState<DetailData | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    const duration   = challenge.duration_days ?? 75
    const currentDay = calcDayNumber(challenge.start_date, duration)
    const start      = new Date(challenge.start_date)

    const [logs, comms] = await Promise.all([
      getAllDailyLogs(supabase, challenge.id),
      getCommitments(supabase, challenge.id),
    ])

    const daysList: DayInfo[] = Array.from({ length: duration }, (_, i) => {
      const n    = i + 1
      const date = addDays(start, i)
      const log  = logs.find(l => l.day_number === n) ?? null

      let state: DayState
      if (n > currentDay)        state = 'future'
      else if (n === currentDay) state = 'today'
      else if (!log || log.overall_state === 'none') state = 'none'
      else state = log.overall_state as 'complete' | 'partial'

      return { dayNumber: n, date, state, log }
    })

    setDays(daysList)
    setDayNumber(currentDay)
    setDurationDays(duration)
    setCommitments(comms)
    setStreak(calcStreak(logs, currentDay))
    setShowUpRate(calcShowUpRate(logs, currentDay))
    setStartDay(new Date(challenge.start_date).getDay())
    setLoading(false)
  }

  async function handleCellTap(day: DayInfo) {
    if (day.state === 'future') return
    if (day.state === 'today') { router.push('/today'); return }

    // Toggle off
    if (selected?.dayNumber === day.dayNumber) {
      setSelected(null)
      setDetailData(null)
      return
    }

    setSelected(day)
    setDetailData(null)
    setLoadingDetail(true)

    const logId = day.log?.id
    if (logId) {
      const [logs, note] = await Promise.all([
        getCommitmentLogs(supabase, logId),
        getNote(supabase, logId),
      ])
      setDetailData({ logs, note })
    } else {
      setDetailData({ logs: [], note: '' })
    }
    setLoadingDetail(false)
  }

  const daysLogged    = days.filter(d => d.log && d.state !== 'future').length
  const daysRemaining = Math.max(0, durationDays - dayNumber)

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
          {/* skeleton uses 75 cells — close enough for any duration */}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Progress" />

      {/* Stats row */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <StatCard
          value={streak > 0 ? streak : '—'}
          label={streak > 0 ? 'Day streak' : 'No streak yet'}
          dark={streak > 0}
          className={streak === 0 ? 'relative' : ''}
        />
        <StatCard
          value={dayNumber >= 4 ? `${showUpRate}%` : '—'}
          label="Show-up rate"
        />
        <StatCard
          value={daysRemaining}
          label="Days left"
        />
      </div>

      {/* Calendar */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <p key={i} className="font-mono text-[8px] text-ink-faint text-center">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}

          {days.map(day => (
            <button
              key={day.dayNumber}
              onClick={() => handleCellTap(day)}
              disabled={day.state === 'future'}
              className={`aspect-square rounded-lg flex items-center justify-center transition-transform active:scale-95 ${CELL_STATE[day.state]} ${
                selected?.dayNumber === day.dayNumber ? 'ring-2 ring-green-700 ring-offset-1' : ''
              } ${day.state !== 'future' ? 'cursor-pointer' : 'cursor-default'}`}
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

      {/* Day detail sheet */}
      {selected && (
        <DayDetailSheet
          dayNumber={selected.dayNumber}
          date={formatDate(selected.date)}
          overallState={selected.log?.overall_state ?? 'none'}
          commitments={commitments}
          commitmentLogs={detailData?.logs ?? []}
          note={detailData?.note ?? ''}
          loading={loadingDetail}
          onClose={() => { setSelected(null); setDetailData(null) }}
        />
      )}
    </div>
  )
}
