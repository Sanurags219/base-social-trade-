import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Event Claimed'
  const reward = searchParams.get('reward') || 'XP + SBT'

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
          <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 12 }}>
            Event Claimed ✓
          </div>

          <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16, lineHeight: 1.1 }}>
            {title}
          </div>

          <div style={{ fontSize: 36, color: '#22C55E', fontWeight: 600 }}>
            {reward}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 22, opacity: 0.5 }}>
            Built on Base
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
