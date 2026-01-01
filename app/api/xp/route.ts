let XP = 0

export async function POST() {
  XP += 50
  return Response.json({ xp: XP })
}

export async function GET() {
  return Response.json({ xp: XP })
}
