import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { createWorkoutTemplate, getWorkoutTemplatesByUser } from '@/backend/services/workoutService'
import { validateWorkoutTemplate } from '@/backend/validators'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const templates = await getWorkoutTemplatesByUser(user!.id)
    return NextResponse.json(templates)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const body = await req.json()
    const validationError = validateWorkoutTemplate(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const template = await createWorkoutTemplate(user!.id, body)
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
