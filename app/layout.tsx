import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BSTN Social Trade',
  description: 'Social trading, earn XP & reputation on Base',
  openGraph: {
    title: 'BSTN Social Trade',
    description: 'Swap, share, earn XP on Base mainnet',
    url: 'https://base-social-trade.vercel.app',
    siteName: 'BSTN',
    images: [
      {
        url: '/api/og/trade',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BSTN',
  },
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
