'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getActiveChallenge, getAllDailyLogs, calcStreak, calcShowUpRate } from '@/lib/queries'
import Btn from '@/components/ui/Btn'
import StatCard from '@/components/ui/StatCard'

export default function CompleteContent() {
  const supabase = createClient()
  const [streak,      setStreak]      = useState<number | null>(null)
  const [showUpRate,  setShowUpRate]  = useState<number | null>(null)
  const [daysLogged,  setDaysLogged]  = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const challenge = await getActiveChallenge(supabase)
      if (!challenge) return
      const allLogs = await getAllDailyLogs(supabase, challenge.id)
      setStreak(calcStreak(allLogs, 75))
      setShowUpRate(calcShowUpRate(allLogs, 75))
      setDaysLogged(allLogs.filter(l => l.overall_state !== 'none').length)
    }
    load()
  }, [])

  const stats: [string | number, string][] = [
    [daysLogged ?? '—', 'Days'],
    [streak ?? '—',     'Streak'],
    [showUpRate != null ? `${showUpRate}%` : '—', 'Show-up'],
  ]

  return (
    <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6">
      <div className="flex-1 flex flex-col justify-center items-center text-center py-16">
        <p className="font-mono text-[10px] text-green-400 uppercase tracking-widest mb-4">Day 75 complete</p>
        <h1 className="font-display text-[40px] font-semibold tracking-tight text-ember leading-tight mb-4">
          You did it.
        </h1>
        <p className="font-sans text-sm text-green-200 leading-relaxed max-w-xs mb-10">
          75 days. Your rules. Your consistency. That&apos;s something worth celebrating.
        </p>

        <div className="w-full grid grid-cols-3 gap-3 mb-10">
          {stats.map(([val, label]) => (
            <StatCard key={label} value={val} label={label} dark />
          ))}
        </div>

        <div className="w-full flex flex-col gap-3">
          <Btn
            variant="primary"
            onClick={() => window.location.href = '/progress'}
            className="text-center"
          >
            See full calendar
          </Btn>
          <Btn
            variant="outline"
            onClick={() => window.location.href = '/onboarding'}
            className="text-center"
          >
            Start a new challenge
          </Btn>
        </div>
      </div>
    </div>
  )
}
