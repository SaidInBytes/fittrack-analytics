import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { validateSameOriginWrite } from '@/backend/middleware/apiSecurity'
import { deleteWorkoutTemplate, logTemplateAsWorkout } from '@/backend/services/workoutService'

// Deletes a specific template owned by the authenticated user.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const securityError = validateSameOriginWrite(req)
    if (securityError) return securityError

    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const deleted = await deleteWorkoutTemplate(params.id, user!.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Logs a template as today's completed workout for the authenticated user.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const securityError = validateSameOriginWrite(req)
    if (securityError) return securityError

    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const logged = await logTemplateAsWorkout(params.id, user!.id)
    if (!logged) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(logged, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
