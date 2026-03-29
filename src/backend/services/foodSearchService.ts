interface WgerIngredient {
  id: number
  name?: string
  energy?: number
  protein?: string | number
  carbohydrates?: string | number
  fat?: string | number
}

interface WgerIngredientResponse {
  results?: WgerIngredient[]
}

export interface FoodSuggestion {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Searches food ingredients from wger and maps them to app-friendly nutrition values.
export async function searchFoods(query: string, limit = 8): Promise<FoodSuggestion[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const params = new URLSearchParams({
    name: normalizedQuery,
    limit: String(limit),
  })

  const response = await fetch(`https://wger.de/api/v2/ingredient/?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`food search request failed: ${response.status}`)
  }

  const payload = (await response.json()) as WgerIngredientResponse

  return (payload.results || [])
    .map((ingredient) => {
      const name = (ingredient.name || '').trim()

      return {
        id: ingredient.id,
        name,
        calories: Number(ingredient.energy || 0),
        protein: Number(ingredient.protein || 0),
        carbs: Number(ingredient.carbohydrates || 0),
        fat: Number(ingredient.fat || 0),
      }
    })
    .filter((item) => item.name.length > 0)
}
