import type { Metadata } from 'next'
import { DM_Sans, DM_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-display' })

export const metadata: Metadata = {
  title: '75 Flex',
  description: 'Your challenge. Your rules.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
      <body className="bg-green-50 font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
