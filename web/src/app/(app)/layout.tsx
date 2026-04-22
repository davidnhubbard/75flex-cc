import BottomNav from '@/components/BottomNav'
import DevSwitcher from '@/components/DevSwitcher'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto">
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      <BottomNav />
      {process.env.NODE_ENV === 'development' && <DevSwitcher />}
    </div>
  )
}
