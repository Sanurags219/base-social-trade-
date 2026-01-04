export function shareXP(xp: number, title: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://base-social-trade.vercel.app'
  const og = encodeURIComponent(
    `${baseUrl}/api/og/xp?xp=${xp}&title=${encodeURIComponent(title)}`
  )
  const text = encodeURIComponent(`I earned +${xp} XP on Baseline 🎯\n\nJoin the movement 👇`)

  window.open(
    `https://warpcast.com/~/compose?text=${text}&embeds[]=${og}`,
    '_blank'
  )
}
