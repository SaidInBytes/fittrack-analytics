'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Weekday, Workout } from '@/types'

type WorkoutType = Workout['type']

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

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

interface TemplateFormState {
  name: string
  type: WorkoutType
  duration: string
  exerciseName: string
  sets: string
  reps: string
  weight: string
  scheduleDays: Weekday[]
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

const initialTemplateForm: TemplateFormState = {
  name: '',
  type: 'strength',
  duration: '',
  exerciseName: '',
  sets: '',
  reps: '',
  weight: '',
  scheduleDays: ['monday'],
}

export default function WorkoutsPage() {
  const router = useRouter()
  const { status } = useSession()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [templates, setTemplates] = useState<Workout[]>([])
  const [form, setForm] = useState<WorkoutFormState>(initialForm)
  const [templateForm, setTemplateForm] = useState<TemplateFormState>(initialTemplateForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingExercises, setIsSearchingExercises] = useState(false)
  const [exerciseSuggestions, setExerciseSuggestions] = useState<Array<{ id: number; name: string }>>([])
  const [hasSearchedExercises, setHasSearchedExercises] = useState(false)
  const [isTemplateSubmitting, setIsTemplateSubmitting] = useState(false)
  const [error, setError] = useState('')
  const skipNextExerciseSearch = useRef(false)

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
        const [workoutsRes, templatesRes] = await Promise.all([
          fetch('/api/workouts', { cache: 'no-store' }),
          fetch('/api/workouts/templates', { cache: 'no-store' }),
        ])

        if (!workoutsRes.ok || !templatesRes.ok) {
          throw new Error('Failed to load workouts')
        }

        const [workoutsData, templatesData] = await Promise.all([workoutsRes.json(), templatesRes.json()])
        if (!cancelled) {
          setWorkouts(workoutsData)
          setTemplates(templatesData)
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

  useEffect(() => {
    if (form.type !== 'strength') {
      setExerciseSuggestions([])
      setHasSearchedExercises(false)
      return
    }

    if (skipNextExerciseSearch.current) {
      skipNextExerciseSearch.current = false
      setIsSearchingExercises(false)
      setHasSearchedExercises(false)
      return
    }

    const query = form.exerciseName.trim()

    if (query.length < 2) {
      setExerciseSuggestions([])
      setHasSearchedExercises(false)
      return
    }

    let cancelled = false

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingExercises(true)

      try {
        const res = await fetch(`/api/exercises/search?query=${encodeURIComponent(query)}`)

        if (!res.ok) {
          throw new Error('Failed to search exercises')
        }

        const data = await res.json()

        if (!cancelled) {
          setExerciseSuggestions(Array.isArray(data) ? data : [])
          setHasSearchedExercises(true)
        }
      } catch {
        if (!cancelled) {
          setExerciseSuggestions([])
          setHasSearchedExercises(true)
        }
      } finally {
        if (!cancelled) {
          setIsSearchingExercises(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [form.exerciseName, form.type])

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

  function toggleTemplateDay(day: Weekday) {
    setTemplateForm((prev) => {
      const exists = prev.scheduleDays.includes(day)
      const nextDays = exists
        ? prev.scheduleDays.filter((currentDay) => currentDay !== day)
        : [...prev.scheduleDays, day]

      return {
        ...prev,
        scheduleDays: nextDays,
      }
    })
  }

  async function handleTemplateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const duration = Number(templateForm.duration)
    const sets = Number(templateForm.sets)
    const reps = Number(templateForm.reps)
    const weight = Number(templateForm.weight)
    const isStrength = templateForm.type === 'strength'

    if (!templateForm.name || templateForm.scheduleDays.length === 0) {
      setError('Please provide a workout name and at least one schedule day.')
      return
    }

    if (!isStrength && (Number.isNaN(duration) || duration <= 0)) {
      setError('Duration must be a positive number for this workout type.')
      return
    }

    if (
      isStrength &&
      (!templateForm.exerciseName || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0)
    ) {
      setError('For strength workouts, exercise name, sets and reps are required.')
      return
    }

    setIsTemplateSubmitting(true)

    try {
      const res = await fetch('/api/workouts/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateForm.name,
          type: templateForm.type,
          duration: isStrength ? 0 : duration,
          scheduleDays: templateForm.scheduleDays,
          exercises: isStrength
            ? [
                {
                  exerciseName: templateForm.exerciseName,
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
        setError(created.error || 'Could not create workout template.')
        return
      }

      setTemplates((prev) => [created, ...prev])
      setTemplateForm(initialTemplateForm)
    } catch {
      setError('Could not create workout template right now.')
    } finally {
      setIsTemplateSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workouts</h1>
        <p className="text-muted-foreground">
          Save your permanent workout schedule and log completed sessions.
        </p>
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

                {form.exerciseName.trim().length >= 2 && !isSearchingExercises && exerciseSuggestions.length > 0 && (
                  <div className="md:col-span-4 max-h-48 overflow-y-auto rounded-md border border-border bg-background p-1">
                    {exerciseSuggestions.map((exercise) => (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => {
                          skipNextExerciseSearch.current = true
                          setForm((prev) => ({ ...prev, exerciseName: exercise.name }))
                          setExerciseSuggestions([])
                          setHasSearchedExercises(false)
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        {exercise.name}
                      </button>
                    ))}
                  </div>
                )}

                {isSearchingExercises && (
                  <p className="md:col-span-4 text-xs text-muted-foreground">Searching wger exercises...</p>
                )}

                {!isSearchingExercises &&
                  hasSearchedExercises &&
                  form.exerciseName.trim().length >= 2 &&
                  exerciseSuggestions.length === 0 && (
                    <p className="md:col-span-4 text-xs text-muted-foreground">
                      No exercises found from API for this search.
                    </p>
                  )}

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
          <CardTitle>My Workout Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleTemplateSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              type="text"
              placeholder="Template name"
              value={templateForm.name}
              onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <select
              value={templateForm.type}
              onChange={(e) =>
                setTemplateForm((prev) => ({ ...prev, type: e.target.value as WorkoutType }))
              }
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="mixed">Mixed</option>
            </select>

            {templateForm.type === 'strength' ? (
              <>
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={templateForm.exerciseName}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({ ...prev, exerciseName: e.target.value }))
                  }
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Sets"
                  value={templateForm.sets}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, sets: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Reps"
                  value={templateForm.reps}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, reps: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Weight (optional)"
                  value={templateForm.weight}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, weight: e.target.value }))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </>
            ) : (
              <input
                type="number"
                min="1"
                placeholder="Duration (minutes)"
                value={templateForm.duration}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, duration: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            )}

            <div className="md:col-span-4">
              <p className="mb-2 text-sm font-medium">Repeat on</p>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const isActive = templateForm.scheduleDays.includes(day.value)

                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleTemplateDay(day.value)}
                      className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-4">
              <Button type="submit" disabled={isTemplateSubmitting}>
                {isTemplateSubmitting ? 'Saving...' : 'Save Schedule'}
              </Button>
            </div>
          </form>

          <div className="space-y-3 border-t border-border pt-4">
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No saved schedule yet. Create one above and it will stay here.
              </p>
            )}

            {templates.map((template) => (
              <div key={template._id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {template.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(template.scheduleDays ?? [])
                    .map((day) => day.slice(0, 1).toUpperCase() + day.slice(1))
                    .join(', ')}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {template.type === 'strength' && template.exercises.length > 0
                    ? `${template.exercises[0].sets} sets x ${template.exercises[0].reps} reps`
                    : `${template.duration} min`}
                </p>
              </div>
            ))}
          </div>
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
