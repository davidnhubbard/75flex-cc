import HelpButton from '@/components/HelpButton'

export default function ProfilePage() {
  return (
    <div>
      <header className="bg-green-800 text-surface px-5 pt-8 pb-4 flex items-start justify-between">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <HelpButton variant="dark" />
      </header>
      <div className="p-4">
        {/* benchmark + plan management go here */}
        <p className="text-ink-soft text-sm">Profile coming soon.</p>
      </div>
    </div>
  )
}
