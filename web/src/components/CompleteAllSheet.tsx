'use client'

import Sheet from '@/components/ui/Sheet'
import Btn from '@/components/ui/Btn'

interface Props {
  dayNumber: number
  onConfirm: () => void
  onCancel: () => void
}

export default function CompleteAllSheet({ dayNumber, onConfirm, onCancel }: Props) {
  return (
    <Sheet onClose={onCancel}>
      <p className="font-display text-lg font-bold text-ink text-center leading-snug">
        Mark All Commitments as Complete for Day {dayNumber}?
      </p>
      <p className="font-sans text-sm text-ink-soft text-center mt-2">
        This will set every commitment to done.
      </p>
      <div className="flex flex-col gap-3 mt-8">
        <Btn variant="dark" onClick={onConfirm}>
          Mark all complete
        </Btn>
        <Btn variant="ghost" onClick={onCancel}>
          Cancel
        </Btn>
      </div>
    </Sheet>
  )
}
