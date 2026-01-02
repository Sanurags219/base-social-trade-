import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const name = searchParams.get('name') || 'User'
  const score = searchParams.get('score') || '760'
  const tier =
    Number(score) >= 850 ? 'Elite' :
    Number(score) >= 650 ? 'Trusted' :
    Number(score) >= 400 ? 'Regular' :
    'New'

  const tierColor =
    tier === 'Elite' ? '#A855F7' :
    tier === 'Trusted' ? '#22C55E' :
    tier === 'Regular' ? '#FACC15' :
    '#6B7280'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0D1117',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header with logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Baseline logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginRight: 8 }}>
            <div style={{ width: 12, height: 12, backgroundColor: '#0052FF', borderRadius: '50%' }} />
            <div style={{ width: 40, height: 4, backgroundColor: '#0052FF', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>
            Baseline
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 8 }}>
            Reputation Profile
          </div>

          <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 24 }}>
            {name}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>
              {score}
            </div>
            <div style={{ fontSize: 36, opacity: 0.4 }}>
              / 1000
            </div>
          </div>

          <div style={{ fontSize: 32, color: tierColor, fontWeight: 600, marginTop: 16 }}>
            {tier}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 22, opacity: 0.5 }}>
            Reputation on Base
          </div>
          <div style={{ fontSize: 18, opacity: 0.4 }}>
            base-social-trade.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
