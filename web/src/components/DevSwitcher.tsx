'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const PERSONAS = [
  { email: 'new@75flex.dev',           password: 'testtest', label: 'New User',       description: 'No challenge started' },
  { email: 'day2@75flex.dev',          password: 'testtest', label: 'Day 2',          description: '2 days in' },
  { email: 'reengagement@75flex.dev',  password: 'testtest', label: 'Re-engage',      description: 'Day 15, 4 missed' },
  { email: 'day60@75flex.dev',         password: 'testtest', label: 'Day 60',         description: '60 days in' },
  { email: 'day75@75flex.dev',         password: 'testtest', label: 'Day 75',         description: 'Just completed' },
]

export default function DevSwitcher() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function switchTo(persona: typeof PERSONAS[number]) {
    setLoading(persona.email)
    await supabase.auth.signOut()
    const { error } = await supabase.auth.signInWithPassword({
      email: persona.email,
      password: persona.password,
    })
    setLoading(null)
    if (error) {
      alert(`Switch failed: ${error.message}`)
      return
    }
    setOpen(false)
    router.push('/today')
    router.refresh()
  }

  return (
    <div className="fixed bottom-16 right-3 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white border border-border rounded-card shadow-lg p-3 w-48 flex flex-col gap-1.5">
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-1">Switch persona</p>
          {PERSONAS.map(p => (
            <button
              key={p.email}
              onClick={() => switchTo(p)}
              disabled={loading === p.email}
              className="text-left px-2.5 py-2 rounded-lg hover:bg-green-50 disabled:opacity-40 transition-colors"
            >
              <p className="font-sans text-xs font-medium text-ink">{p.label}</p>
              <p className="font-mono text-[9px] text-ink-soft">{p.description}</p>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-green-800 text-citrus font-mono text-[10px] px-3 py-1.5 rounded-full shadow-lg hover:bg-green-700 transition-colors"
      >
        {open ? '× close' : '⚙ dev'}
      </button>
    </div>
  )
}
