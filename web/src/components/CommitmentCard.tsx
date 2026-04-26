'use client'

type State = 'none' | 'partial' | 'complete'

interface Props {
  category: string
  name: string
  definition?: string | null
  required?: boolean
  state: State
  onChange: (next: State) => void
  readonly?: boolean
  photoUrl?: string | null
  uploading?: boolean
}

const NEXT: Record<State, State> = {
  none: 'partial',
  partial: 'complete',
  complete: 'none',
}

// Photo is binary — no partial state
const NEXT_PHOTO: Record<State, State> = {
  none: 'complete',
  partial: 'complete',
  complete: 'none',
}

const CARD_STYLE: Record<State, string> = {
  none:     'bg-state-none-bg border-state-none',
  partial:  'bg-state-partial-bg border-state-partial',
  complete: 'bg-state-done-bg border-state-done',
}

const CHIP_STYLE: Record<State, string> = {
  none:     'text-state-none-ink',
  partial:  'text-state-partial-ink',
  complete: 'text-state-done-ink',
}

const CHIP_LABEL: Record<State, string> = {
  none:     'NOT STARTED',
  partial:  'PARTIAL',
  complete: 'DONE',
}

const PHOTO_CHIP: Record<'none' | 'complete', string> = {
  none:     'NOT TAKEN',
  complete: 'TAKEN ✓',
}

export default function CommitmentCard({ category, name, definition, required, state, onChange, readonly, photoUrl, uploading }: Props) {
  const isPhoto  = category === 'photo'
  const next     = isPhoto ? NEXT_PHOTO[state] : NEXT[state]
  const chipLabel = uploading
    ? 'UPLOADING…'
    : isPhoto
      ? PHOTO_CHIP[state === 'partial' ? 'none' : state]
      : CHIP_LABEL[state]

  return (
    <button
      onClick={() => !readonly && !uploading && onChange(next)}
      disabled={readonly || uploading}
      className={`w-full text-left rounded-card border-[1.5px] px-4 py-3 transition-colors ${CARD_STYLE[state]} ${readonly || uploading ? 'opacity-40 cursor-default' : 'active:scale-[0.99]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-medium text-ink leading-snug">
            <span className="font-mono text-[9px] font-normal text-ink-faint uppercase tracking-widest">{category} — </span>
            {isPhoto && '📷 '}
            {name}
          </p>
          {isPhoto && required && (
            <p className="font-mono text-[8px] text-state-partial-ink uppercase tracking-widest mt-0.5">Required</p>
          )}
          {definition && (
            <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug">{definition}</p>
          )}
          {isPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt="Progress photo"
              className="mt-2 w-20 h-20 rounded-lg object-cover"
            />
          )}
        </div>
        <span className={`font-mono text-[9px] font-medium tracking-widest mt-0.5 shrink-0 ${CHIP_STYLE[state]}`}>
          {chipLabel}
        </span>
      </div>
    </button>
  )
}
