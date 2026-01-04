import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0b1020, #05060a)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700 }}>
          Baseline XP
        </div>

        <div style={{ fontSize: 28, marginTop: 12, opacity: 0.9 }}>
          Community Airdrop
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            marginTop: 24,
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          40% BSTN Supply
        </div>

        <div style={{ fontSize: 20, marginTop: 28, opacity: 0.7 }}>
          Built on Base
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
