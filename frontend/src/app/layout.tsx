import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YieldMind - AI DeFi Optimizer',
  description: 'Your AI co-pilot for DeFi yield on BNB Chain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <div className="app-shell">
          <div className="app-content">{children}</div>
          <div className="crt-overlay" aria-hidden="true" />
        </div>
      </body>
    </html>
  )
}
