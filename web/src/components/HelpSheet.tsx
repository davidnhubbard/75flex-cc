'use client'

interface Props {
  onClose: () => void
  onAbout: () => void
}

const LINKS = [
  { label: 'Use on your computer', sub: 'Access 75flex on the web', href: '#' },
  { label: 'Help & FAQ',           sub: 'Common questions answered',  href: '#' },
  { label: 'Contact & feedback',   sub: 'Get in touch with us',       href: '#' },
  { label: "What's new",           sub: 'Recent updates',             href: '#' },
]

export default function HelpSheet({ onClose, onAbout }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-surface rounded-t-2xl w-full max-w-xl shadow-xl pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-4 mb-5" />

        <div className="px-5 mb-4">
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">Help</p>
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
      </div>
    </div>
  )
}
