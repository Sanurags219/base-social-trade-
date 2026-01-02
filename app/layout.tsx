import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Baseline',
  description: 'Know your onchain baseline — portfolio, health score, reputation & events on Base.',
  metadataBase: new URL('https://base-social-trade.vercel.app'),
  openGraph: {
    title: 'Baseline',
    description: 'Know your onchain baseline — portfolio, health score & reputation on Base.',
    url: 'https://base-social-trade.vercel.app',
    siteName: 'Baseline',
    images: [
      {
        url: 'https://base-social-trade.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Baseline',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://base-social-trade.vercel.app/og-image.png',
    'fc:miniapp': 'true',
    'fc:miniapp:name': 'Baseline',
    'fc:miniapp:description': 'Know your onchain baseline — portfolio, health score & reputation.',
    'fc:miniapp:url': 'https://base-social-trade.vercel.app',
    'fc:miniapp:icon': 'https://base-social-trade.vercel.app/icon.png',
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
