/**
 * Reputation badge helper
 * Returns badge styling and label based on score
 */
export function getReputationBadge(score: number): {
  color: string
  bgColor: string
  label: string
  emoji: string
} {
  if (score >= 800) {
    return {
      color: 'text-green-400',
      bgColor: 'bg-green-900/20 border-green-600',
      label: 'Elite',
      emoji: '🟢'
    }
  }
  if (score >= 600) {
    return {
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20 border-blue-600',
      label: 'Trusted',
      emoji: '🔵'
    }
  }
  if (score >= 400) {
    return {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20 border-yellow-600',
      label: 'Regular',
      emoji: '🟡'
    }
  }
  return {
    color: 'text-red-400',
    bgColor: 'bg-red-900/20 border-red-600',
    label: 'New',
    emoji: '🔴'
  }
}

/**
 * Format reputation score component label
 */
export function getComponentLabel(key: string): string {
  const labels: Record<string, string> = {
    xpScore: 'XP Earned',
    tradingScore: 'Trading Activity',
    ageScore: 'Account Age',
    socialScore: 'Social Proof',
    riskScore: 'Risk Behavior'
  }
  return labels[key] || key
}

/**
 * Get maximum value for a reputation component
 */
export function getComponentMax(key: string): number {
  const maxes: Record<string, number> = {
    xpScore: 300,
    tradingScore: 200,
    ageScore: 150,
    socialScore: 150,
    riskScore: 200
  }
  return maxes[key] || 100
}
