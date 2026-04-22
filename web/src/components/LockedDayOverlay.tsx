import Btn from '@/components/ui/Btn'

interface Props {
  dayNumber: number
  logDate: string
  onDismiss: () => void
}

export default function LockedDayOverlay({ dayNumber, logDate, onDismiss }: Props) {
  const dateLabel = new Date(logDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-border/50 flex items-center justify-center mb-4">
        <span className="text-xl">🔒</span>
      </div>
      <p className="font-display text-lg font-bold text-ink mb-1">This day is closed.</p>
      <p className="font-sans text-sm text-ink-soft leading-relaxed mb-1">
        Day {dayNumber} — {dateLabel}
      </p>
      <p className="font-sans text-xs text-ink-faint leading-relaxed mb-8">
        Outside the 3-day logging window. Your progress on this day has been recorded as-is.
      </p>
      <Btn variant="dark" onClick={onDismiss} className="px-6 py-2.5 w-auto">
        Got it
      </Btn>
    </div>
  )
}
