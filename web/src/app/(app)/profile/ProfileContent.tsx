'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EditCommitmentSheet from '@/components/EditCommitmentSheet'
import PageHeader from '@/components/PageHeader'
import Btn from '@/components/ui/Btn'
import Eyebrow from '@/components/ui/Eyebrow'
import { createClient } from '@/lib/supabase'
import {
  getActiveChallenge, getCommitments, updateCommitmentDefinition,
  calcDayNumber,
} from '@/lib/queries'
import type { Database } from '@/lib/database.types'

type Commitment = Database['public']['Tables']['commitments']['Row'] & {
  changeLog?: { day: number; from: string; to: string }[]
}

const FREE_TIER_MAX = 4

export default function ProfileContent() {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,     setLoading]     = useState(true)
  const [dayNumber,   setDayNumber]   = useState(1)
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [editing,     setEditing]     = useState<Commitment | null>(null)
  const [todayLogged, setTodayLogged] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const challenge = await getActiveChallenge(supabase)
    if (!challenge) { router.push('/onboarding'); return }

    const day   = calcDayNumber(challenge.start_date)
    const comms = await getCommitments(supabase, challenge.id)

    // Check if today already has a log
    const today = new Date().toISOString().split('T')[0]
    const { data: log } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('log_date', today)
      .maybeSingle()

    setChallengeId(challenge.id)
    setDayNumber(day)
    setCommitments(comms)
    setTodayLogged(!!log)
    setLoading(false)
  }

  async function handleSave(id: string, definition: string) {
    await updateCommitmentDefinition(supabase, id, definition, dayNumber)
    setCommitments(prev => prev.map(c => c.id === id ? { ...c, definition } : c))
    setEditing(null)
  }

  async function handleRemove(id: string) {
    await supabase.from('commitments').delete().eq('id', id)
    setCommitments(prev => prev.filter(c => c.id !== id))
    setEditing(null)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const atCap = commitments.length >= FREE_TIER_MAX

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-24 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 flex flex-col gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-border/50 rounded-card animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Profile" />

      <div className="px-4 py-5 flex flex-col gap-6">

        {/* Benchmark (C33, C34) */}
        <section>
          <Eyebrow>Starting benchmark</Eyebrow>
          <div className="bg-surface border-[1.5px] border-dashed border-border rounded-card px-4 py-5 flex flex-col items-center text-center gap-2">
            <p className="font-sans text-sm font-medium text-ink">No starting benchmark</p>
            <p className="font-sans text-xs text-ink-soft">Add one anytime — photos and notes to track where you started.</p>
            <Btn variant="outline" className="mt-1 px-4 py-2 w-auto text-xs">
              Add benchmark
            </Btn>
          </div>
        </section>

        {/* My Plan */}
        <section>
          <Eyebrow className="mb-2">My plan</Eyebrow>
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

            <Btn
              variant="outline"
              disabled={atCap}
              className={`flex items-center justify-center gap-2 py-3 rounded-card border-[1.5px] border-dashed ${
                atCap ? 'border-border text-ink-faint' : ''
              }`}
            >
              {atCap ? (
                <><span>Add commitment</span><span className="font-mono text-[9px] bg-ink-faint/10 text-ink-faint px-1.5 py-0.5 rounded">FREE</span></>
              ) : '+ Add commitment'}
            </Btn>
          </div>
        </section>

        <section className="border-t border-border pt-4 flex flex-col gap-1">
          <button className="w-full text-center font-sans text-xs text-ink-soft hover:text-ink transition-colors py-2">
            Restart challenge from Day 1
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-center font-sans text-xs text-ink-faint hover:text-ink-soft transition-colors py-2"
          >
            Sign out
          </button>
        </section>
      </div>

      {editing && (
        <EditCommitmentSheet
          commitment={editing}
          totalCommitments={commitments.length}
          todayLogged={todayLogged}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
