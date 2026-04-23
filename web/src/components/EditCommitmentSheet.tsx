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

        <Btn variant="primary" onClick={() => onSave(commitment.id, definition)}>
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
