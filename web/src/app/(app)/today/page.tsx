import { Suspense } from 'react'
import TodayContent from './TodayContent'

export default function TodayPage() {
  return (
    <Suspense>
      <TodayContent />
    </Suspense>
  )
}
