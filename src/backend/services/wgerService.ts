import { getLocalPlannedExercises, searchLocalExercises } from './exerciseLibrary'

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

// ── Workout Planner types ────────────────────────────────────────────────────

export type WorkoutPlanType = 'push' | 'pull' | 'legs' | 'cardio' | 'stretch'

interface WgerExerciseCategory {
  id: number
  name: string
}

interface WgerExerciseRaw {
  id: number
  category: WgerExerciseCategory
  name: string
}

interface WgerExerciseListResponse {
  results: WgerExerciseRaw[]
}

interface WgerImageRaw {
  image: string
  is_main: boolean
}

interface WgerImageListResponse {
  results: WgerImageRaw[]
}

export interface PlannedExercise {
  id: number
  name: string
  category: string
  imageUrl: string | null
}

// Maps each plan type to wger category IDs
// 8=Arms  9=Back  10=Chest  11=Legs  12=Shoulders  13=Abs  14=Calves
const PLAN_CATEGORY_IDS: Record<WorkoutPlanType, number[]> = {
  push: [10, 12, 8],
  pull: [9, 8],
  legs: [11, 14],
  cardio: [13, 11],
  stretch: [9, 11, 12, 8],
}

const WGER_BASE_URL = 'https://wger.de/api/v2'

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/json' }
  if (process.env.WGER_API_KEY) headers.Authorization = `Token ${process.env.WGER_API_KEY}`
  return headers
}

async function fetchExercisesByCategory(
  categoryId: number,
  limit: number
): Promise<WgerExerciseRaw[]> {
  const params = new URLSearchParams({
    category: categoryId.toString(),
    language: '2',
    format: 'json',
    limit: limit.toString(),
    ordering: 'name',
  })
  const res = await fetch(`${WGER_BASE_URL}/exercise/?${params}`, {
    headers: buildHeaders(),
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data = (await res.json()) as WgerExerciseListResponse
  return data.results ?? []
}

async function fetchMainImage(exerciseBaseId: number): Promise<string | null> {
  const res = await fetch(
    `${WGER_BASE_URL}/exerciseimage/?exercise_base=${exerciseBaseId}&format=json&limit=2`,
    { headers: buildHeaders(), next: { revalidate: 86400 } }
  )
  if (!res.ok) return null
  const data = (await res.json()) as WgerImageListResponse
  const img = data.results.find((i) => i.is_main) ?? data.results[0]
  return img?.image ?? null
}

// Fetches a list of exercises with images for the given plan type and count.
export async function fetchPlannedExercises(
  type: WorkoutPlanType,
  count: number
): Promise<PlannedExercise[]> {
  const categories = PLAN_CATEGORY_IDS[type]
  const perCategory = Math.ceil(count / categories.length)

  let categoryResults: WgerExerciseRaw[][]

  try {
    categoryResults = await Promise.all(
      categories.map((catId) => fetchExercisesByCategory(catId, perCategory))
    )
  } catch {
    return getLocalPlannedExercises(type, count)
  }

  // Deduplicate across categories
  const seen = new Set<number>()
  const unique: WgerExerciseRaw[] = []
  for (const exercises of categoryResults) {
    for (const ex of exercises) {
      if (!seen.has(ex.id)) {
        seen.add(ex.id)
        unique.push(ex)
        if (unique.length >= count) break
      }
    }
    if (unique.length >= count) break
  }

  if (unique.length === 0) {
    return getLocalPlannedExercises(type, count)
  }

  // Fetch images in parallel
  const planned: PlannedExercise[] = await Promise.all(
    unique.slice(0, count).map(async (ex) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category?.name ?? '',
      imageUrl: await fetchMainImage(ex.id),
    }))
  )

  if (planned.length >= count) return planned

  const localFallback = getLocalPlannedExercises(type, count)
  const seenIds = new Set(planned.map((exercise) => exercise.id))
  const fill = localFallback.filter((exercise) => !seenIds.has(exercise.id))

  return [...planned, ...fill].slice(0, count)
}

// Searches wger exercises and returns normalized suggestions for the UI autocomplete.
export async function searchWgerExercises(query: string, limit = 10): Promise<ExerciseSuggestion[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const localFallback = searchLocalExercises(normalizedQuery, limit)

  const params = new URLSearchParams({ term: normalizedQuery })

  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  if (process.env.WGER_API_KEY) {
    headers.Authorization = `Token ${process.env.WGER_API_KEY}`
  }

  let response: Response

  try {
    response = await fetch(`${WGER_BASE_URL}/exercise/search/?${params.toString()}`, {
      headers,
      next: { revalidate: 3600 },
    })
  } catch {
    return localFallback
  }

  if (!response.ok) {
    return localFallback
  }

  const payload = (await response.json()) as WgerSearchResponse

  const wgerResults = payload.suggestions
    .map((item, index) => {
      const name = item.data?.name || item.value || ''
      const id = item.data?.id ?? index
      return {
        id,
        name: name.trim(),
      }
    })
    .filter((item) => item.name.length > 0)

  const seenNames = new Set(wgerResults.map((item) => item.name.toLowerCase()))
  const merged = [
    ...wgerResults,
    ...localFallback.filter((item) => !seenNames.has(item.name.toLowerCase())),
  ]

  return merged.slice(0, limit)
}
