export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return Response.json({ error: 'No address provided' }, { status: 400 })
  }

  // TODO: Fetch from database or smart contract
  // For now, return error to encourage implementation
  return Response.json({ 
    error: 'Trader data not implemented',
    message: 'Connect to your backend database to fetch trader statistics',
    address 
  }, { status: 501 })
}
