export default function TodayPage() {
  return (
    <div>
      <header className="bg-green-800 text-surface px-6 pt-8 pb-4">
        <p className="font-mono text-xs text-green-400 uppercase tracking-widest">Day 1</p>
        <h1 className="font-display text-2xl font-bold mt-1">Good morning</h1>
      </header>
      <div className="p-4">
        {/* commitment cards go here */}
        <p className="text-ink-soft text-sm">No commitments yet.</p>
      </div>
    </div>
  )
}
