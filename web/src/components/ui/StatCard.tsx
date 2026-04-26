interface StatCardProps {
  value: string | number
  label: string
  dark?:  boolean
  green?: boolean
  className?: string
}

export default function StatCard({ value, label, dark = false, green = false, className = '' }: StatCardProps) {
  const bg  = dark  ? 'bg-green-800'
             : green ? 'bg-green-300'
             : 'bg-card border-[1.5px] border-border'
  const val = dark  ? 'text-amber-400'
             : green ? 'text-green-900'
             : 'text-ink'
  const lbl = dark  ? 'text-green-400'
             : green ? 'text-green-800'
             : 'text-ink-faint'

  return (
    <div className={`rounded-card py-4 text-center ${bg} ${className}`}>
      <p className={`font-display text-2xl font-medium tabular-nums tracking-tighter ${val}`}>
        {value}
      </p>
      <p className={`font-mono text-[10px] uppercase tracking-widest mt-0.5 ${lbl}`}>
        {label}
      </p>
    </div>
  )
}
