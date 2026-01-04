/**
 * Share airdrop status on Farcaster with OG image
 */
export function shareAirdrop(xp: number = 0) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://base-social-trade.vercel.app'

  const ogImageUrl = `${baseUrl}/api/og/airdrop?xp=${xp}`
  const shareText = xp > 0 
    ? `I've earned ${xp.toLocaleString()} XP on Baseline! 🎯\n\n40% of BSTN supply is reserved for the community airdrop.\n\nCheck your XP:`
    : `Baseline Community Airdrop - 40% BSTN Supply\n\nEarn XP to qualify:`
  
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(ogImageUrl)}`
  
  window.open(warpcastUrl, '_blank')
}

/**
 * Share portfolio score on Farcaster
 */
export function shareScore(score: number, status: string) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://base-social-trade.vercel.app'

  const shareText = `My portfolio health score is ${score}/100 (${status}) 📊\n\nTrack your wallet health on Baseline:`
  
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(baseUrl + '/portfolio')}`
  
  window.open(warpcastUrl, '_blank')
}

/**
 * Check if notification should be sent based on score change
 */
export function shouldNotifyScoreChange(prevScore: number, nextScore: number): 'improved' | 'dropped' | null {
  // Score crossed 60% threshold (improvement milestone)
  if (prevScore < 60 && nextScore >= 60) return 'improved'
  
  // Score crossed 50% threshold (improvement milestone)
  if (prevScore < 50 && nextScore >= 50) return 'improved'
  
  // Score crossed 70% threshold (healthy milestone)
  if (prevScore < 70 && nextScore >= 70) return 'improved'
  
  // Score dropped significantly (5+ points)
  if (nextScore <= prevScore - 5) return 'dropped'
  
  return null
}

/**
 * Get notification copy based on score change
 */
export function getScoreNotificationCopy(type: 'improved' | 'dropped', score: number) {
  if (type === 'improved') {
    return {
      title: 'Portfolio Score Improved',
      body: `Your portfolio score improved to ${score}%. Nice progress — keep going.`
    }
  }
  
  return {
    title: 'Portfolio Score Update',
    body: `Your portfolio score dropped to ${score}%. Review your holdings to stay healthy.`
  }
}
