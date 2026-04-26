'use client'

import { useState } from 'react'

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
  // Hydration-specific
  targetValue?: number | null
  targetUnit?: 'oz' | 'ml' | null
  currentValue?: number
  onAddAmount?: (amount: number) => void
  onSetValue?: (value: number) => void
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

const BAR_COLOR: Record<State, string> = {
  none:     'bg-state-none',
  partial:  'bg-state-partial',
  complete: 'bg-state-done',
}

export default function CommitmentCard({
  category, name, definition, required, state, onChange, readonly, photoUrl, uploading,
  targetValue, targetUnit, currentValue = 0, onAddAmount, onSetValue,
}: Props) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom,  setShowCustom]  = useState(false)

  const isPhoto     = category === 'photo'
  const isHydration = category === 'hydration' && !!targetValue && !!onAddAmount

  // ── Hydration card ────────────────────────────────────────────────────────
  if (isHydration) {
    const unit       = targetUnit ?? 'oz'
    const goal       = targetValue!
    const pct        = Math.min(100, Math.round((currentValue / goal) * 100))
    const remaining  = Math.max(0, goal - currentValue)
    const increments = unit === 'ml' ? [250, 500, 750] : [8, 16, 32]

    function handleCustomSubmit() {
      const amt = parseFloat(customInput)
      if (!isNaN(amt) && amt > 0) {
        onAddAmount!(amt)
        setCustomInput('')
        setShowCustom(false)
      }
    }

    return (
      <div className={`w-full rounded-card border-[1.5px] px-4 py-3 transition-colors ${CARD_STYLE[state]} ${readonly ? 'opacity-40' : ''}`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-sans text-sm font-medium text-ink leading-snug">
            💧 {name}
          </p>
          <span className={`font-mono text-[9px] font-medium tracking-widest mt-0.5 shrink-0 ${CHIP_STYLE[state]}`}>
            {CHIP_LABEL[state]}
          </span>
        </div>

        {/* Progress bar — tap to jump to goal */}
        <button
          onClick={() => !readonly && remaining > 0 && onSetValue?.(goal)}
          disabled={readonly || state === 'complete'}
          className="w-full mb-3 text-left disabled:cursor-default"
          title={state !== 'complete' ? `Tap to mark ${goal} ${unit} complete` : undefined}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-xs text-ink-soft">{currentValue} / {goal} {unit}</span>
            <span className="font-mono text-xs text-ink-faint">{pct}%</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${BAR_COLOR[state]}`}
              style={{ width: `${Math.max(pct, 0)}%` }}
            />
          </div>
        </button>

        {/* Quick-add buttons */}
        {!readonly && (
          <div className="flex gap-1.5">
            {increments.map(amt => (
              <button
                key={amt}
                onClick={() => onAddAmount!(amt)}
                className="flex-1 py-2 rounded-lg border-[1.5px] border-state-none bg-state-none-bg font-mono text-xs text-ink-soft active:scale-95 transition-transform"
              >
                +{amt}
              </button>
            ))}

            {showCustom ? (
              <div className="flex gap-1 flex-1">
                <input
                  type="number"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
                  placeholder="amt"
                  className="w-full rounded-lg border-[1.5px] border-green-400 bg-state-none-bg font-mono text-xs text-ink px-2 py-2 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  className="px-2.5 py-2 rounded-lg bg-green-700 font-mono text-xs text-surface"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustom(true)}
                className="px-3 py-2 rounded-lg border-[1.5px] border-dashed border-state-none font-mono text-xs text-ink-faint"
              >
                +?
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Standard / photo card ─────────────────────────────────────────────────
  const next      = isPhoto ? NEXT_PHOTO[state] : NEXT[state]
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
            {isPhoto && '📷 '}
            {name}
            {isPhoto && (
              <span className="font-sans text-sm font-normal text-ink-soft ml-1">
                ({required ? 'Required' : 'Optional'})
              </span>
            )}
          </p>
          {definition && (
            <p className="font-sans text-sm text-ink-soft mt-0.5 leading-snug">{definition}</p>
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
