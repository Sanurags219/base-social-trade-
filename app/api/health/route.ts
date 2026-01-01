export const runtime = 'edge'

export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  })
}
