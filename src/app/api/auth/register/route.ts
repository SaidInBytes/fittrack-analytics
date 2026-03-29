import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/backend/services/userService'
import { validateRegistration } from '@/backend/validators'

// Validates and creates a new user account.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validationError = validateRegistration(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const user = await registerUser(body.name, body.email, body.password)

    return NextResponse.json(
      { message: 'User created', userId: user._id },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
