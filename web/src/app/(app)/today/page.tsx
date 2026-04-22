'use client'

import { useState, useEffect } from 'react'
import CommitmentCard from '@/components/CommitmentCard'
import CompleteAllSheet from '@/components/CompleteAllSheet'
import PageHeader from '@/components/PageHeader'

type State = 'none' | 'partial' | 'complete'
type Tab = 'today' | 'yesterday' | 'daybefore'

// Mock data — replace with Supabase queries once auth is wired
const DAY_NUMBER = 3
const MOCK_COMMITMENTS = [
  { id: '1', category: 'Physical',     name: 'One workout',   definition: 'At least 30 minutes of intentional movement' },
  { id: '2', category: 'Nutrition',    name: 'Nutrition',     definition: 'Follow your plan, no junk food' },
  { id: '3', category: 'Hydration',    name: 'Water',         definition: 'Drink at least 64 oz of water' },
  { id: '4', category: 'Personal dev', name: 'Personal dev',  definition: '10 minutes of reading or a podcast' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function tabLabel(tab: Tab) {
  if (tab === 'today')     return 'Today'
  if (tab === 'yesterday') return 'Yesterday'
  return 'Day before'
}

export default function TodayPage() {
  const [tab, setTab] = useState<Tab>('today')
  const [states, setStates] = useState<Record<string, State>>(
    Object.fromEntries(MOCK_COMMITMENTS.map(c => [c.id, 'none']))
  )
  const [showCompleteAll, setShowCompleteAll] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [greet, setGreet] = useState('Good morning')

  useEffect(() => { setGreet(greeting()) }, [])

  const progress = Math.round((DAY_NUMBER / 75) * 100)
  const allDone = Object.values(states).every(s => s === 'complete')

  const tabs: Tab[] = DAY_NUMBER === 1 ? [] : DAY_NUMBER === 2 ? ['today', 'yesterday'] : ['today', 'yesterday', 'daybefore']

  function updateState(id: string, next: State) {
    setStates(prev => ({ ...prev, [id]: next }))
    // TODO: persist to Supabase (instant-save for today, queue for backdate)
  }

  function handleCompleteAll() {
    setStates(Object.fromEntries(MOCK_COMMITMENTS.map(c => [c.id, 'complete'])))
    setShowCompleteAll(false)
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <PageHeader eyebrow={`Day ${DAY_NUMBER} of 75`}>
        <h1 className="font-display text-[22px] font-bold text-surface">{greet}</h1>
        <div className="mt-4 bg-green-900 rounded-full h-[3px]">
          <div className="bg-citrus h-[3px] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="font-mono text-[9px] text-green-400 mt-1">{progress}% complete</p>
      </PageHeader>

      {/* Tab row */}
      {tabs.length > 0 && (
        <div className="flex border-b border-border bg-surface">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 font-sans text-xs font-medium transition-colors ${
                tab === t
                  ? 'text-ink border-b-2 border-green-700'
                  : 'text-ink-faint'
              }`}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3">
        {MOCK_COMMITMENTS.map(c => (
          <CommitmentCard
            key={c.id}
            category={c.category}
            name={c.name}
            definition={c.definition}
            state={states[c.id]}
            onChange={next => updateState(c.id, next)}
          />
        ))}

        {/* Note field */}
        {noteOpen && (
          <div className="mt-1">
            <textarea
              autoFocus
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note about today…"
              rows={3}
              className="w-full bg-green-50 border-[1.5px] border-green-200 focus:border-green-600 rounded-xl px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none resize-none"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-surface border-t border-border px-4 py-3 flex gap-3">
        <button
          onClick={() => setNoteOpen(o => !o)}
          className="flex-1 py-2.5 rounded-xl border-[1.5px] border-green-700 text-green-700 font-sans text-sm font-medium"
        >
          {noteOpen ? 'Hide note' : 'Add note'}
        </button>
        <button
          onClick={() => !allDone && setShowCompleteAll(true)}
          disabled={allDone}
          className={`flex-1 py-2.5 rounded-xl font-sans text-sm font-semibold transition-colors ${
            allDone
              ? 'bg-green-100 text-green-700 border-[1.5px] border-green-200 cursor-default'
              : 'bg-citrus text-ink'
          }`}
        >
          {allDone ? 'All done ✓' : 'Complete all'}
        </button>
      </div>

      {/* Complete All sheet */}
      {showCompleteAll && (
        <CompleteAllSheet
          dayNumber={DAY_NUMBER}
          onConfirm={handleCompleteAll}
          onCancel={() => setShowCompleteAll(false)}
        />
      )}
    </div>
  )
}
