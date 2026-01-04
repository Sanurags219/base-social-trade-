import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Events/XP screenshot - 1284x2778px (portrait)
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
              background: 'linear-gradient(135deg, #eab308, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '30px',
            }}
          >
            <span style={{ fontSize: '60px' }}>⚡</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '64px', fontWeight: 700, color: 'white' }}>Earn XP</span>
            <span style={{ fontSize: '36px', color: '#71717a' }}>Complete tasks for rewards</span>
          </div>
        </div>

        {/* XP Overview Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px',
            borderRadius: '48px',
            background: 'linear-gradient(135deg, #0E1F24 0%, #071317 100%)',
            border: '2px solid rgba(255,255,255,0.1)',
            marginBottom: '60px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '36px', color: '#71717a' }}>Total XP</span>
              <span
                style={{
                  fontSize: '100px',
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #eab308, #f97316)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                1,250
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '36px', color: '#71717a' }}>Level</span>
              <span style={{ fontSize: '80px', fontWeight: 700, color: 'white' }}>5</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '24px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              marginTop: '40px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '65%',
                height: '100%',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #14b8a6, #0ea5e9)',
              }}
            />
          </div>
          <span style={{ fontSize: '28px', color: '#71717a', marginTop: '16px' }}>650 / 1000 XP to Level 6</span>
        </div>

        {/* Tasks */}
        <span style={{ fontSize: '44px', fontWeight: 700, color: 'white', marginBottom: '30px' }}>
          ✨ Available Tasks
        </span>

        {[
          { title: 'Connect Wallet', xp: 50, done: true },
          { title: 'View Portfolio', xp: 25, done: true },
          { title: 'Daily Check-in', xp: 10, done: false },
          { title: 'Complete 5 Swaps', xp: 200, done: false },
          { title: 'Copy a Trader', xp: 100, done: false },
        ].map((task, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '40px',
              borderRadius: '24px',
              background: task.done ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${task.done ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              marginBottom: '20px',
            }}
          >
            {/* Check */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: task.done ? '#22c55e33' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '30px',
              }}
            >
              <span style={{ fontSize: '32px' }}>{task.done ? '✓' : '○'}</span>
            </div>

            {/* Title */}
            <span
              style={{
                flex: 1,
                fontSize: '38px',
                color: task.done ? '#22c55e' : 'white',
              }}
            >
              {task.title}
            </span>

            {/* XP */}
            <span style={{ fontSize: '36px', fontWeight: 700, color: '#14b8a6' }}>+{task.xp} XP</span>
          </div>
        ))}

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
