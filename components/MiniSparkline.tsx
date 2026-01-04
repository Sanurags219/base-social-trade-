// Mini Sparkline Chart - Lightweight, no chart libs
// Matches premium trading UI reference

interface MiniSparklineProps {
  data?: number[]
  color?: string
  height?: number
  positive?: boolean
}

export function MiniSparkline({ 
  data,
  color,
  height = 48,
  positive = true 
}: MiniSparklineProps) {
  // Generate smooth curve from data or use default
  const points = data || [20, 15, 25, 18, 22, 12, 28, 20, 15, 25, 10]
  
  // Normalize points to fit viewbox
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  
  const normalized = points.map(p => 30 - ((p - min) / range) * 25)
  
  // Create smooth path
  const pathData = normalized.reduce((acc, y, i) => {
    const x = (i / (normalized.length - 1)) * 100
    if (i === 0) return `M${x} ${y}`
    
    // Smooth bezier curves
    const prevX = ((i - 1) / (normalized.length - 1)) * 100
    const prevY = normalized[i - 1]
    const cpX = (prevX + x) / 2
    
    return `${acc} C${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`
  }, '')

  const strokeColor = color || (positive ? '#2dd4bf' : '#ef4444')
  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`

  return (
    <svg 
      viewBox="0 0 100 35" 
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={`${pathData} L100 35 L0 35 Z`}
        fill={`url(#${gradientId})`}
      />
      
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}
