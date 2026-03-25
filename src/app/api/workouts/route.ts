import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { getWorkoutsByUser, createWorkout } from '@/backend/services/workoutService'
import { validateWorkout } from '@/backend/validators'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const workouts = await getWorkoutsByUser(user!.id)
    return NextResponse.json(workouts)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const body = await req.json()
    const validationError = validateWorkout(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const workout = await createWorkout(user!.id, body)
    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
