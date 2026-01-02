import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const score = parseInt(searchParams.get('score') || '74')
  
  // Status based on score
  const status = score >= 80 ? 'Healthy' : score >= 50 ? 'Moderate' : 'Risky'
  
  // Color based on status
  const statusColor = status === 'Healthy' ? '#22C55E' : status === 'Moderate' ? '#FACC15' : '#EF4444'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0D1117',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Baseline logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#0052FF', borderRadius: '50%' }} />
            <div style={{ width: '40px', height: '4px', backgroundColor: '#0052FF', borderRadius: '2px' }} />
          </div>
          <div
            style={{
              fontSize: '40px',
              fontWeight: '700',
              color: '#fff',
            }}
          >
            Baseline
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '16px',
            }}
          >
            Wallet Health Score
          </div>

          <div
            style={{
              fontSize: '120px',
              fontWeight: '800',
              color: '#fff',
              lineHeight: 1,
              letterSpacing: '-4px',
            }}
          >
            {score}
            <span style={{ fontSize: '48px', color: 'rgba(255,255,255,0.4)', marginLeft: '8px' }}>
              / 100
            </span>
          </div>

          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: statusColor,
              marginTop: '16px',
            }}
          >
            {status}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>
            Built on Base
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.3)' }}>
            base-social-trade.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
