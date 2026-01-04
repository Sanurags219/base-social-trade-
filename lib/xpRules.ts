export function xpForScoreDelta(prev: number, next: number): number {
  const delta = Math.max(0, next - prev)
  if (delta >= 15) return 150
  if (delta >= 10) return 100
  if (delta >= 5) return 50
  return 0
}

export function xpForAction(action: string): number {
  switch (action) {
    case 'swap':
      return 10
    case 'diversify':
      return 25
    case 'add-stable':
      return 20
    case 'rebalance':
      return 30
    default:
      return 5
  }
}
