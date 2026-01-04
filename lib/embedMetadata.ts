import { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://base-line.vercel.app'

interface MiniAppEmbedParams {
  title?: string
  description?: string
  imageUrl?: string
  pageUrl?: string
  buttonTitle?: string
}

// Generate Mini App embed metadata for Next.js pages
export function generateMiniAppMetadata({
  title = 'Baseline',
  description = 'Track your DeFi portfolio health score',
  imageUrl,
  pageUrl,
  buttonTitle = 'Open App'
}: MiniAppEmbedParams = {}): Metadata {
  const fullImageUrl = imageUrl || `${APP_URL}/opengraph-image`
  const fullPageUrl = pageUrl || APP_URL

  // fc:miniapp meta tag content
  const embedContent = JSON.stringify({
    version: "next",
    imageUrl: fullImageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_frame",
        url: fullPageUrl,
        name: "Baseline",
        splashImageUrl: `${APP_URL}/splash.png`,
        splashBackgroundColor: "#05060A"
      }
    }
  })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [fullImageUrl],
      url: fullPageUrl,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl]
    },
    other: {
      'fc:miniapp': embedContent
    }
  }
}

// Generate embed metadata for specific pages
export const embedMetadata = {
  home: generateMiniAppMetadata({
    title: 'Baseline - DeFi Health Score',
    description: 'Track your portfolio health and earn XP on Base',
    buttonTitle: 'Check Score'
  }),
  
  portfolio: generateMiniAppMetadata({
    title: 'Portfolio Health - Baseline',
    description: 'View your DeFi portfolio health score and insights',
    pageUrl: `${APP_URL}/portfolio`,
    buttonTitle: 'View Portfolio'
  }),
  
  traders: generateMiniAppMetadata({
    title: 'Top Traders - Baseline',
    description: 'Copy successful traders on Base',
    pageUrl: `${APP_URL}/traders`,
    buttonTitle: 'Browse Traders'
  }),
  
  events: generateMiniAppMetadata({
    title: 'Earn XP - Baseline',
    description: 'Complete tasks and earn XP rewards',
    pageUrl: `${APP_URL}/events`,
    buttonTitle: 'Earn XP'
  }),
  
  swap: generateMiniAppMetadata({
    title: 'Swap - Baseline',
    description: 'Swap tokens on Base with the best rates',
    pageUrl: `${APP_URL}/swap`,
    buttonTitle: 'Swap Now'
  }),
  
  leaderboard: generateMiniAppMetadata({
    title: 'Leaderboard - Baseline',
    description: 'Top DeFi portfolios on Base',
    pageUrl: `${APP_URL}/leaderboard`,
    buttonTitle: 'View Rankings'
  })
}

// Dynamic embed for user-specific content (e.g., share pages)
export function generateUserEmbed(address: string, score: number, xp: number = 0) {
  const imageUrl = `${APP_URL}/api/og?address=${address}&score=${score}&xp=${xp}`
  const pageUrl = `${APP_URL}/reputation/${address}`
  
  return generateMiniAppMetadata({
    title: `Health Score: ${score} - Baseline`,
    description: `Check out my DeFi portfolio health score on Baseline`,
    imageUrl,
    pageUrl,
    buttonTitle: 'View Score'
  })
}
