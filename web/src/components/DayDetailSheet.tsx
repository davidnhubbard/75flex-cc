'use client'

import Sheet from '@/components/ui/Sheet'
import type { Database } from '@/lib/database.types'

type Commitment    = Database['public']['Tables']['commitments']['Row']
type CommitmentLog = Database['public']['Tables']['commitment_logs']['Row']

interface Props {
  dayNumber:      number
  date:           string
  overallState:   string
  commitments:    Commitment[]
  commitmentLogs: CommitmentLog[]
  note:           string
  loading:        boolean
  onClose:        () => void
}

const STATE_CHIP: Record<string, { label: string; color: string }> = {
  complete: { label: 'DONE',    color: 'text-green-700' },
  partial:  { label: 'PARTIAL', color: 'text-heart-deep' },
  none:     { label: '—',       color: 'text-ink-faint' },
}

const OVERALL_LABEL: Record<string, { text: string; color: string }> = {
  complete: { text: 'All done',  color: 'text-green-700' },
  partial:  { text: 'Partial',   color: 'text-heart-deep' },
  none:     { text: 'Missed',    color: 'text-ink-faint' },
}

export default function DayDetailSheet({
  dayNumber, date, overallState, commitments, commitmentLogs, note, loading, onClose,
}: Props) {
  const overall = OVERALL_LABEL[overallState] ?? OVERALL_LABEL.none

  return (
    <Sheet onClose={onClose}>
      {/* Header */}
      <div className="mb-4">
        <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-0.5">
          Day {dayNumber} · {date}
        </p>
        <p className={`font-sans text-sm font-semibold ${overall.color}`}>{overall.text}</p>
      </div>

      <div className="h-px bg-border mb-1" />

      {loading ? (
        <div className="flex flex-col gap-3 py-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-border/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Commitment rows */}
          <div className="flex flex-col divide-y divide-border">
            {commitments.map(c => {
              const log   = commitmentLogs.find(l => l.commitment_id === c.id)
              const state = log?.state ?? 'none'
              const chip  = STATE_CHIP[state] ?? STATE_CHIP.none
              return (
                <div key={c.id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm text-ink">
                      <span className="font-mono text-[9px] font-normal text-ink-faint uppercase tracking-widest">
                        {c.category} — {' '}
                      </span>
                      {c.name}
                    </p>
                    <span className={`font-mono text-[9px] font-medium tracking-widest shrink-0 ml-3 ${chip.color}`}>
                      {chip.label}
                    </span>
                  </div>
                  {log?.photo_url && (
                    <img
                      src={log.photo_url}
                      alt="Progress photo"
                      className="mt-2 w-full aspect-video object-cover rounded-card"
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Note */}
          {note && (
            <>
              <div className="h-px bg-border my-3" />
              <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-1.5">Note</p>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">{note}</p>
            </>
          )}

          {/* Empty state for missed day */}
          {overallState === 'none' && commitmentLogs.length === 0 && (
            <p className="font-sans text-xs text-ink-faint py-2">Nothing logged this day.</p>
          )}
        </>
      )}
    </Sheet>
  )
}
