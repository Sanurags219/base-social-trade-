import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const xp = searchParams.get('xp') ?? '100'
  const title = searchParams.get('title') ?? 'Baseline Event'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(to bottom, #0a0a0a, #05060A)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ fontSize: 42, fontWeight: 600 }}>Baseline</div>

        {/* Center */}
        <div>
          <div style={{ fontSize: 28, opacity: 0.7 }}>XP Earned</div>
          <div style={{ fontSize: 96, fontWeight: 700 }}>+{xp} XP</div>
          <div style={{ fontSize: 32, marginTop: 8 }}>{title}</div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 22, opacity: 0.6 }}>
          Built on Base
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
