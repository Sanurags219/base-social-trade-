export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return Response.json({ error: 'No address' }, { status: 400 })
  }

  // MOCK DATA (replace later with real analytics)
  // In production, calculate from actual onchain data
  const reputation = {
    xpScore: Math.floor(Math.random() * 300),
    tradingScore: Math.floor(Math.random() * 200),
    ageScore: Math.floor(Math.random() * 150),
    socialScore: Math.floor(Math.random() * 150),
    riskScore: Math.floor(Math.random() * 200)
  }

  const total =
    reputation.xpScore +
    reputation.tradingScore +
    reputation.ageScore +
    reputation.socialScore +
    reputation.riskScore

  return Response.json({
    address,
    breakdown: reputation,
    score: total
  })
}
