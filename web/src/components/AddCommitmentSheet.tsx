'use client'

import { useState } from 'react'
import Btn from '@/components/ui/Btn'
import Textarea from '@/components/ui/Textarea'
import { CATEGORIES } from '@/lib/categories'

interface Props {
  usedCategoryIds: string[]
  onAdd: (categoryId: string, definition: string, required: boolean) => Promise<void>
  onClose: () => void
}

export default function AddCommitmentSheet({ usedCategoryIds, onAdd, onClose }: Props) {
  const available = CATEGORIES.filter(c => !usedCategoryIds.includes(c.id))
  const [selected,   setSelected]   = useState<string | null>(null)
  const [definition, setDefinition] = useState('')
  const [required,   setRequired]   = useState(false)
  const [saving,     setSaving]     = useState(false)

  const cat = CATEGORIES.find(c => c.id === selected)
  const isPhoto = selected === 'photo'

  function handleSelect(id: string) {
    const c = CATEGORIES.find(c => c.id === id)!
    setSelected(id)
    setDefinition(c.defaultDefinition)
    setRequired(false)
  }

  async function handleAdd() {
    if (!selected) return
    setSaving(true)
    try {
      await onAdd(selected, definition, required)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-xl mx-auto">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative bg-card rounded-t-[20px] px-5 pt-5 pb-8 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <p className="font-display text-[18px] font-semibold tracking-tight text-ink">
          Add a commitment
        </p>

        {available.length === 0 ? (
          <p className="font-sans text-sm text-ink-soft">
            You've used all available categories. Remove one first to add a different one.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {available.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`rounded-card border-[1.5px] px-4 py-3 text-left transition-colors ${
                    selected === c.id
                      ? 'border-green-700 bg-green-800 text-surface'
                      : 'border-border bg-card text-ink'
                  }`}
                >
                  <p className="font-sans text-sm font-medium leading-snug">{c.label}</p>
                  {selected === c.id && (
                    <p className="font-mono text-[8px] text-green-400 mt-0.5 uppercase tracking-widest">Selected</p>
                  )}
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div>
                  <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-1.5">
                    What does {cat?.label} mean to you? (optional)
                  </p>
                  <Textarea
                    variant="light"
                    value={definition}
                    onChange={e => setDefinition(e.target.value)}
                    placeholder="Define your own standard…"
                    rows={3}
                  />
                </div>

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
              </>
            )}

            <Btn
              variant="dark"
              onClick={handleAdd}
              disabled={!selected || saving}
            >
              {saving ? 'Adding…' : 'Add commitment'}
            </Btn>
          </>
        )}

        <Btn variant="ghost" onClick={onClose} className="text-center w-full">
          Cancel
        </Btn>
      </div>
    </div>
  )
}
