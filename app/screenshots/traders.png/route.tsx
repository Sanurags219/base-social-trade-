import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Traders screenshot - 1284x2778px (portrait)
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
              background: 'linear-gradient(135deg, #f97316, #eab308)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '30px',
            }}
          >
            <span style={{ fontSize: '60px' }}>👥</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '64px', fontWeight: 700, color: 'white' }}>Top Traders</span>
            <span style={{ fontSize: '36px', color: '#71717a' }}>Copy successful strategies</span>
          </div>
        </div>

        {/* Trader Cards */}
        {[
          { name: 'CryptoWhale', roi: '+245%', winRate: '78%', tier: 'Elite', color: '#a855f7' },
          { name: 'DeFiKing', roi: '+182%', winRate: '72%', tier: 'Trusted', color: '#14b8a6' },
          { name: 'BaseBuilder', roi: '+156%', winRate: '68%', tier: 'Trusted', color: '#0ea5e9' },
          { name: 'TokenHunter', roi: '+124%', winRate: '65%', tier: 'Regular', color: '#71717a' },
        ].map((trader, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '50px',
              borderRadius: '32px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '30px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${trader.color}, ${trader.color}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '40px',
              }}
            >
              <span style={{ fontSize: '44px', color: 'white' }}>{trader.name[0]}</span>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '44px', fontWeight: 700, color: 'white' }}>{trader.name}</span>
                <span
                  style={{
                    fontSize: '24px',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    background: `${trader.color}33`,
                    color: trader.color,
                  }}
                >
                  {trader.tier}
                </span>
              </div>
              <span style={{ fontSize: '32px', color: '#71717a', marginTop: '10px' }}>
                Win Rate: {trader.winRate}
              </span>
            </div>

            {/* ROI */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '48px', fontWeight: 700, color: '#22c55e' }}>{trader.roi}</span>
              <span style={{ fontSize: '28px', color: '#71717a' }}>30D ROI</span>
            </div>
          </div>
        ))}

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '50px',
            borderRadius: '32px',
            background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
            marginTop: '40px',
          }}
        >
          <span style={{ fontSize: '44px', fontWeight: 700, color: 'white' }}>Start Copy Trading →</span>
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
