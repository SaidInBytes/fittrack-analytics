import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { getNutritionByUser, createNutrition } from '@/backend/services/nutritionService'
import { validateNutrition } from '@/backend/validators'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const nutrition = await getNutritionByUser(user!.id)
    return NextResponse.json(nutrition)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const body = await req.json()
    const validationError = validateNutrition(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const nutrition = await createNutrition(user!.id, body)
    return NextResponse.json(nutrition, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
