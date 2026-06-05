import { NextRequest, NextResponse } from 'next/server'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function getAllowedOrigins(req: NextRequest) {
  const origins = new Set<string>()
  const requestOrigin = req.nextUrl.origin

  origins.add(requestOrigin)

  if (process.env.NEXTAUTH_URL) {
    origins.add(new URL(process.env.NEXTAUTH_URL).origin)
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`)
  }

  return origins
}

// Blocks cross-site writes while allowing same-origin app requests and safe reads.
export function validateSameOriginWrite(req: NextRequest) {
  if (SAFE_METHODS.has(req.method)) return null

  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const source = origin ?? (referer ? new URL(referer).origin : null)

  if (!source) {
    return NextResponse.json({ error: 'Missing request origin' }, { status: 403 })
  }

  if (!getAllowedOrigins(req).has(source)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  return null
}
