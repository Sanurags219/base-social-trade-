// NFT data fetching using Alchemy API
// Free tier: 300 requests/second

export interface NFTData {
  count: number
  collections: {
    name: string
    count: number
    floorPrice?: number
  }[]
  totalValueUSD: number
}

// Alchemy NFT API for Base
const ALCHEMY_BASE_URL = 'https://base-mainnet.g.alchemy.com/nft/v3'

export async function getNFTs(address: string): Promise<NFTData> {
  const apiKey = process.env.ALCHEMY_API_KEY
  
  // If no API key, return placeholder
  if (!apiKey) {
    console.log('No Alchemy API key, using placeholder NFT data')
    return {
      count: 0,
      collections: [],
      totalValueUSD: 0,
    }
  }
  
  try {
    const response = await fetch(
      `${ALCHEMY_BASE_URL}/${apiKey}/getNFTsForOwner?owner=${address}&withMetadata=false&pageSize=100`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )
    
    if (!response.ok) {
      console.error('Alchemy API error:', response.status)
      return { count: 0, collections: [], totalValueUSD: 0 }
    }
    
    const data = await response.json()
    
    // Count NFTs by collection
    const collectionMap = new Map<string, { name: string; count: number }>()
    
    for (const nft of data.ownedNfts || []) {
      const collectionName = nft.contract?.name || nft.contract?.address?.slice(0, 10) || 'Unknown'
      const existing = collectionMap.get(collectionName)
      
      if (existing) {
        existing.count++
      } else {
        collectionMap.set(collectionName, { name: collectionName, count: 1 })
      }
    }
    
    const collections = Array.from(collectionMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 collections
    
    return {
      count: data.ownedNfts?.length || 0,
      collections,
      totalValueUSD: 0, // Floor price calculation would need additional API calls
    }
    
  } catch (error) {
    console.error('Failed to fetch NFTs:', error)
    return { count: 0, collections: [], totalValueUSD: 0 }
  }
}

// Get NFT count only (lightweight)
export async function getNFTCount(address: string): Promise<number> {
  const data = await getNFTs(address)
  return data.count
}
