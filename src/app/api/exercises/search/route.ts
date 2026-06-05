import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { searchWgerExercises } from '@/backend/services/wgerService'
import { searchLocalExercises } from '@/backend/services/exerciseLibrary'

// Returns exercise autocomplete suggestions from wger for authenticated users.
export async function GET(req: NextRequest) {
  try {
    const { error } = await getAuthenticatedUser()
    if (error) return error

    const query = req.nextUrl.searchParams.get('query')?.trim() || ''

    if (query.length < 2) {
      return NextResponse.json([])
    }

    const suggestions = await searchWgerExercises(query)
    return NextResponse.json(suggestions)
  } catch {
    const query = req.nextUrl.searchParams.get('query')?.trim() || ''
    return NextResponse.json(searchLocalExercises(query))
  }
}
