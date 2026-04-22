'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { getActiveChallenge, getAllDailyLogs, calcStreak, calcShowUpRate } from '@/lib/queries'

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
        <h1 className="font-display text-[40px] font-black text-citrus leading-tight mb-4">
          You did it.
        </h1>
        <p className="font-sans text-sm text-green-200 leading-relaxed max-w-xs mb-10">
          75 days. Your rules. Your consistency. That&apos;s something worth celebrating.
        </p>

        <div className="w-full grid grid-cols-3 gap-3 mb-10">
          {stats.map(([val, label]) => (
            <div key={label} className="bg-green-800 border-[1.5px] border-green-700 rounded-card py-4 text-center">
              <p className="font-display text-2xl font-black text-citrus">{val}</p>
              <p className="font-mono text-[8px] text-green-400 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link
            href="/progress"
            className="w-full bg-citrus text-ink font-sans text-sm font-semibold py-3.5 rounded-xl text-center"
          >
            See full calendar
          </Link>
          <Link
            href="/onboarding"
            className="w-full border-[1.5px] border-green-600 text-green-300 font-sans text-sm font-medium py-3.5 rounded-xl text-center"
          >
            Start a new challenge
          </Link>
        </div>
      </div>
    </div>
  )
}
