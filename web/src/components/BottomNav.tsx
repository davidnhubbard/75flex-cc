'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/today',    label: 'TODAY',    icon: '◈' },
  { href: '/progress', label: 'PROGRESS', icon: '◉' },
  { href: '/profile',  label: 'PROFILE',  icon: '◎' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border h-12 flex max-w-xl mx-auto">
      {tabs.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
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
