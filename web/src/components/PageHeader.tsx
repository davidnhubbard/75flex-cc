import HelpButton from './HelpButton'

interface Props {
  title?: string
  eyebrow?: string        // small label above title (e.g. "Day 3 of 75")
  children?: React.ReactNode  // replaces title when you need custom content
}

export default function PageHeader({ title, eyebrow, children }: Props) {
  return (
    <div className="bg-green-800 px-5 pt-8 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <p className="font-mono text-[10px] text-green-400 uppercase tracking-widest mb-0.5">
              {eyebrow}
            </p>
          )}
          {children ?? (
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-surface">{title}</h1>
          )}
        </div>
        <HelpButton variant="dark" />
      </div>
    </div>
  )
}
