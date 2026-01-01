import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BSTN Social Trade',
  description: 'Social trading, XP, reputation & credit on Base',
  openGraph: {
    title: 'BSTN Social Trade',
    description: 'Swap, share trades, earn XP on Base',
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
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/api/og/trade',
    'fc:miniapp': 'true',
    'fc:miniapp:name': 'BSTN Social Trade',
    'fc:miniapp:description': 'Social trading & onchain reputation on Base',
    'fc:miniapp:url': 'https://base-social-trade.vercel.app',
    'fc:miniapp:icon': 'https://base-social-trade.vercel.app/icon.svg',
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
