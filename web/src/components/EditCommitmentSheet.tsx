'use client'

import { useState } from 'react'

interface Commitment {
  id: string
  category: string
  name: string
  definition: string
  changeLog?: { day: number; from: string; to: string }[]
}

interface Props {
  commitment: Commitment
  totalCommitments: number
  todayLogged: boolean
  onSave: (id: string, definition: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

export default function EditCommitmentSheet({ commitment, totalCommitments, todayLogged, onSave, onRemove, onClose }: Props) {
  const [definition, setDefinition] = useState(commitment.definition)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [logExpanded, setLogExpanded] = useState(false)

  const canRemove = totalCommitments > 2
  const effectNote = todayLogged ? 'Takes effect tomorrow' : 'Applies today'
  const log = commitment.changeLog ?? []
  const visibleLog = logExpanded ? log : log.slice(0, 3)

  if (showRemoveConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative bg-surface rounded-t-2xl w-full max-w-xl px-6 pt-6 pb-10 shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
          <p className="font-display text-lg font-bold text-ink text-center">Remove "{commitment.name}"?</p>
          <p className="font-sans text-sm text-ink-soft text-center mt-2">
            This commitment will be removed from your plan starting tomorrow.
          </p>
          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => onRemove(commitment.id)}
              className="w-full bg-red-500 text-white font-sans text-sm font-semibold py-3 rounded-xl"
            >
              Remove commitment
            </button>
            <button onClick={() => setShowRemoveConfirm(false)} className="w-full text-green-700 font-sans text-sm font-medium py-2">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-surface rounded-t-2xl w-full max-w-xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-4 mb-1" />

        <div className="px-5 py-4 border-b border-border">
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{commitment.category}</p>
          <p className="font-display text-lg font-bold text-ink mt-0.5">{commitment.name}</p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="font-mono text-[9px] text-ink-soft uppercase tracking-widest block mb-1.5">
              Your definition
            </label>
            <textarea
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              rows={3}
              placeholder="What does this mean to you?"
              className="w-full bg-green-50 border-[1.5px] border-green-200 focus:border-green-600 rounded-xl px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none resize-none"
            />
          </div>

          <button
            onClick={() => onSave(commitment.id, definition)}
            className="w-full bg-citrus text-ink font-sans text-sm font-semibold py-3 rounded-xl"
          >
            Save changes
          </button>
          <p className="font-sans text-[11px] text-ink-soft text-center -mt-2">{effectNote}</p>

          {/* Change log (C25) */}
          {log.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-2">Change log</p>
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
      </div>
    </div>
  )
}
