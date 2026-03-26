'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Meal, Nutrition } from '@/types'

type MealType = Meal['mealType']

interface NutritionFormState {
  date: string
  mealType: MealType
  foodName: string
  calories: string
  protein: string
  carbs: string
  fat: string
  servings: string
}

const initialForm: NutritionFormState = {
  date: new Date().toISOString().slice(0, 10),
  mealType: 'breakfast',
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  servings: '1',
}

export default function NutritionPage() {
  const router = useRouter()
  const { status } = useSession()
  const [nutritionEntries, setNutritionEntries] = useState<Nutrition[]>([])
  const [form, setForm] = useState<NutritionFormState>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status !== 'authenticated') {
      return
    }

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
  }, [router, status])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const calories = Number(form.calories)
    const protein = Number(form.protein)
    const carbs = Number(form.carbs)
    const fat = Number(form.fat)
    const servings = Number(form.servings)

    if (!form.foodName.trim() || !form.date) {
      setError('Date and food name are required.')
      return
    }

    if (
      [calories, protein, carbs, fat, servings].some((value) => Number.isNaN(value)) ||
      calories < 0 ||
      protein < 0 ||
      carbs < 0 ||
      fat < 0 ||
      servings <= 0
    ) {
      setError('Nutrition values must be valid numbers and servings must be greater than 0.')
      return
    }

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
                  calories,
                  protein,
                  carbs,
                  fat,
                  servings,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nutrition</h1>
        <p className="text-muted-foreground">Log meals and track your daily calories and macros.</p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Meal Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <select
              value={form.mealType}
              onChange={(e) => setForm((prev) => ({ ...prev, mealType: e.target.value as MealType }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <input
              type="text"
              placeholder="Food name"
              value={form.foodName}
              onChange={(e) => setForm((prev) => ({ ...prev, foodName: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Calories"
              value={form.calories}
              onChange={(e) => setForm((prev) => ({ ...prev, calories: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Protein (g)"
              value={form.protein}
              onChange={(e) => setForm((prev) => ({ ...prev, protein: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Carbs (g)"
              value={form.carbs}
              onChange={(e) => setForm((prev) => ({ ...prev, carbs: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Fat (g)"
              value={form.fat}
              onChange={(e) => setForm((prev) => ({ ...prev, fat: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Servings"
              value={form.servings}
              onChange={(e) => setForm((prev) => ({ ...prev, servings: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
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
          <CardTitle>Nutrition History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading nutrition logs...</p>}

          {!isLoading && nutritionEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No nutrition logs yet. Add your first meal above.</p>
          )}

          {!isLoading &&
            nutritionEntries.map((entry) => (
              <div key={entry._id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground">{entry.meals.length} meal(s)</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {Math.round(entry.totals.calories)} kcal • P {Math.round(entry.totals.protein)}g • C{' '}
                  {Math.round(entry.totals.carbs)}g • F {Math.round(entry.totals.fat)}g
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
