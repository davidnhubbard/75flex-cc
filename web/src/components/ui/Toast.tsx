'use client'

interface Props {
  message: string
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: Props) {
  return (
    <div className="fixed bottom-14 left-0 right-0 max-w-xl mx-auto px-4 z-50 pointer-events-none">
      <div className="bg-ink text-surface font-sans text-sm px-4 py-3 rounded-card flex items-center justify-between gap-3 shadow-lg pointer-events-auto">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="text-surface/50 font-sans text-base leading-none shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
