import { notFound } from 'next/navigation'
import Link from 'next/link'
import Eyebrow from '@/components/ui/Eyebrow'

interface Screen {
  id: string
  label: string
  description: string
  href: string
}

const SECTIONS: { title: string; screens: Screen[] }[] = [
  {
    title: 'Onboarding',
    screens: [
      { id: '01.1', label: 'Intro slides',             description: 'Welcome → Your rules → No resets → Ready', href: '/onboarding' },
      { id: '01.5', label: 'Plan builder — template',  description: '75 Soft vs 75 Hard picker',                href: '/onboarding' },
      { id: '01.6', label: 'Plan builder — categories',description: 'Select 2+ commitment categories',          href: '/onboarding' },
      { id: '01.7', label: 'Plan builder — define',    description: 'Name and define each commitment',          href: '/onboarding' },
    ],
  },
  {
    title: 'Daily Logging',
    screens: [
      { id: '03.1', label: 'Today — in progress',      description: 'Mixed completion states',           href: '/today?day=3&preset=partial' },
      { id: '03.2', label: 'Today — all complete',      description: 'Every commitment done',             href: '/today?day=3&preset=complete' },
      { id: '03.3', label: 'Day 1',                     description: 'No tab row, fresh start',           href: '/today?day=1' },
      { id: '03.4', label: 'Day 2',                     description: 'Two-tab row',                       href: '/today?day=2' },
      { id: '03.5', label: 'Backdate — yesterday',      description: 'Yesterday tab selected',            href: '/today?day=3&tab=yesterday' },
      { id: '03.7', label: 'Note expanded',             description: 'Inline note field open',            href: '/today?day=3&note=open' },
      { id: '03.9', label: 'Re-engagement card',        description: '3+ missed days nudge',              href: '/today?day=15&reengagement=true' },
    ],
  },
  {
    title: 'Progress',
    screens: [
      { id: '04.1', label: 'Progress — calendar',       description: '75-day grid, stats, detail bar',   href: '/progress' },
    ],
  },
  {
    title: 'Completion',
    screens: [
      { id: '07.1', label: 'Day 75 complete',           description: 'Celebration screen',               href: '/complete' },
    ],
  },
  {
    title: 'Profile & Plan',
    screens: [
      { id: '06.2', label: 'Profile — no benchmark',    description: 'Empty benchmark nudge card',       href: '/profile' },
      { id: '05.1', label: 'Plan — tap to edit',        description: 'Commitment list, tap any card',    href: '/profile' },
    ],
  },
]

export default function DevNavPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="min-h-screen bg-green-50 pb-10">
      <div className="bg-green-800 px-5 pt-10 pb-5">
        <Eyebrow color="green" className="text-[9px]">Dev only</Eyebrow>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-surface mt-0.5">Screen Navigator</h1>
        <p className="font-sans text-xs text-green-300 mt-1">Jump directly to any screen or state</p>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6 max-w-xl mx-auto">
        {SECTIONS.map(section => (
          <div key={section.title}>
            <Eyebrow className="mb-2 text-ink-soft">
              {section.title}
            </Eyebrow>
            <div className="flex flex-col gap-2">
              {section.screens.map(screen => (
                <Link
                  key={screen.id}
                  href={screen.href}
                  className="flex items-center justify-between bg-card border-[1.5px] border-border rounded-card px-4 py-3 hover:border-green-400 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-ink-faint">{screen.id}</span>
                      <p className="font-sans text-sm font-medium text-ink">{screen.label}</p>
                    </div>
                    <p className="font-sans text-[11px] text-ink-soft mt-0.5">{screen.description}</p>
                  </div>
                  <span className="text-ink-faint text-sm ml-3">›</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-2 border-t border-border pt-4">
          <Eyebrow className="mb-2">Personas</Eyebrow>
          <p className="font-sans text-xs text-ink-soft">
            Use the <span className="font-mono bg-green-100 px-1 rounded">⚙ dev</span> button on any screen to switch between seeded test users.
          </p>
        </div>
      </div>
    </div>
  )
}
