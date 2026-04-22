'use client'

import { useState } from 'react'
import HelpSheet from './HelpSheet'
import AboutSheet from './AboutSheet'

interface Props {
  variant?: 'dark' | 'light'
}

export default function HelpButton({ variant = 'dark' }: Props) {
  const [sheet, setSheet] = useState<'none' | 'help' | 'about'>('none')

  const btnStyle = variant === 'dark'
    ? 'bg-citrus/15 border-citrus text-citrus'
    : 'bg-green-100 border-green-600 text-green-700'

  return (
    <>
      <button
        onClick={() => setSheet('help')}
        className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${btnStyle}`}
        aria-label="Help"
      >
        <span className="font-sans text-[10px] font-bold leading-none">?</span>
      </button>

      {sheet === 'help' && (
        <HelpSheet
          onClose={() => setSheet('none')}
          onAbout={() => setSheet('about')}
        />
      )}

      {sheet === 'about' && (
        <AboutSheet onClose={() => setSheet('none')} />
      )}
    </>
  )
}
