interface WgerSearchItem {
  value: string
  data?: {
    id?: number
    name?: string
  }
}

interface WgerSearchResponse {
  suggestions: WgerSearchItem[]
}

export interface ExerciseSuggestion {
  id: number
  name: string
}

const WGER_BASE_URL = 'https://wger.de/api/v2'

// Searches wger exercises and returns normalized suggestions for the UI autocomplete.
export async function searchWgerExercises(query: string, limit = 10): Promise<ExerciseSuggestion[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const params = new URLSearchParams({ term: normalizedQuery })

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (process.env.WGER_API_KEY) {
    headers.Authorization = `Token ${process.env.WGER_API_KEY}`
  }

  const response = await fetch(`${WGER_BASE_URL}/exercise/search/?${params.toString()}`, {
    headers,
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`wger request failed: ${response.status}`)
  }

  const payload = (await response.json()) as WgerSearchResponse

  return payload.suggestions
    .map((item, index) => {
      const name = item.data?.name || item.value || ''
      const id = item.data?.id ?? index
      return {
        id,
        name: name.trim(),
      }
    })
    .filter((item) => item.name.length > 0)
    .slice(0, limit)
}
