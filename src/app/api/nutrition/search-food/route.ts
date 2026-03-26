import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/backend/middleware/auth'
import { searchFoods } from '@/backend/services/foodSearchService'

export async function GET(req: NextRequest) {
  try {
    const { error } = await getAuthenticatedUser()
    if (error) return error

    const query = req.nextUrl.searchParams.get('query')?.trim() || ''

    if (query.length < 2) {
      return NextResponse.json([])
    }

    const suggestions = await searchFoods(query)
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch food suggestions' }, { status: 502 })
  }
}
