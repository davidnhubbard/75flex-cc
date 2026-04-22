'use client'

import Eyebrow from '@/components/ui/Eyebrow'

interface Props {
  onClose: () => void
}

const SECTIONS = [
  {
    heading: 'Your challenge. Your rules.',
    body: '75 Flex is a 75-day personal challenge engine. You define what you commit to — not us. Pick the categories that matter to you and set your own definitions of success.',
  },
  {
    heading: 'Consistency over perfection.',
    body: 'Partial effort counts. A day where you did half your commitments is still a day you showed up. Progress is never erased.',
  },
  {
    heading: 'No forced resets. Ever.',
    body: "Missing a day doesn't restart your challenge. Life happens. Your history is always preserved, and you keep going from where you left off.",
  },
  {
    heading: 'Built to be on your side.',
    body: 'The app never shames you for a missed day. No red. No guilt. Just an honest record of what happened and space to keep going.',
  },
]

export default function AboutSheet({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-green-900 flex flex-col max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <div>
          <Eyebrow color="green">About</Eyebrow>
          <p className="font-display text-2xl font-bold text-surface mt-0.5">75 Flex</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-citrus/15 border border-citrus/40 flex items-center justify-center"
        >
          <span className="font-sans text-xs text-citrus">×</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-8">
        {SECTIONS.map(s => (
          <div key={s.heading}>
            <p className="font-display text-[17px] font-bold text-citrus leading-snug mb-2">
              {s.heading}
            </p>
            <p className="font-sans text-sm text-green-100 leading-relaxed">{s.body}</p>
          </div>
        ))}

        <div className="mt-4 border-t border-green-800 pt-6">
          <Eyebrow color="green" className="mb-1 text-[9px]">Version</Eyebrow>
          <p className="font-sans text-xs text-green-400">75 Flex · Early access</p>
        </div>
      </div>
    </div>
  )
}
