import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '512px',
          height: '512px',
          backgroundColor: '#05060A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '96px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          {/* Blue dot */}
          <div
            style={{
              width: '56px',
              height: '56px',
              backgroundColor: '#0052FF',
              borderRadius: '50%',
            }}
          />
          {/* Blue baseline/underline */}
          <div
            style={{
              width: '220px',
              height: '18px',
              backgroundColor: '#0052FF',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
