'use client'

import Sheet from '@/components/ui/Sheet'
import Eyebrow from '@/components/ui/Eyebrow'

interface Props {
  onClose: () => void
  onAbout: () => void
}

const LINKS = [
  { label: 'Use on your computer', sub: 'Access 75 Flex on the web',        href: '#' },
  { label: 'Help & FAQ',           sub: 'Common questions answered',          href: '#' },
  { label: 'Contact & feedback',   sub: 'Get in touch with the team',         href: '#' },
  { label: 'Report a bug',         sub: 'Something not working?',             href: '#' },
  { label: "What's new",           sub: 'Recent updates and improvements',    href: '#' },
  { label: 'Privacy policy',       sub: 'How we handle your data',            href: '#' },
  { label: 'Rate the app',         sub: 'Leave a review',                     href: '#' },
]

export default function HelpSheet({ onClose, onAbout }: Props) {
  return (
    <Sheet onClose={onClose} className="bg-paper">
      <div className="px-5 mb-4 -mx-6 mt-4">
        <Eyebrow>Help</Eyebrow>
        <p className="font-display text-xl font-bold text-ink mt-0.5">75 Flex</p>
      </div>

        {/* How this works — opens About */}
        <button
          onClick={onAbout}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-green-50 transition-colors"
        >
          <div className="text-left">
            <p className="font-sans text-sm font-medium text-ink">How this works</p>
            <p className="font-sans text-[11px] text-ink-soft">The 75 Flex philosophy</p>
          </div>
          <span className="text-ink-faint text-sm">›</span>
        </button>

        <div className="h-px bg-border mx-5" />

        {LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-green-50 transition-colors"
          >
            <div>
              <p className="font-sans text-sm font-medium text-ink">{link.label}</p>
              <p className="font-sans text-[11px] text-ink-soft">{link.sub}</p>
            </div>
            <span className="text-ink-faint text-sm">›</span>
          </a>
        ))}
    </Sheet>
  )
}
