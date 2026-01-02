import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Baseline - Know your onchain baseline'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0D1117',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: '-2px',
            marginBottom: '16px',
          }}
        >
          Baseline
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '48px',
          }}
        >
          Know your onchain baseline
        </div>

        {/* Logo element - dot + line */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Blue dot */}
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#0052FF',
              borderRadius: '50%',
              boxShadow: '0 0 40px 8px rgba(0, 82, 255, 0.4)',
            }}
          />
          {/* Blue baseline with glow */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Glow effect */}
            <div
              style={{
                position: 'absolute',
                width: '300px',
                height: '8px',
                backgroundColor: '#0052FF',
                borderRadius: '4px',
                filter: 'blur(20px)',
                opacity: 0.6,
              }}
            />
            {/* Main line */}
            <div
              style={{
                width: '200px',
                height: '8px',
                backgroundColor: '#0052FF',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* Built on Base badge */}
        <div
          style={{
            marginTop: '64px',
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Built on Base
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
