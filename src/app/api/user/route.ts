import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { getUserSettings, updateUserSettings } from '@/backend/services/userService'

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0
}

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const userSettings = await getUserSettings(user!.id)

    if (!userSettings) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userSettings)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    const body = await req.json()

    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length < 2)) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    if (body.preferences?.unit && !['metric', 'imperial'].includes(body.preferences.unit)) {
      return NextResponse.json({ error: 'Invalid unit preference' }, { status: 400 })
    }

    if (body.preferences?.darkMode !== undefined && typeof body.preferences.darkMode !== 'boolean') {
      return NextResponse.json({ error: 'darkMode must be a boolean' }, { status: 400 })
    }

    const profile = body.profile ?? {}
    const profileFields = [
      'age',
      'height',
      'currentWeight',
      'goalWeight',
    ] as const

    for (const field of profileFields) {
      if (profile[field] !== undefined && !isPositiveNumber(profile[field])) {
        return NextResponse.json({ error: `${String(field)} must be a positive number` }, { status: 400 })
      }
    }

    if (
      profile.activityLevel !== undefined &&
      (typeof profile.activityLevel !== 'string' || profile.activityLevel.trim().length === 0)
    ) {
      return NextResponse.json({ error: 'activityLevel must be a non-empty string' }, { status: 400 })
    }

    if (
      profile.goals !== undefined &&
      (!Array.isArray(profile.goals) || profile.goals.some((goal: unknown) => typeof goal !== 'string'))
    ) {
      return NextResponse.json({ error: 'goals must be an array of strings' }, { status: 400 })
    }

    const updated = await updateUserSettings(user!.id, {
      name: body.name?.trim(),
      profile: body.profile,
      preferences: body.preferences,
    })

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
