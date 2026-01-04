import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Splash screen image - 200x200px as recommended
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '200px',
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #05060A 0%, #0E1F24 100%)',
          borderRadius: '40px',
        }}
      >
        {/* Logo Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '48px' }}>📊</span>
        </div>
        
        {/* App Name */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 700,
            background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Baseline
        </div>
      </div>
    ),
    {
      width: 200,
      height: 200,
    }
  )
}
