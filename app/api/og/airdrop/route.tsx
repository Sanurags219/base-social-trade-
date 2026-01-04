import { ImageResponse } from 'next/og'
export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const xp = searchParams.get('xp') ?? '0'
  const formattedXP = parseInt(xp, 10).toLocaleString()

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0b1020 0%, #05060a 50%, #0a1525 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-1px' }}>
          Baseline XP
        </div>

        <div style={{ fontSize: 26, marginTop: 12, opacity: 0.85 }}>
          Community Airdrop
        </div>

        <div
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
        </div>

        {parseInt(xp, 10) > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: 24,
              padding: '12px 32px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ fontSize: 20, opacity: 0.7 }}>XP Earned:</span>
            <span style={{ fontSize: 28, fontWeight: 700 }}>{formattedXP}</span>
          </div>
        )}

        <div style={{ 
          fontSize: 18, 
          marginTop: 32, 
          opacity: 0.6,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>Built on</span>
          <span style={{ fontWeight: 600, color: '#60a5fa' }}>Base</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
