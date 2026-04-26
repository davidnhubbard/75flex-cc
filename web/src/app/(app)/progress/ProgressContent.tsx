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
  complete: 'bg-state-done-bg border-[1.5px] border-state-done',
  partial:  'bg-state-partial-bg border-[1.5px] border-state-partial',
  none:     'bg-state-none-bg border-[1.5px] border-state-none',
  future:   'bg-surface border-[1.5px] border-border/40',
  today:    'bg-amber-50 border-[1.5px] border-amber-400',
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

  // Calendar filler cells — days outside the challenge in the same weeks
  const firstDay = days[0]?.date
  const lastDay  = days[days.length - 1]?.date
  const preChallengeDays = firstDay
    ? Array.from({ length: startDay }, (_, i) => {
        const d = new Date(firstDay)
        d.setDate(d.getDate() - (startDay - i))
        return d
      })
    : []
  const trailingCount = lastDay
    ? (lastDay.getDay() === 6 ? 0 : 6 - lastDay.getDay())
    : 0
  const trailingDays = lastDay
    ? Array.from({ length: trailingCount }, (_, i) => {
        const d = new Date(lastDay)
        d.setDate(d.getDate() + i + 1)
        return d
      })
    : []

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
          green
          value={streak > 0 ? streak : '—'}
          label={streak > 0 ? 'Day streak' : 'No streak yet'}
        />
        <StatCard
          green
          value={dayNumber >= 4 ? `${showUpRate}%` : '—'}
          label="Show-up rate"
        />
        <StatCard
          green
          value={daysRemaining}
          label="Days left"
        />
      </div>

      {/* Calendar */}
      <div className="px-4 pb-2">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
            <p key={i} className="font-mono text-[8px] text-ink-faint text-center">{d}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">

          {/* First month label */}
          {days.length > 0 && (
            <div className="col-span-7 pb-1">
              <p className="font-mono text-[9px] text-ink-soft uppercase tracking-widest">
                {days[0].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Pre-challenge filler cells (same week, before challenge start) */}
          {preChallengeDays.map((date, i) => (
            <div key={`pre-${i}`} className="aspect-square rounded-lg flex items-center justify-center bg-surface/60 border-[1.5px] border-border/25">
              <span className="font-mono text-[9px] text-ink-faint/40">{date.getDate()}</span>
            </div>
          ))}

          {/* Challenge days — with month headers injected at each new month */}
          {days.flatMap((day, idx) => {
            const isNewMonth = idx > 0 && day.date.getDate() === 1
            const fillCount  = isNewMonth ? day.date.getDay() : 0

            const monthHeader = isNewMonth ? (
              <div key={`mh-${idx}`} className="col-span-7 pt-3 pb-1">
                <p className="font-mono text-[9px] text-ink-soft uppercase tracking-widest">
                  {day.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            ) : null

            const fillCells = Array.from({ length: fillCount }, (_, i) => {
              const d = new Date(day.date)
              d.setDate(d.getDate() - (fillCount - i))
              return (
                <div key={`fill-${idx}-${i}`} className="aspect-square rounded-lg flex items-center justify-center bg-surface/60 border-[1.5px] border-border/25">
                  <span className="font-mono text-[9px] text-ink-faint/40">{d.getDate()}</span>
                </div>
              )
            })

            const textColor =
                day.state === 'complete' ? 'text-state-done-ink' :
                day.state === 'partial'  ? 'text-state-partial-ink' :
                day.state === 'today'    ? 'text-amber-700' :
                day.state === 'future'   ? 'text-ink-faint' :
                'text-state-none-ink'

            const cell = (
              <button
                key={day.dayNumber}
                onClick={() => handleCellTap(day)}
                disabled={day.state === 'future'}
                className={`relative group aspect-square rounded-lg flex items-center justify-center transition-transform active:scale-95 ${CELL_STATE[day.state]} ${
                  selected?.dayNumber === day.dayNumber ? 'ring-2 ring-amber-400 ring-offset-1' : ''
                } ${day.state !== 'future' ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Date of month — fades out on hover */}
                <span className={`font-mono text-[9px] font-medium transition-opacity group-hover:opacity-0 ${
                  day.state === 'today' ? 'font-bold' : ''
                } ${textColor}`}>
                  {day.date.getDate()}
                </span>
                {/* Challenge day tooltip — fades in on hover */}
                <span className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] font-bold ${textColor}`}>
                  {day.dayNumber}
                </span>
                {/* Tooltip bubble above the cell */}
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-ink text-surface font-mono text-[8px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  Day {day.dayNumber}
                </span>
              </button>
            )

            return [monthHeader, ...fillCells, cell].filter(Boolean)
          })}

          {/* Trailing filler cells (same week, after challenge ends) */}
          {trailingDays.map((date, i) => (
            <div key={`post-${i}`} className="aspect-square rounded-lg flex items-center justify-center bg-surface/60 border-[1.5px] border-border/25">
              <span className="font-mono text-[9px] text-ink-faint/40">{date.getDate()}</span>
            </div>
          ))}

        </div>
      </div>

      {/* Legend + hint */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-center gap-4">
          {([
            { cls: 'bg-state-done-bg border-state-done',     label: 'Done'       },
            { cls: 'bg-state-partial-bg border-state-partial', label: 'Partial'   },
            { cls: 'bg-state-none-bg border-state-none',     label: 'Not logged' },
            { cls: 'bg-amber-50 border-amber-400',           label: 'Today'      },
          ] as const).map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm border-[1.5px] ${cls}`} />
              <span className="font-mono text-[8px] text-ink-faint">{label}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[8px] text-ink-faint text-center uppercase tracking-wider">
          Tap any past day to see details
        </p>
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
          reflection={selected.log?.reflection ?? null}
          loading={loadingDetail}
          onClose={() => { setSelected(null); setDetailData(null) }}
        />
      )}
    </div>
  )
}
