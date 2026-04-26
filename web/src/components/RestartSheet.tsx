'use client'

import Btn from '@/components/ui/Btn'

interface Props {
  onConfirm: () => void
  onCancel: () => void
  confirming?: boolean
}

export default function RestartSheet({ onConfirm, onCancel, confirming }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-xl mx-auto">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div className="relative bg-card rounded-t-[20px] px-5 pt-5 pb-8 flex flex-col gap-4">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <div>
          <p className="font-display text-[18px] font-semibold tracking-tight text-ink leading-snug mb-1">
            Start a new challenge?
          </p>
          <p className="font-sans text-sm text-ink-soft leading-relaxed">
            Your current challenge and all its history will be archived — nothing is deleted. A fresh 75-day challenge starts today.
          </p>
        </div>

        <Btn
          variant="dark"
          onClick={onConfirm}
          disabled={confirming}
        >
          {confirming ? 'Archiving…' : 'Archive and restart'}
        </Btn>
        <Btn variant="ghost" onClick={onCancel} className="text-center w-full">
          Keep going
        </Btn>
      </div>
    </div>
  )
}
