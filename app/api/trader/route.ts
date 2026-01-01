export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return Response.json({ error: 'No address provided' }, { status: 400 })
  }

  // TEMP MOCK DATA (replace with DB later)
  // In production, query database for real stats
  const mockData: Record<string, any> = {
    '0xA3': { xp: 4200, trades: 37, followers: 128, copiedTrades: 12 },
    '0xF9': { xp: 3850, trades: 32, followers: 105, copiedTrades: 8 },
    '0x7C': { xp: 3620, trades: 28, followers: 92, copiedTrades: 6 }
  }

  // Use address prefix as mock key
  const prefix = (address as string).slice(0, 4)
  const stats = mockData[prefix] || {
    xp: Math.floor(Math.random() * 5000),
    trades: Math.floor(Math.random() * 50),
    followers: Math.floor(Math.random() * 200),
    copiedTrades: Math.floor(Math.random() * 20)
  }

  return Response.json({
    address,
    ...stats
  })
}
