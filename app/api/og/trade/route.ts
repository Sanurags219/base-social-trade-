export const runtime = 'edge'

export async function GET(req: Request) {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Trade share endpoint'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
