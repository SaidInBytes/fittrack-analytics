import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/backend/config/auth'
import { ensureDemoUser } from '@/backend/services/demoService'

// Resolves the logged-in user from session or returns a ready-to-send 401 response.
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    const guestUser = await ensureDemoUser()

    return {
      user: {
        id: guestUser._id.toString(),
        name: guestUser.name,
        email: guestUser.email,
      },
      error: null,
    }
  }

  return { user: session.user as { id: string; name: string; email: string }, error: null }
}
