// Risk classification allowlists/denylists
// Lightweight tagging - no ML needed

export const STABLES = ['USDC', 'USDT', 'DAI', 'USDbC', 'FRAX', 'LUSD', 'sUSD']

export const BLUECHIPS = ['ETH', 'WETH', 'cbETH', 'wstETH', 'rETH', 'stETH', 'BTC', 'WBTC']

export const MEMES = [
  'PEPE', 'DOGE', 'SHIB', 'FLOKI', 'WOJAK', 'BRETT', 'TOSHI', 
  'DEGEN', 'HIGHER', 'MFER', 'BASED', 'BALD'
]

export const DEFI = ['AERO', 'UNI', 'AAVE', 'COMP', 'CRV', 'BAL', 'SNX']

export type RiskCategory = 'stable' | 'bluechip' | 'meme' | 'defi' | 'other'

export function classify(symbol: string): RiskCategory {
  const s = symbol.toUpperCase()
  if (STABLES.includes(s)) return 'stable'
  if (BLUECHIPS.includes(s)) return 'bluechip'
  if (MEMES.includes(s)) return 'meme'
  if (DEFI.includes(s)) return 'defi'
  return 'other'
}

export function getRiskLevel(category: RiskCategory): number {
  switch (category) {
    case 'stable': return 1
    case 'bluechip': return 2
    case 'defi': return 3
    case 'other': return 4
    case 'meme': return 5
  }
}
