import { NextResponse } from 'next/server'

// Farcaster Mini App Manifest - Full Implementation
// https://docs.base.org/mini-apps/core-concepts/manifest

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://base-line.vercel.app'

export async function GET() {
  const manifest = {
    // Account Association - proves domain ownership
    // Generate at: https://www.base.dev/preview?tab=account
    accountAssociation: {
      header: "eyJmaWQiOjU0NDgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg2MWQwMEFENzYwNjhGOEQ0NzQwYzM1OEM4QzAzYUFFYjUxMGI1OTBEIn0",
      payload: "eyJkb21haW4iOiJiYXNlLWxpbmUudmVyY2VsLmFwcCJ9",
      signature: "MHg3NmRkOWVlMjE4OGEyMjliNzExZjUzOTkxYTc1NmEzMGZjNTA3NmE5OTU5OWJmOWFmYjYyMzAyZWQxMWQ2MWFmNTExYzlhYWVjNjQ3OWMzODcyMTI5MzA2YmJhYjdhMTE0MmRhMjA4MmNjNTM5MTJiY2MyMDRhMWFjZTY2NjE5OTFj"
    },
    
    miniapp: {
      // Identity & Launch
      version: "1",
      name: "Baseline",
      homeUrl: APP_URL,
      iconUrl: `${APP_URL}/icon.png`,
      
      // Loading Experience
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#05060A",
      
      // Discovery & Search
      primaryCategory: "finance",
      tags: ["defi", "portfolio", "health", "trading", "base"],
      noindex: false, // Set true for development
      
      // Display Information
      subtitle: "Portfolio Health Score",
      description: "Track your DeFi portfolio health, copy top traders, and earn XP rewards on Base.",
      tagline: "Your DeFi Health Score",
      heroImageUrl: `${APP_URL}/opengraph-image`,
      screenshotUrls: [
        `${APP_URL}/screenshots/portfolio.png`,
        `${APP_URL}/screenshots/traders.png`,
        `${APP_URL}/screenshots/events.png`
      ],
      
      // Notifications
      webhookUrl: `${APP_URL}/api/webhook`,
      
      // Embeds & Social Sharing
      ogTitle: "Baseline - DeFi Health Score",
      ogDescription: "Check your portfolio health score and earn XP on Base",
      ogImageUrl: `${APP_URL}/opengraph-image`
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
