'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Apple, Beef, Flame, Wheat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import type { Meal, Nutrition } from '@/types'

type MealType = Meal['mealType']
type NutritionInputMode = 'serving' | 'per100g'

interface NutritionFormState {
  date: string
  mealType: MealType
  inputMode: NutritionInputMode
  foodName: string
  calories: string
  protein: string
  carbs: string
  fat: string
  servings: string
  grams: string
}

const initialForm: NutritionFormState = {
  date: new Date().toISOString().slice(0, 10),
  mealType: 'breakfast',
  inputMode: 'serving',
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  servings: '1',
  grams: '100',
}

interface FoodSuggestion {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function NutritionPage() {
  const [nutritionEntries, setNutritionEntries] = useState<Nutrition[]>([])
  const [form, setForm] = useState<NutritionFormState>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingFoods, setIsSearchingFoods] = useState(false)
  const [foodSuggestions, setFoodSuggestions] = useState<FoodSuggestion[]>([])
  const [hasSearchedFoods, setHasSearchedFoods] = useState(false)
  const [error, setError] = useState('')
  const skipNextFoodSearch = useRef(false)
  const latestEntry = nutritionEntries[0]

  useEffect(() => {
    let cancelled = false

    async function loadNutrition() {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch('/api/nutrition', { cache: 'no-store' })

        if (!res.ok) {
          throw new Error('Failed to load nutrition entries')
        }

        const data = await res.json()

        if (!cancelled) {
          setNutritionEntries(data)
        }
      } catch {
        if (!cancelled) {
          setError('Could not fetch nutrition logs right now.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadNutrition()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (skipNextFoodSearch.current) {
      skipNextFoodSearch.current = false
      setIsSearchingFoods(false)
      setHasSearchedFoods(false)
      return
    }

    const query = form.foodName.trim()

    if (query.length < 2) {
      setFoodSuggestions([])
      setHasSearchedFoods(false)
      return
    }

    let cancelled = false

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingFoods(true)

      try {
        const res = await fetch(`/api/nutrition/search-food?query=${encodeURIComponent(query)}`)

        if (!res.ok) {
          throw new Error('Failed to search foods')
        }

        const data = await res.json()

        if (!cancelled) {
          setFoodSuggestions(Array.isArray(data) ? data : [])
          setHasSearchedFoods(true)
        }
      } catch {
        if (!cancelled) {
          setFoodSuggestions([])
          setHasSearchedFoods(true)
        }
      } finally {
        if (!cancelled) {
          setIsSearchingFoods(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [form.foodName])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const calories = Number(form.calories)
    const protein = Number(form.protein)
    const carbs = Number(form.carbs)
    const fat = Number(form.fat)
    const servings = Number(form.servings)
    const grams = Number(form.grams)

    if (!form.foodName.trim() || !form.date) {
      setError('Date and food name are required.')
      return
    }

    if ([calories, protein, carbs, fat].some((value) => Number.isNaN(value))) {
      setError('Nutrition values must be valid numbers.')
      return
    }

    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
      setError('Nutrition values must be zero or greater.')
      return
    }

    if (form.inputMode === 'serving' && (Number.isNaN(servings) || servings <= 0)) {
      setError('Servings must be greater than 0 in per serving mode.')
      return
    }

    if (form.inputMode === 'per100g' && (Number.isNaN(grams) || grams <= 0)) {
      setError('Grams must be greater than 0 in per 100g mode.')
      return
    }

    const factor = form.inputMode === 'per100g' ? grams / 100 : 1
    const normalizedCalories = calories * factor
    const normalizedProtein = protein * factor
    const normalizedCarbs = carbs * factor
    const normalizedFat = fat * factor
    const normalizedServings = form.inputMode === 'per100g' ? 1 : servings

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          meals: [
            {
              mealType: form.mealType,
              foods: [
                {
                  name: form.foodName.trim(),
                  calories: normalizedCalories,
                  protein: normalizedProtein,
                  carbs: normalizedCarbs,
                  fat: normalizedFat,
                  servings: normalizedServings,
                },
              ],
            },
          ],
        }),
      })

      const created = await res.json()

      if (!res.ok) {
        setError(created.error || 'Could not create nutrition log.')
        return
      }

      setNutritionEntries((prev) => [created, ...prev])
      setForm((prev) => ({ ...initialForm, date: prev.date }))
    } catch {
      setError('Could not create nutrition log right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Nutrition"
        description="Log meals and keep calories, protein, carbs and fats visible while you train."
        eyebrow="Fuel board"
        icon={Apple}
        meta={latestEntry ? `${Math.round(latestEntry.totals.calories)} kcal latest log` : 'No logs yet'}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Calories', value: latestEntry ? Math.round(latestEntry.totals.calories) : 0, suffix: 'kcal', icon: Flame },
          { label: 'Protein', value: latestEntry ? Math.round(latestEntry.totals.protein) : 0, suffix: 'g', icon: Beef },
          { label: 'Carbs', value: latestEntry ? Math.round(latestEntry.totals.carbs) : 0, suffix: 'g', icon: Wheat },
          { label: 'Fat', value: latestEntry ? Math.round(latestEntry.totals.fat) : 0, suffix: 'g', icon: Apple },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
              <div className="rounded-md bg-secondary p-2 text-secondary-foreground">
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">
              {item.value}
              <span className="ml-1 text-sm text-muted-foreground">{item.suffix}</span>
            </p>
          </Card>
        ))}
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add meal entry</CardTitle>
          <p className="text-sm text-muted-foreground">Search a food or enter macros manually.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
              required
            />
            <select
              value={form.mealType}
              onChange={(e) => setForm((prev) => ({ ...prev, mealType: e.target.value as MealType }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <select
              value={form.inputMode}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, inputMode: e.target.value as NutritionInputMode }))
              }
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            >
              <option value="serving">Per serving</option>
              <option value="per100g">Per 100g</option>
            </select>
            <input
              type="text"
              placeholder="Food name"
              value={form.foodName}
              onChange={(e) => setForm((prev) => ({ ...prev, foodName: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
              required
            />

            {form.foodName.trim().length >= 2 && !isSearchingFoods && foodSuggestions.length > 0 && (
              <div className="md:col-span-4 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-sm">
                {foodSuggestions.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => {
                      skipNextFoodSearch.current = true
                      setForm((prev) => ({
                        ...prev,
                        foodName: food.name,
                        inputMode: 'per100g',
                        calories: String(Math.round(food.calories)),
                        protein: String(food.protein),
                        carbs: String(food.carbs),
                        fat: String(food.fat),
                        grams: '100',
                      }))
                      setFoodSuggestions([])
                      setHasSearchedFoods(false)
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <p className="font-medium">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(food.calories)} kcal • P {food.protein}g • C {food.carbs}g • F {food.fat}g
                    </p>
                  </button>
                ))}
              </div>
            )}

            {isSearchingFoods && (
              <p className="md:col-span-4 text-xs text-muted-foreground">Searching foods from API...</p>
            )}

            {!isSearchingFoods &&
              hasSearchedFoods &&
              form.foodName.trim().length >= 2 &&
              foodSuggestions.length === 0 && (
                <p className="md:col-span-4 text-xs text-muted-foreground">
                  No foods found from API for this search.
                </p>
              )}

            <input
              type="number"
              min="0"
              step="1"
              placeholder={form.inputMode === 'per100g' ? 'Calories (per 100g)' : 'Calories (per serving)'}
              value={form.calories}
              onChange={(e) => setForm((prev) => ({ ...prev, calories: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder={
                form.inputMode === 'per100g' ? 'Protein (g per 100g)' : 'Protein (g per serving)'
              }
              value={form.protein}
              onChange={(e) => setForm((prev) => ({ ...prev, protein: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder={form.inputMode === 'per100g' ? 'Carbs (g per 100g)' : 'Carbs (g per serving)'}
              value={form.carbs}
              onChange={(e) => setForm((prev) => ({ ...prev, carbs: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder={form.inputMode === 'per100g' ? 'Fat (g per 100g)' : 'Fat (g per serving)'}
              value={form.fat}
              onChange={(e) => setForm((prev) => ({ ...prev, fat: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
              required
            />

            {form.inputMode === 'serving' ? (
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Servings"
                value={form.servings}
                onChange={(e) => setForm((prev) => ({ ...prev, servings: e.target.value }))}
                className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
                required
              />
            ) : (
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Amount (g)"
                value={form.grams}
                onChange={(e) => setForm((prev) => ({ ...prev, grams: e.target.value }))}
                className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
                required
              />
            )}

            <div className="md:col-span-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Nutrition Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition history</CardTitle>
          <p className="text-sm text-muted-foreground">Recent intake snapshots.</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading nutrition logs...</p>}

          {!isLoading && nutritionEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No nutrition logs yet. Add your first meal above.</p>
          )}

          {!isLoading &&
            nutritionEntries.map((entry) => (
              <div key={entry._id} className="rounded-md border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  <p className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {entry.meals.length} meal(s)
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-md bg-card p-2"><p className="font-semibold">{Math.round(entry.totals.calories)}</p><p className="text-muted-foreground">kcal</p></div>
                  <div className="rounded-md bg-card p-2"><p className="font-semibold">{Math.round(entry.totals.protein)}g</p><p className="text-muted-foreground">P</p></div>
                  <div className="rounded-md bg-card p-2"><p className="font-semibold">{Math.round(entry.totals.carbs)}g</p><p className="text-muted-foreground">C</p></div>
                  <div className="rounded-md bg-card p-2"><p className="font-semibold">{Math.round(entry.totals.fat)}g</p><p className="text-muted-foreground">F</p></div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
