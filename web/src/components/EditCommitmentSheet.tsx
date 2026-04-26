'use client'

import { useState } from 'react'
import Sheet from '@/components/ui/Sheet'
import Btn from '@/components/ui/Btn'
import Textarea from '@/components/ui/Textarea'
import Eyebrow from '@/components/ui/Eyebrow'

interface Commitment {
  id: string
  category: string
  name: string
  definition: string
  required?: boolean
  targetValue?: number | null
  targetUnit?: 'oz' | 'ml' | null
  changeLog?: { day: number; from: string; to: string }[]
}

interface Props {
  commitment: Commitment
  totalCommitments: number
  todayLogged: boolean
  onSave: (id: string, definition: string, required: boolean, targetValue?: number, targetUnit?: 'oz' | 'ml') => void
  onRemove: (id: string) => void
  onClose: () => void
}

export default function EditCommitmentSheet({ commitment, totalCommitments, todayLogged, onSave, onRemove, onClose }: Props) {
  const [definition,  setDefinition]  = useState(commitment.definition ?? '')
  const [required,    setRequired]    = useState(commitment.required ?? false)
  const [targetGoal,  setTargetGoal]  = useState(String(commitment.targetValue ?? ''))
  const [targetUnit,  setTargetUnit]  = useState<'oz' | 'ml'>(commitment.targetUnit ?? 'oz')
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [logExpanded, setLogExpanded] = useState(false)

  const isPhoto     = commitment.category === 'photo'
  const isHydration = commitment.category === 'hydration'
  const canRemove = totalCommitments > 2
  const effectNote = todayLogged ? 'Takes effect tomorrow' : 'Applies today'
  const log = commitment.changeLog ?? []
  const visibleLog = logExpanded ? log : log.slice(0, 3)

  if (showRemoveConfirm) {
    return (
      <Sheet onClose={onClose}>
        <p className="font-display text-lg font-bold text-ink text-center">Remove "{commitment.name}"?</p>
        <p className="font-sans text-sm text-ink-soft text-center mt-2">
          This commitment will be removed from your plan starting tomorrow.
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <Btn
            variant="destructive"
            onClick={() => onRemove(commitment.id)}
          >
            Remove commitment
          </Btn>
          <Btn variant="ghost" onClick={() => setShowRemoveConfirm(false)}>
            Cancel
          </Btn>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet onClose={onClose}>
      <div className="px-5 py-4 border-b border-border">
        <Eyebrow>{commitment.category}</Eyebrow>
        <p className="font-display text-lg font-bold text-ink mt-0.5">{commitment.name}</p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {isHydration ? (
          <div>
            <Eyebrow color="faint" className="block mb-2 text-ink-soft">Daily water goal</Eyebrow>
            {/* Unit toggle */}
            <div className="flex mb-3 rounded-lg overflow-hidden border-[1.5px] border-border">
              {(['oz', 'ml'] as const).map((u, i) => (
                <button
                  key={u}
                  onClick={() => setTargetUnit(u)}
                  className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    i === 1 ? 'border-l border-border' : ''
                  } ${targetUnit === u ? 'bg-green-700 text-surface' : 'bg-card text-ink-faint'}`}
                >
                  {u}
                </button>
              ))}
            </div>
            {/* Goal input */}
            <input
              type="number"
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              placeholder={targetUnit === 'oz' ? 'e.g. 64' : 'e.g. 2000'}
              className="w-full rounded-lg border-[1.5px] border-border bg-card font-sans text-sm text-ink px-3 py-2.5 outline-none focus:border-green-500"
            />
            <p className="font-mono text-[9px] text-ink-faint mt-1.5">
              {targetUnit === 'oz' ? '64 oz ≈ 8 cups · 100 oz ≈ 3 liters' : '1000 ml = 1 liter · 3000 ml = 3 liters'}
            </p>
          </div>
        ) : (
          <div>
            <Eyebrow color="faint" className="block mb-1.5 text-ink-soft">
              Your definition
            </Eyebrow>
            <Textarea
              variant="light"
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              rows={3}
              placeholder="What does this mean to you?"
            />
          </div>
        )}

        {isPhoto && (
          <button
            onClick={() => setRequired(r => !r)}
            className="flex items-center justify-between bg-card border-[1.5px] border-border rounded-card px-4 py-3"
          >
            <div className="text-left">
              <p className="font-sans text-sm font-medium text-ink">Photo required</p>
              <p className="font-sans text-[11px] text-ink-soft mt-0.5">
                {required
                  ? 'Day is incomplete without a photo'
                  : 'Photo is optional — day can complete without it'}
              </p>
            </div>
            <div className={`ml-4 w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${required ? 'bg-green-700' : 'bg-border'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${required ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        )}

        <Btn
          variant="primary"
          disabled={isHydration && !parseFloat(targetGoal)}
          onClick={() => {
            if (isHydration) {
              onSave(commitment.id, '', false, parseFloat(targetGoal), targetUnit)
            } else {
              onSave(commitment.id, definition, required)
            }
          }}
        >
          Save changes
        </Btn>
        <p className="font-sans text-[11px] text-ink-soft text-center -mt-2">{effectNote}</p>

        {/* Change log (C25) */}
        {log.length > 0 && (
          <div className="border-t border-border pt-4">
            <Eyebrow className="mb-2">Change log</Eyebrow>
            <div className="flex flex-col gap-2">
              {visibleLog.map((entry, i) => (
                <div key={i} className="text-xs">
                  <span className="font-mono text-[9px] text-ink-faint">Day {entry.day} · </span>
                  <span className="text-ink-soft line-through">{entry.from || '(empty)'}</span>
                  <span className="text-ink-soft"> → </span>
                  <span className="text-ink">{entry.to || '(empty)'}</span>
                </div>
              ))}
            </div>
            {log.length > 3 && (
              <button
                onClick={() => setLogExpanded(e => !e)}
                className="font-sans text-[11px] text-green-700 mt-2"
              >
                {logExpanded ? 'Show less' : `Show all ${log.length} changes`}
              </button>
            )}
          </div>
        )}

        {/* Remove */}
        <div className="border-t border-border pt-4 pb-2">
          <button
            onClick={() => canRemove && setShowRemoveConfirm(true)}
            disabled={!canRemove}
            className={`w-full py-2.5 rounded-xl font-sans text-sm font-medium border-[1.5px] transition-colors ${
              canRemove
                ? 'border-red-200 text-red-500 hover:bg-red-50'
                : 'border-border text-ink-faint opacity-40 cursor-default'
            }`}
          >
            Remove commitment
          </button>
          {!canRemove && (
            <p className="font-sans text-[10px] text-ink-faint text-center mt-1.5">Minimum 2 commitments required</p>
          )}
        </div>
      </div>
    </Sheet>
  )
}
