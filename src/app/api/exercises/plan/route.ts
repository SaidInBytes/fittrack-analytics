import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { fetchPlannedExercises, WorkoutPlanType } from '@/backend/services/wgerService'

const VALID_TYPES: WorkoutPlanType[] = ['push', 'pull', 'legs', 'cardio', 'stretch']

// Minutes → number of exercises suggested
const DURATION_TO_COUNT: Record<number, number> = {
  30: 5,
  45: 7,
  60: 9,
  90: 12,
  120: 16,
}

// Returns a list of exercises with images for the requested workout type and duration.
export async function GET(req: NextRequest) {
  try {
    const { error } = await getAuthenticatedUser()
    if (error) return error

    const type = req.nextUrl.searchParams.get('type') as WorkoutPlanType | null
    const durationParam = req.nextUrl.searchParams.get('duration')
    const duration = durationParam ? parseInt(durationParam, 10) : NaN

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid workout type' }, { status: 400 })
    }

    if (isNaN(duration) || !DURATION_TO_COUNT[duration]) {
      return NextResponse.json(
        { error: 'Duration must be 30, 45, 60, 90, or 120' },
        { status: 400 }
      )
    }

    const count = DURATION_TO_COUNT[duration]
    const exercises = await fetchPlannedExercises(type, count)

    return NextResponse.json({ type, duration, count, exercises })
  } catch {
    return NextResponse.json({ error: 'Failed to build workout plan' }, { status: 502 })
  }
}
