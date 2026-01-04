export function shareAirdrop() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://base-social-trade.vercel.app'
  const og = encodeURIComponent(`${baseUrl}/api/og/airdrop`)
  const text = encodeURIComponent('Baseline Community Airdrop - 40% BSTN Supply')

  window.open(
    `https://warpcast.com/~/compose?text=${text}&embeds[]=${og}`,
    '_blank'
  )
}
