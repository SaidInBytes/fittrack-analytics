import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { getProgressByUser, createProgress } from '@/backend/services/progressService'
import { validateProgress } from '@/backend/validators'

// Returns progress history for the authenticated user.
export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const progress = await getProgressByUser(user!.id)
    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Validates and creates a progress entry for the authenticated user.
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const body = await req.json()
    const validationError = validateProgress(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const progress = await createProgress(user!.id, body)
    return NextResponse.json(progress, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
