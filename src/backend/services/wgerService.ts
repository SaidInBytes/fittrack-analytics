interface WgerExerciseItem {
  id: number
  name: string
  description?: string
  category?: number
}

interface WgerExerciseResponse {
  count: number
  next: string | null
  previous: string | null
  results: WgerExerciseItem[]
}

export interface ExerciseSuggestion {
  id: number
  name: string
}

const WGER_BASE_URL = 'https://wger.de/api/v2'

export async function searchWgerExercises(query: string, limit = 10): Promise<ExerciseSuggestion[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const params = new URLSearchParams({
    language: '2',
    limit: String(limit),
    name: normalizedQuery,
  })

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (process.env.WGER_API_KEY) {
    headers.Authorization = `Token ${process.env.WGER_API_KEY}`
  }

  const response = await fetch(`${WGER_BASE_URL}/exercise/?${params.toString()}`, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`wger request failed: ${response.status}`)
  }

  const payload = (await response.json()) as WgerExerciseResponse

  return payload.results
    .filter((item) => typeof item.name === 'string' && item.name.trim().length > 0)
    .map((item) => ({
      id: item.id,
      name: item.name.trim(),
    }))
}
