'use client'

interface Props {
  dayNumber: number
  onConfirm: () => void
  onCancel: () => void
}

export default function CompleteAllSheet({ dayNumber, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-surface rounded-t-2xl w-full max-w-xl px-6 pt-6 pb-10 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
        <p className="font-display text-lg font-bold text-ink text-center leading-snug">
          Mark all commitments as complete for Day {dayNumber}?
        </p>
        <p className="font-sans text-sm text-ink-soft text-center mt-2">
          This will set every commitment to done.
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={onConfirm}
            className="w-full bg-green-800 text-citrus font-sans text-sm font-semibold py-3 rounded-xl"
          >
            Mark all complete
          </button>
          <button
            onClick={onCancel}
            className="w-full text-green-700 font-sans text-sm font-medium py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
