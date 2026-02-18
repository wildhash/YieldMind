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
      <body>
        <div className="app-shell">
          <div className="crt-overlay" aria-hidden="true" />
          <div className="app-content">{children}</div>
        </div>
      </body>
    </html>
  )
}
