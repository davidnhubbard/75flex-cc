'use client'

type State = 'none' | 'partial' | 'complete'

interface Props {
  category: string
  name: string
  definition?: string | null
  state: State
  onChange: (next: State) => void
  readonly?: boolean
}

const NEXT: Record<State, State> = {
  none: 'partial',
  partial: 'complete',
  complete: 'none',
}

const CARD_STYLE: Record<State, string> = {
  none:     'bg-surface border-border',
  partial:  'bg-amber-light border-amber',
  complete: 'bg-green-100 border-green-200',
}

const CHIP_STYLE: Record<State, string> = {
  none:     'text-ink-faint',
  partial:  'text-amber',
  complete: 'text-green-700',
}

const CHIP_LABEL: Record<State, string> = {
  none:     'NOT STARTED',
  partial:  'PARTIAL',
  complete: 'DONE',
}

export default function CommitmentCard({ category, name, definition, state, onChange, readonly }: Props) {
  return (
    <button
      onClick={() => !readonly && onChange(NEXT[state])}
      disabled={readonly}
      className={`w-full text-left rounded-card border-[1.5px] px-4 py-3 transition-colors ${CARD_STYLE[state]} ${readonly ? 'opacity-40 cursor-default' : 'active:scale-[0.99]'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] text-ink-soft uppercase tracking-widest mb-0.5">{category}</p>
          <p className="font-sans text-sm font-medium text-ink leading-snug">{name}</p>
          {definition && (
            <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug">{definition}</p>
          )}
        </div>
        <span className={`font-mono text-[9px] font-medium tracking-widest mt-0.5 shrink-0 ${CHIP_STYLE[state]}`}>
          {CHIP_LABEL[state]}
        </span>
      </div>
    </button>
  )
}
