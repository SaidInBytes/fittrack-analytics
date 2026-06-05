'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { ArrowRight, CalendarDays, Check, Clock3, Dumbbell, ListChecks, Play, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
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

interface WorkoutFormErrors {
  name?: string
  duration?: string
  exerciseName?: string
  sets?: string
  reps?: string
  date?: string
}

interface TemplateFormErrors {
  name?: string
  scheduleDays?: string
  duration?: string
  exerciseName?: string
  sets?: string
  reps?: string
}

interface SetLog {
  weight: string
  reps: string
}

interface ActiveWorkout {
  template: Workout
  exerciseIndex: number
  setLogs: SetLog[][]
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

function inputCls(hasError?: string) {
  return `w-full rounded-md border bg-background/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
    hasError ? 'border-destructive focus:ring-destructive/50' : 'border-input'
  }`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-xs text-destructive">
      {message}
    </p>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-md border border-border p-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="h-4 w-1/3 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
      <div className="h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

function createSetLogs(template: Workout): SetLog[][] {
  return template.exercises.map((exercise) =>
    Array.from({ length: Math.max(1, exercise.sets) }, () => ({
      weight: exercise.weight > 0 ? String(exercise.weight) : '',
      reps: exercise.reps > 0 ? String(exercise.reps) : '',
    }))
  )
}

function formatExerciseSummary(workout: Workout) {
  if (workout.type !== 'strength' || workout.exercises.length === 0) {
    return `${workout.duration} min`
  }

  return workout.exercises
    .map((exercise) => `${exercise.exerciseName}: ${exercise.sets} sets x ${exercise.reps} reps`)
    .join(' · ')
}

function formatSetNotes(setLogs: SetLog[]) {
  return setLogs
    .map((set, index) => {
      const weight = Number(set.weight) || 0
      const reps = Number(set.reps) || 0
      return `Set ${index + 1}: ${weight} kg x ${reps} reps`
    })
    .join('; ')
}

export default function WorkoutsPage() {
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
  const [templateActionId, setTemplateActionId] = useState<string | null>(null)
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null)
  const [activeWorkoutError, setActiveWorkoutError] = useState('')
  const [serverError, setServerError] = useState('')
  const [workoutErrors, setWorkoutErrors] = useState<WorkoutFormErrors>({})
  const [templateErrors, setTemplateErrors] = useState<TemplateFormErrors>({})
  const skipNextExerciseSearch = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function loadWorkouts() {
      setIsLoading(true)
      setServerError('')

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
          setServerError('Could not fetch workouts right now.')
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
  }, [])

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
    setServerError('')

    const duration = Number(form.duration)
    const sets = Number(form.sets)
    const reps = Number(form.reps)
    const weight = Number(form.weight)
    const isStrength = form.type === 'strength'

    const errors: WorkoutFormErrors = {}
    if (!form.name.trim()) errors.name = 'Workout name is required.'
    if (!form.date) errors.date = 'Date is required.'
    if (!isStrength && (Number.isNaN(duration) || duration <= 0))
      errors.duration = 'Enter a positive duration in minutes.'
    if (isStrength) {
      if (!form.exerciseName.trim()) errors.exerciseName = 'Exercise name is required.'
      if (Number.isNaN(sets) || sets <= 0) errors.sets = 'Enter a positive number of sets.'
      if (Number.isNaN(reps) || reps <= 0) errors.reps = 'Enter a positive number of reps.'
    }

    if (Object.keys(errors).length > 0) {
      setWorkoutErrors(errors)
      return
    }

    setWorkoutErrors({})
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
        setServerError(created.error || 'Could not create workout.')
        return
      }

      setWorkouts((prev) => [created, ...prev])
      setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) })
    } catch {
      setServerError('Could not create workout right now.')
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
    setServerError('')

    const duration = Number(templateForm.duration)
    const sets = Number(templateForm.sets)
    const reps = Number(templateForm.reps)
    const weight = Number(templateForm.weight)
    const isStrength = templateForm.type === 'strength'

    const errors: TemplateFormErrors = {}
    if (!templateForm.name.trim()) errors.name = 'Template name is required.'
    if (templateForm.scheduleDays.length === 0) errors.scheduleDays = 'Select at least one day.'
    if (!isStrength && (Number.isNaN(duration) || duration <= 0))
      errors.duration = 'Enter a positive duration in minutes.'
    if (isStrength) {
      if (!templateForm.exerciseName.trim()) errors.exerciseName = 'Exercise name is required.'
      if (Number.isNaN(sets) || sets <= 0) errors.sets = 'Enter a positive number of sets.'
      if (Number.isNaN(reps) || reps <= 0) errors.reps = 'Enter a positive number of reps.'
    }

    if (Object.keys(errors).length > 0) {
      setTemplateErrors(errors)
      return
    }

    setTemplateErrors({})
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
        setServerError(created.error || 'Could not create workout template.')
        return
      }

      setTemplates((prev) => [created, ...prev])
      setTemplateForm(initialTemplateForm)
    } catch {
      setServerError('Could not create workout template right now.')
    } finally {
      setIsTemplateSubmitting(false)
    }
  }

  async function handleDeleteTemplate(id: string) {
    setTemplateActionId(id)
    try {
      const res = await fetch(`/api/workouts/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setServerError(data.error || 'Could not delete template.')
        return
      }
      setTemplates((prev) => prev.filter((t) => t._id !== id))
    } catch {
      setServerError('Could not delete template right now.')
    } finally {
      setTemplateActionId(null)
    }
  }

  async function handleLogTemplate(id: string) {
    setTemplateActionId(id)
    try {
      const res = await fetch(`/api/workouts/templates/${id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error || 'Could not log workout.')
        return
      }
      setWorkouts((prev) => [data, ...prev])
    } catch {
      setServerError('Could not log workout right now.')
    } finally {
      setTemplateActionId(null)
    }
  }

  function handleStartTemplate(template: Workout) {
    if (template.type !== 'strength' || template.exercises.length === 0) {
      handleLogTemplate(template._id)
      return
    }

    setActiveWorkout({
      template,
      exerciseIndex: 0,
      setLogs: createSetLogs(template),
    })
    setActiveWorkoutError('')
    setServerError('')
  }

  function updateActiveSet(setIndex: number, field: keyof SetLog, value: string) {
    setActiveWorkout((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        setLogs: prev.setLogs.map((exerciseLogs, exerciseIndex) =>
          exerciseIndex === prev.exerciseIndex
            ? exerciseLogs.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, [field]: value } : set
              )
            : exerciseLogs
        ),
      }
    })
  }

  async function completeActiveExercise() {
    if (!activeWorkout) return

    const currentLogs = activeWorkout.setLogs[activeWorkout.exerciseIndex] ?? []
    const hasInvalidSet = currentLogs.some((set) => {
      const weight = Number(set.weight)
      const reps = Number(set.reps)
      return Number.isNaN(weight) || weight < 0 || Number.isNaN(reps) || reps <= 0
    })

    if (hasInvalidSet) {
      setActiveWorkoutError('Enter valid kg and reps for every set before continuing.')
      return
    }

    setActiveWorkoutError('')

    const isLastExercise = activeWorkout.exerciseIndex >= activeWorkout.template.exercises.length - 1
    if (!isLastExercise) {
      setActiveWorkout((prev) => (prev ? { ...prev, exerciseIndex: prev.exerciseIndex + 1 } : prev))
      return
    }

    setTemplateActionId(activeWorkout.template._id)

    try {
      const completedExercises = activeWorkout.template.exercises.map((exercise, index) => {
        const logs = activeWorkout.setLogs[index] ?? []
        const completedSets = logs.filter((set) => Number(set.reps) > 0)
        const lastSet = completedSets[completedSets.length - 1]
        const totalReps = completedSets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0)
        const averageReps = Math.max(1, Math.round(totalReps / Math.max(completedSets.length, 1)))

        return {
          exerciseName: exercise.exerciseName,
          sets: Math.max(1, completedSets.length),
          reps: averageReps,
          weight: Number(lastSet?.weight) || 0,
          notes: formatSetNotes(logs),
        }
      })

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeWorkout.template.name.replace(/\s*template\s*$/i, ''),
          type: activeWorkout.template.type,
          duration: activeWorkout.template.duration,
          date: new Date().toISOString().slice(0, 10),
          exercises: completedExercises,
          notes: `Completed from template: ${activeWorkout.template.name}`,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setActiveWorkoutError(data.error || 'Could not save completed workout.')
        return
      }

      setWorkouts((prev) => [data, ...prev])
      setActiveWorkout(null)
    } catch {
      setActiveWorkoutError('Could not save completed workout right now.')
    } finally {
      setTemplateActionId(null)
    }
  }

  const totalWorkoutMinutes = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0)
  const strengthSessions = workouts.filter((workout) => workout.type === 'strength').length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Workouts"
        description="Build recurring structure, save templates and keep completed sessions in one clean log."
        eyebrow="Training ledger"
        icon={Dumbbell}
        meta={`${workouts.length} logged sessions`}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Logged sessions', value: String(workouts.length), icon: ListChecks },
          { label: 'Workout minutes', value: String(totalWorkoutMinutes), icon: Clock3 },
          { label: 'Saved templates', value: String(templates.length), icon: CalendarDays },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
              <div className="rounded-md bg-secondary p-2 text-secondary-foreground">
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </div>

      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      {activeWorkout && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Active workout</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {activeWorkout.template.name} · Exercise {activeWorkout.exerciseIndex + 1} of{' '}
                  {activeWorkout.template.exercises.length}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveWorkout(null)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const exercise = activeWorkout.template.exercises[activeWorkout.exerciseIndex]
              const currentLogs = activeWorkout.setLogs[activeWorkout.exerciseIndex] ?? []
              const isLastExercise = activeWorkout.exerciseIndex >= activeWorkout.template.exercises.length - 1
              const isSaving = templateActionId === activeWorkout.template._id

              return (
                <>
                  <div className="rounded-lg border border-border bg-background/90 p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Current exercise</p>
                    <h3 className="mt-1 text-2xl font-semibold">{exercise.exerciseName}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Target: {exercise.sets} sets x {exercise.reps} reps
                      {exercise.weight > 0 ? ` · ${exercise.weight} kg starting weight` : ''}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {currentLogs.map((set, index) => (
                      <div key={index} className="rounded-md border border-border bg-background/80 p-3">
                        <p className="mb-2 text-sm font-semibold">Set {index + 1}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Kg
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={set.weight}
                              onChange={(e) => updateActiveSet(index, 'weight', e.target.value)}
                              className={`${inputCls()} mt-1`}
                            />
                          </label>
                          <label className="text-xs font-medium text-muted-foreground">
                            Reps
                            <input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) => updateActiveSet(index, 'reps', e.target.value)}
                              className={`${inputCls()} mt-1`}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeWorkoutError && (
                    <p role="alert" className="text-sm text-destructive">
                      {activeWorkoutError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {activeWorkout.template.exercises.map((item, index) => (
                        <span
                          key={`${item.exerciseName}-${index}`}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            index === activeWorkout.exerciseIndex
                              ? 'bg-primary text-primary-foreground'
                              : index < activeWorkout.exerciseIndex
                                ? 'bg-secondary text-secondary-foreground'
                                : 'bg-background text-muted-foreground'
                          }`}
                        >
                          {index + 1}. {item.exerciseName}
                        </span>
                      ))}
                    </div>
                    <Button onClick={completeActiveExercise} disabled={isSaving}>
                      {isSaving ? (
                        'Saving...'
                      ) : isLastExercise ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Finish workout
                        </>
                      ) : (
                        <>
                          Finish exercise
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* ── Add Workout ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Add workout</CardTitle>
          <p className="text-sm text-muted-foreground">Log a completed session with just the fields that matter.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Name */}
            <div className="flex flex-col">
              <label htmlFor="wf-name" className="mb-1 text-xs font-medium text-muted-foreground">
                Workout name
              </label>
              <input
                id="wf-name"
                type="text"
                placeholder="e.g. Morning run"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                aria-invalid={!!workoutErrors.name}
                aria-describedby={workoutErrors.name ? 'wf-name-err' : undefined}
                className={inputCls(workoutErrors.name)}
              />
              <FieldError id="wf-name-err" message={workoutErrors.name} />
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label htmlFor="wf-type" className="mb-1 text-xs font-medium text-muted-foreground">
                Type
              </label>
              <select
                id="wf-type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as WorkoutType }))}
                className={inputCls()}
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {form.type === 'strength' ? (
              <>
                {/* Exercise name */}
                <div className="flex flex-col">
                  <label htmlFor="wf-exercise" className="mb-1 text-xs font-medium text-muted-foreground">
                    Exercise
                  </label>
                  <input
                    id="wf-exercise"
                    type="text"
                    placeholder="e.g. Bench press"
                    value={form.exerciseName}
                    onChange={(e) => setForm((prev) => ({ ...prev, exerciseName: e.target.value }))}
                    aria-invalid={!!workoutErrors.exerciseName}
                    aria-describedby={workoutErrors.exerciseName ? 'wf-exercise-err' : undefined}
                    className={inputCls(workoutErrors.exerciseName)}
                  />
                  <FieldError id="wf-exercise-err" message={workoutErrors.exerciseName} />
                </div>

                {form.exerciseName.trim().length >= 2 && !isSearchingExercises && exerciseSuggestions.length > 0 && (
                  <div className="md:col-span-4 max-h-48 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-sm">
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
                  <p className="md:col-span-4 text-xs text-muted-foreground">Searching exercises...</p>
                )}

                {!isSearchingExercises &&
                  hasSearchedExercises &&
                  form.exerciseName.trim().length >= 2 &&
                  exerciseSuggestions.length === 0 && (
                    <p className="md:col-span-4 text-xs text-muted-foreground">
                      No exercises found for this search.
                    </p>
                  )}

                {/* Sets */}
                <div className="flex flex-col">
                  <label htmlFor="wf-sets" className="mb-1 text-xs font-medium text-muted-foreground">
                    Sets
                  </label>
                  <input
                    id="wf-sets"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={form.sets}
                    onChange={(e) => setForm((prev) => ({ ...prev, sets: e.target.value }))}
                    aria-invalid={!!workoutErrors.sets}
                    aria-describedby={workoutErrors.sets ? 'wf-sets-err' : undefined}
                    className={inputCls(workoutErrors.sets)}
                  />
                  <FieldError id="wf-sets-err" message={workoutErrors.sets} />
                </div>

                {/* Reps */}
                <div className="flex flex-col">
                  <label htmlFor="wf-reps" className="mb-1 text-xs font-medium text-muted-foreground">
                    Reps
                  </label>
                  <input
                    id="wf-reps"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={form.reps}
                    onChange={(e) => setForm((prev) => ({ ...prev, reps: e.target.value }))}
                    aria-invalid={!!workoutErrors.reps}
                    aria-describedby={workoutErrors.reps ? 'wf-reps-err' : undefined}
                    className={inputCls(workoutErrors.reps)}
                  />
                  <FieldError id="wf-reps-err" message={workoutErrors.reps} />
                </div>

                {/* Weight */}
                <div className="flex flex-col">
                  <label htmlFor="wf-weight" className="mb-1 text-xs font-medium text-muted-foreground">
                    Weight kg <span className="font-normal">(optional)</span>
                  </label>
                  <input
                    id="wf-weight"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="60"
                    value={form.weight}
                    onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                    className={inputCls()}
                  />
                </div>
              </>
            ) : (
              /* Duration */
              <div className="flex flex-col">
                <label htmlFor="wf-duration" className="mb-1 text-xs font-medium text-muted-foreground">
                  Duration (min)
                </label>
                <input
                  id="wf-duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                  aria-invalid={!!workoutErrors.duration}
                  aria-describedby={workoutErrors.duration ? 'wf-duration-err' : undefined}
                  className={inputCls(workoutErrors.duration)}
                />
                <FieldError id="wf-duration-err" message={workoutErrors.duration} />
              </div>
            )}

            {/* Date */}
            <div className="flex flex-col">
              <label htmlFor="wf-date" className="mb-1 text-xs font-medium text-muted-foreground">
                Date
              </label>
              <input
                id="wf-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                aria-invalid={!!workoutErrors.date}
                aria-describedby={workoutErrors.date ? 'wf-date-err' : undefined}
                className={inputCls(workoutErrors.date)}
              />
              <FieldError id="wf-date-err" message={workoutErrors.date} />
            </div>

            <div className="md:col-span-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── My Workout Schedule ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Workout schedule</CardTitle>
          <p className="text-sm text-muted-foreground">Recurring templates stay ready for quick logging.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleTemplateSubmit} noValidate className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {/* Template name */}
            <div className="flex flex-col">
              <label htmlFor="tf-name" className="mb-1 text-xs font-medium text-muted-foreground">
                Template name
              </label>
              <input
                id="tf-name"
                type="text"
                placeholder="e.g. Leg day"
                value={templateForm.name}
                onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                aria-invalid={!!templateErrors.name}
                aria-describedby={templateErrors.name ? 'tf-name-err' : undefined}
                className={inputCls(templateErrors.name)}
              />
              <FieldError id="tf-name-err" message={templateErrors.name} />
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label htmlFor="tf-type" className="mb-1 text-xs font-medium text-muted-foreground">
                Type
              </label>
              <select
                id="tf-type"
                value={templateForm.type}
                onChange={(e) =>
                  setTemplateForm((prev) => ({ ...prev, type: e.target.value as WorkoutType }))
                }
                className={inputCls()}
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {templateForm.type === 'strength' ? (
              <>
                {/* Exercise */}
                <div className="flex flex-col">
                  <label htmlFor="tf-exercise" className="mb-1 text-xs font-medium text-muted-foreground">
                    Exercise
                  </label>
                  <input
                    id="tf-exercise"
                    type="text"
                    placeholder="e.g. Squat"
                    value={templateForm.exerciseName}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({ ...prev, exerciseName: e.target.value }))
                    }
                    aria-invalid={!!templateErrors.exerciseName}
                    aria-describedby={templateErrors.exerciseName ? 'tf-exercise-err' : undefined}
                    className={inputCls(templateErrors.exerciseName)}
                  />
                  <FieldError id="tf-exercise-err" message={templateErrors.exerciseName} />
                </div>

                {/* Sets */}
                <div className="flex flex-col">
                  <label htmlFor="tf-sets" className="mb-1 text-xs font-medium text-muted-foreground">
                    Sets
                  </label>
                  <input
                    id="tf-sets"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={templateForm.sets}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, sets: e.target.value }))}
                    aria-invalid={!!templateErrors.sets}
                    aria-describedby={templateErrors.sets ? 'tf-sets-err' : undefined}
                    className={inputCls(templateErrors.sets)}
                  />
                  <FieldError id="tf-sets-err" message={templateErrors.sets} />
                </div>

                {/* Reps */}
                <div className="flex flex-col">
                  <label htmlFor="tf-reps" className="mb-1 text-xs font-medium text-muted-foreground">
                    Reps
                  </label>
                  <input
                    id="tf-reps"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={templateForm.reps}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, reps: e.target.value }))}
                    aria-invalid={!!templateErrors.reps}
                    aria-describedby={templateErrors.reps ? 'tf-reps-err' : undefined}
                    className={inputCls(templateErrors.reps)}
                  />
                  <FieldError id="tf-reps-err" message={templateErrors.reps} />
                </div>

                {/* Weight */}
                <div className="flex flex-col">
                  <label htmlFor="tf-weight" className="mb-1 text-xs font-medium text-muted-foreground">
                    Weight kg <span className="font-normal">(optional)</span>
                  </label>
                  <input
                    id="tf-weight"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="60"
                    value={templateForm.weight}
                    onChange={(e) => setTemplateForm((prev) => ({ ...prev, weight: e.target.value }))}
                    className={inputCls()}
                  />
                </div>
              </>
            ) : (
              /* Duration */
              <div className="flex flex-col">
                <label htmlFor="tf-duration" className="mb-1 text-xs font-medium text-muted-foreground">
                  Duration (min)
                </label>
                <input
                  id="tf-duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={templateForm.duration}
                  onChange={(e) => setTemplateForm((prev) => ({ ...prev, duration: e.target.value }))}
                  aria-invalid={!!templateErrors.duration}
                  aria-describedby={templateErrors.duration ? 'tf-duration-err' : undefined}
                  className={inputCls(templateErrors.duration)}
                />
                <FieldError id="tf-duration-err" message={templateErrors.duration} />
              </div>
            )}

            {/* Repeat on */}
            <div className="md:col-span-4">
              <p
                id="tf-days-label"
                className={`mb-2 text-sm font-medium ${templateErrors.scheduleDays ? 'text-destructive' : ''}`}
              >
                Repeat on
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="tf-days-label">
                {WEEKDAYS.map((day) => {
                  const isActive = templateForm.scheduleDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => toggleTemplateDay(day.value)}
                      className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-input bg-background/80 text-foreground hover:bg-secondary'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>
              {templateErrors.scheduleDays && (
                <p className="mt-1 text-xs text-destructive">{templateErrors.scheduleDays}</p>
              )}
            </div>

            <div className="md:col-span-4">
              <Button type="submit" disabled={isTemplateSubmitting}>
                {isTemplateSubmitting ? 'Saving...' : 'Save Schedule'}
              </Button>
            </div>
          </form>

          {/* Template list */}
          <div className="space-y-3 border-t border-border pt-4">
            {templates.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 py-8 text-center">
                <div className="rounded-full bg-secondary p-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No schedule yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first recurring workout above and it will always stay here.
                  </p>
                </div>
              </div>
            ) : (
              templates.map((template) => {
                const isBusy = templateActionId === template._id
                return (
                  <div key={template._id} className="rounded-md border border-border bg-background/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs uppercase tracking-wide text-secondary-foreground">
                        {template.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {(template.scheduleDays ?? [])
                        .map((day) => day.slice(0, 1).toUpperCase() + day.slice(1))
                        .join(', ')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatExerciseSummary(template)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => handleStartTemplate(template)}
                      >
                        {isBusy ? (
                          'Logging...'
                        ) : template.type === 'strength' && template.exercises.length > 0 ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start workout
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Log as done today
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isBusy}
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        {isBusy ? '...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Workout History ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Workout history</CardTitle>
          <p className="text-sm text-muted-foreground">
            {strengthSessions} strength sessions in the current log.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!isLoading && workouts.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-background/50 py-8 text-center md:col-span-2">
              <div className="rounded-full bg-secondary p-3">
                <Dumbbell className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No workouts logged yet</p>
                <p className="text-sm text-muted-foreground">
                  Use the form above to record your first session.
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            workouts.map((workout) => (
              <div key={workout._id} className="rounded-md border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{workout.name}</h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs uppercase tracking-wide text-secondary-foreground">
                    {workout.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatExerciseSummary(workout)} • {format(new Date(workout.date), 'MMM d, yyyy')}
                </p>
                {workout.type === 'strength' && workout.exercises.some((exercise) => exercise.notes) && (
                  <div className="mt-3 space-y-1 rounded-md border border-border bg-card/60 p-3 text-xs text-muted-foreground">
                    {workout.exercises
                      .filter((exercise) => exercise.notes)
                      .map((exercise) => (
                        <p key={exercise.exerciseName}>
                          <span className="font-medium text-foreground">{exercise.exerciseName}:</span>{' '}
                          {exercise.notes}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
