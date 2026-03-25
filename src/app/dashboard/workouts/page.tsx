'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Workout } from '@/types'

type WorkoutType = Workout['type']

interface WorkoutFormState {
  name: string
  type: WorkoutType
  duration: string
  exerciseName: string
  sets: string
  reps: string
  weight: string
  date: string
}

const initialForm: WorkoutFormState = {
  name: '',
  type: 'strength',
  duration: '',
  exerciseName: '',
  sets: '',
  reps: '',
  weight: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function WorkoutsPage() {
  const router = useRouter()
  const { status } = useSession()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [form, setForm] = useState<WorkoutFormState>(initialForm)
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

    async function loadWorkouts() {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch('/api/workouts', { cache: 'no-store' })

        if (!res.ok) {
          throw new Error('Failed to load workouts')
        }

        const data = await res.json()
        if (!cancelled) {
          setWorkouts(data)
        }
      } catch {
        if (!cancelled) {
          setError('Could not fetch workouts right now.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadWorkouts()

    return () => {
      cancelled = true
    }
  }, [router, status])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const duration = Number(form.duration)
    const sets = Number(form.sets)
    const reps = Number(form.reps)
    const weight = Number(form.weight)
    const isStrength = form.type === 'strength'

    if (!form.name || !form.date) {
      setError('Please fill in all fields with valid values.')
      return
    }

    if (!isStrength && (Number.isNaN(duration) || duration <= 0)) {
      setError('Duration must be a positive number for this workout type.')
      return
    }

    if (
      isStrength &&
      (!form.exerciseName || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0)
    ) {
      setError('For strength workouts, exercise name, sets and reps are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          duration: isStrength ? 0 : duration,
          date: form.date,
          exercises: isStrength
            ? [
                {
                  exerciseName: form.exerciseName,
                  sets,
                  reps,
                  weight: Number.isNaN(weight) ? 0 : weight,
                },
              ]
            : [],
        }),
      })

      const created = await res.json()

      if (!res.ok) {
        setError(created.error || 'Could not create workout.')
        return
      }

      setWorkouts((prev) => [created, ...prev])
      setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) })
    } catch {
      setError('Could not create workout right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workouts</h1>
        <p className="text-muted-foreground">Log new sessions and review your training history.</p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              placeholder="Workout name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as WorkoutType }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="mixed">Mixed</option>
            </select>
            {form.type === 'strength' ? (
              <>
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={form.exerciseName}
                  onChange={(e) => setForm((prev) => ({ ...prev, exerciseName: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Sets"
                  value={form.sets}
                  onChange={(e) => setForm((prev) => ({ ...prev, sets: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Reps"
                  value={form.reps}
                  onChange={(e) => setForm((prev) => ({ ...prev, reps: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Weight (optional)"
                  value={form.weight}
                  onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </>
            ) : (
              <input
                type="number"
                min="1"
                placeholder="Duration (minutes)"
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            )}
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <div className="md:col-span-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading workouts...</p>}

          {!isLoading && workouts.length === 0 && (
            <p className="text-sm text-muted-foreground">No workouts yet. Add your first session above.</p>
          )}

          {!isLoading &&
            workouts.map((workout) => (
              <div key={workout._id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{workout.name}</h3>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {workout.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {workout.type === 'strength' && workout.exercises.length > 0
                    ? `${workout.exercises[0].sets} sets x ${workout.exercises[0].reps} reps`
                    : `${workout.duration} min`}{' '}
                  • {format(new Date(workout.date), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
