import { NextResponse } from 'next/server'

// Farcaster Mini App Manifest
// https://docs.base.org/mini-apps/core-concepts/notifications

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://base-line.vercel.app'

export async function GET() {
  const manifest = {
    accountAssociation: {
      // These need to be generated for your domain
      // Use: npx @farcaster/auth-kit sign-domain
      header: "eyJmaWQiOjU0NDgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg2MWQwMEFENzYwNjhGOEQ0NzQwYzM1OEM4QzAzYUFFYjUxMGI1OTBEIn0",
      payload: "eyJkb21haW4iOiJiYXNlLWxpbmUudmVyY2VsLmFwcCJ9",
      signature: "MHg3NmRkOWVlMjE4OGEyMjliNzExZjUzOTkxYTc1NmEzMGZjNTA3NmE5OTU5OWJmOWFmYjYyMzAyZWQxMWQ2MWFmNTExYzlhYWVjNjQ3OWMzODcyMTI5MzA2YmJhYjdhMTE0MmRhMjA4MmNjNTM5MTJiY2MyMDRhMWFjZTY2NjE5OTFj"
    },
    miniapp: {
      version: "1",
      name: "Baseline",
      iconUrl: `${APP_URL}/icon.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/opengraph-image`,
      buttonTitle: "Check Health Score",
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#05060A",
      webhookUrl: `${APP_URL}/api/webhook`
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
