import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { deleteWorkoutTemplate, logTemplateAsWorkout } from '@/backend/services/workoutService'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
