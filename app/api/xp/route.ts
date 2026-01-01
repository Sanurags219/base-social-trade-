type UserXP = {
  address: string
  xp: number
}

let leaderboard: UserXP[] = []

export async function POST(req: Request) {
  const { address } = await req.json()

  if (!address) {
    return Response.json({ error: 'No address' }, { status: 400 })
  }

  const user = leaderboard.find((u) => u.address === address)

  if (user) {
    user.xp += 50
  } else {
    leaderboard.push({ address, xp: 50 })
  }

  return Response.json({ success: true })
}

export async function GET() {
  const sorted = [...leaderboard].sort((a, b) => b.xp - a.xp)
  return Response.json(sorted)
}
