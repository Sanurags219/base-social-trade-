import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Base Social Trade',
  description: 'Swap on Base. Share trades. Earn XP.',
  openGraph: {
    title: 'Base Social Trade',
    description: 'Social trading on Base',
    images: ['/api/og/trade']
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
