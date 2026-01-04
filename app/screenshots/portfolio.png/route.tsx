import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Portfolio screenshot - 1284x2778px (portrait) simplified
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1284px',
          height: '2778px',
          display: 'flex',
          flexDirection: 'column',
          background: '#05060A',
          padding: '100px 60px',
          fontFamily: 'system-ui',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '80px' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '30px',
            }}
          >
            <span style={{ fontSize: '60px' }}>📊</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '64px', fontWeight: 700, color: 'white' }}>Portfolio</span>
            <span style={{ fontSize: '36px', color: '#71717a' }}>Your DeFi health at a glance</span>
          </div>
        </div>

        {/* Health Score Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '80px',
            borderRadius: '48px',
            background: 'linear-gradient(135deg, #0E1F24 0%, #071317 100%)',
            border: '2px solid rgba(255,255,255,0.1)',
            marginBottom: '60px',
          }}
        >
          <span style={{ fontSize: '40px', color: '#71717a', marginBottom: '20px' }}>Health Score</span>
          <span
            style={{
              fontSize: '180px',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #22c55e, #14b8a6)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            85
          </span>
          <span style={{ fontSize: '48px', color: '#22c55e', marginTop: '20px' }}>Excellent</span>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '60px' }}>
          {[
            { label: 'Total Value', value: '$12,450', color: '#14b8a6' },
            { label: 'Tokens', value: '8', color: '#0ea5e9' },
            { label: '24h Change', value: '+2.4%', color: '#22c55e' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '50px',
                borderRadius: '32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ fontSize: '32px', color: '#71717a' }}>{stat.label}</span>
              <span style={{ fontSize: '56px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Holdings Preview */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px',
            borderRadius: '32px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontSize: '40px', color: 'white', marginBottom: '40px' }}>Top Holdings</span>
          {[
            { name: 'ETH', value: '$8,240', pct: '66%' },
            { name: 'USDC', value: '$2,100', pct: '17%' },
            { name: 'AERO', value: '$1,200', pct: '10%' },
          ].map((token, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '30px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}
            >
              <span style={{ fontSize: '40px', color: 'white' }}>{token.name}</span>
              <div style={{ display: 'flex', gap: '40px' }}>
                <span style={{ fontSize: '40px', color: '#14b8a6' }}>{token.value}</span>
                <span style={{ fontSize: '40px', color: '#71717a' }}>{token.pct}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            padding: '60px',
          }}
        >
          <span style={{ fontSize: '36px', color: '#71717a' }}>Baseline • Built on Base</span>
        </div>
      </div>
    ),
    {
      width: 1284,
      height: 2778,
    }
  )
}
