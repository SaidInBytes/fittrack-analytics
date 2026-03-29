import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/backend/config/auth'

// Resolves the logged-in user from session or returns a ready-to-send 401 response.
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { user: session.user as { id: string; name: string; email: string }, error: null }
}
