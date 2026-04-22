import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGroteskSans    = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' })
const spaceGroteskDisplay = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'],        variable: '--font-display' })
const jetbrainsMono       = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'],              variable: '--font-mono' })

export const metadata: Metadata = {
  title: '75 Flex',
  description: 'Your challenge. Your rules.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGroteskSans.variable} ${spaceGroteskDisplay.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-green-50 font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
