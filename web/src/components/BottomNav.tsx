'use client'

import type { MouseEvent } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today',    label: 'TODAY',    icon: '◈' },
  { href: '/progress', label: 'PROGRESS', icon: '◉' },
  { href: '/profile',  label: 'PROFILE',  icon: '◎' },
]

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/complete') return null

  function handleTabClick(e: MouseEvent, href: string) {
    // When already on /today, tapping Today in the bottom nav should
    // switch the internal day tab back to "today" (not no-op route click).
    if (pathname.startsWith('/today') && href === '/today') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('today-nav-click'))
      return
    }

    // Guard against losing unsaved backdate edits when leaving /today.
    const hasUnsavedBackdate = Boolean((window as any).__today_has_unsaved_backdate)
    if (pathname.startsWith('/today') && href !== '/today' && hasUnsavedBackdate) {
      const ok = window.confirm('You have unsaved backdate changes. Leave without saving?')
      if (!ok) e.preventDefault()
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border h-12 flex max-w-xl mx-auto">
      {tabs.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleTabClick(e, href)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
              active ? 'text-green-700' : 'text-ink-faint'
            }`}
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="font-mono text-[8px] tracking-widest">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
