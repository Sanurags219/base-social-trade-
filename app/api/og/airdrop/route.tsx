import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const xp = searchParams.get('xp') ?? '—'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #05060A, #0E1F24)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px',
          }}
        >
          <h1 style={{ fontSize: 52, fontWeight: 700, margin: 0 }}>
            Baseline XP
          </h1>

          <p style={{ fontSize: 26, marginTop: 12, opacity: 0.85 }}>
            Community Airdrop
          </p>

          <p
            style={{
              fontSize: 64,
              fontWeight: 800,
              marginTop: 28,
              background: 'linear-gradient(90deg, #2dd4bf, #60a5fa)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            40% BSTN SUPPLY
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: 32,
              padding: '16px 32px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
            }}
          >
            <span style={{ fontSize: 22, opacity: 0.7 }}>XP Earned:</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#2dd4bf' }}>
              {xp}
            </span>
          </div>

          <p style={{ fontSize: 18, marginTop: 32, opacity: 0.5 }}>
            Built on Base
          </p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
