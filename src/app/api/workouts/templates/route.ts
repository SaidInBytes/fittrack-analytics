import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { validateSameOriginWrite } from '@/backend/middleware/apiSecurity'
import { createWorkoutTemplate, getWorkoutTemplatesByUser } from '@/backend/services/workoutService'
import { validateWorkoutTemplate } from '@/backend/validators'
import { fallbackWorkoutTemplates, isDatabaseConnectionError } from '@/backend/services/fallbackData'

// Returns saved recurring workout templates for the authenticated user.
export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const templates = await getWorkoutTemplatesByUser(user!.id)
    return NextResponse.json(templates)
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json(fallbackWorkoutTemplates)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Validates and creates a recurring workout template for the authenticated user.
export async function POST(req: NextRequest) {
  try {
    const securityError = validateSameOriginWrite(req)
    if (securityError) return securityError

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
