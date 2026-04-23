interface StatCardProps {
  value: string | number
  label: string
  dark?: boolean
  className?: string
}

export default function StatCard({ value, label, dark = false, className = '' }: StatCardProps) {
  return (
    <div className={`rounded-card py-4 text-center ${dark ? 'bg-green-800' : 'bg-surface border-[1.5px] border-border'} ${className}`}>
      <p className={`font-display text-2xl font-medium tabular-nums tracking-tighter ${dark ? 'text-ember' : 'text-ink'}`}>
        {value}
      </p>
      <p className={`font-mono text-[10px] uppercase tracking-widest mt-0.5 ${dark ? 'text-green-400' : 'text-ink-faint'}`}>
        {label}
      </p>
    </div>
  )
}
