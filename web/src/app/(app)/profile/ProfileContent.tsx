'use client'

import { useState } from 'react'
import EditCommitmentSheet from '@/components/EditCommitmentSheet'
import PageHeader from '@/components/PageHeader'

type Commitment = {
  id: string
  category: string
  name: string
  definition: string
  changeLog?: { day: number; from: string; to: string }[]
}

// Mock data — replace with Supabase queries once auth is wired
const MOCK_COMMITMENTS: Commitment[] = [
  { id: '1', category: 'Physical',     name: 'One workout',   definition: 'At least 30 minutes of intentional movement' },
  { id: '2', category: 'Nutrition',    name: 'Nutrition',     definition: 'Follow your plan, no junk food' },
  { id: '3', category: 'Hydration',    name: 'Water',         definition: 'Drink at least 64 oz of water' },
  { id: '4', category: 'Personal dev', name: 'Personal dev',  definition: '10 minutes of reading or a podcast',
    changeLog: [{ day: 4, from: 'Read 10 pages', to: '10 minutes of reading or a podcast' }] },
]

const FREE_TIER_MAX = 4
const TODAY_LOGGED = true // mock: today already logged

export default function ProfileContent() {
  const [commitments, setCommitments] = useState<Commitment[]>(MOCK_COMMITMENTS)
  const [editing, setEditing] = useState<Commitment | null>(null)
  const atCap = commitments.length >= FREE_TIER_MAX

  function handleSave(id: string, definition: string) {
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, definition } : c))
    setEditing(null)
  }

  function handleRemove(id: string) {
    setCommitments(prev => prev.filter(c => c.id !== id))
    setEditing(null)
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Profile" />

      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Benchmark (C33, C34) */}
        <section>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-2">Starting benchmark</p>
          <div className="bg-surface border-[1.5px] border-dashed border-border rounded-card px-4 py-5 flex flex-col items-center text-center gap-2">
            <p className="font-sans text-sm font-medium text-ink">No starting benchmark</p>
            <p className="font-sans text-xs text-ink-soft">Add one anytime — photos and notes to track where you started.</p>
            <button className="mt-1 px-4 py-2 rounded-xl border-[1.5px] border-green-700 text-green-700 font-sans text-xs font-medium">
              Add benchmark
            </button>
          </div>
        </section>

        {/* My Plan */}
        <section>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-2">My plan</p>
          <div className="flex flex-col gap-2">
            {commitments.map(c => (
              <button
                key={c.id}
                onClick={() => setEditing(c)}
                className="w-full bg-surface border-[1.5px] border-border rounded-card px-4 py-3 flex items-center justify-between hover:border-green-400 transition-colors"
              >
                <div className="text-left">
                  <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">{c.category}</p>
                  <p className="font-sans text-sm font-medium text-ink mt-0.5">{c.name}</p>
                  {c.definition && (
                    <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug">{c.definition}</p>
                  )}
                </div>
                <span className="text-ink-faint ml-3 shrink-0">›</span>
              </button>
            ))}

            {/* Add commitment (C24) */}
            <button
              disabled={atCap}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-card border-[1.5px] border-dashed font-sans text-sm font-medium transition-colors ${
                atCap
                  ? 'border-border text-ink-faint'
                  : 'border-green-700 text-green-700 hover:bg-green-50'
              }`}
            >
              {atCap ? (
                <>
                  <span>Add commitment</span>
                  <span className="font-mono text-[9px] bg-ink-faint/10 text-ink-faint px-1.5 py-0.5 rounded">FREE</span>
                </>
              ) : (
                '+ Add commitment'
              )}
            </button>
          </div>
        </section>

        {/* Restart */}
        <section className="border-t border-border pt-4">
          <button className="w-full text-center font-sans text-xs text-ink-soft hover:text-ink transition-colors py-2">
            Restart challenge from Day 1
          </button>
        </section>

      </div>

      {editing && (
        <EditCommitmentSheet
          commitment={editing}
          totalCommitments={commitments.length}
          todayLogged={TODAY_LOGGED}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
