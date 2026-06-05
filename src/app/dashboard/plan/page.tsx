'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Dumbbell,
  RefreshCcw,
  Clock,
  ChevronRight,
  Flame,
  Activity,
  Wind,
  CalendarRange,
  ListChecks,
  Play,
  Check,
  ArrowLeft,
  LockKeyhole,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'

// ── Types ────────────────────────────────────────────────────────────────────

type WorkoutPlanType = 'push' | 'pull' | 'legs' | 'cardio' | 'stretch'

interface PlannedExercise {
  id: number
  name: string
  category: string
  imageUrl: string | null
}

interface WorkoutPlan {
  type: WorkoutPlanType
  duration: number
  count: number
  exercises: PlannedExercise[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const WORKOUT_TYPES: {
  type: WorkoutPlanType
  label: string
  description: string
  accent: string
  icon: React.ReactNode
}[] = [
  {
    type: 'push',
    label: 'Push',
    description: 'Chest · Shoulders · Triceps',
    accent: 'border-emerald-400 bg-emerald-400/15 text-emerald-950',
    icon: <Dumbbell className="h-8 w-8 text-emerald-500" />,
  },
  {
    type: 'pull',
    label: 'Pull',
    description: 'Back · Biceps',
    accent: 'border-cyan-400 bg-cyan-400/15 text-cyan-950',
    icon: <Activity className="h-8 w-8 text-cyan-500" />,
  },
  {
    type: 'legs',
    label: 'Leg Day',
    description: 'Quads · Hamstrings · Calves',
    accent: 'border-amber-400 bg-amber-400/20 text-amber-950',
    icon: <Flame className="h-8 w-8 text-amber-500" />,
  },
  {
    type: 'cardio',
    label: 'Cardio',
    description: 'Endurance · Burns calories',
    accent: 'border-rose-400 bg-rose-400/15 text-rose-950',
    icon: <Activity className="h-8 w-8 text-rose-500" />,
  },
  {
    type: 'stretch',
    label: 'Stretch',
    description: 'Mobility · Recovery',
    accent: 'border-lime-400 bg-lime-400/15 text-lime-950',
    icon: <Wind className="h-8 w-8 text-lime-600" />,
  },
]

const DURATIONS = [
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: 90, label: '1.5 hours' },
  { minutes: 120, label: '2 hours' },
]

function getExercisePrescription(type: WorkoutPlanType, index: number, total: number, duration: number) {
  if (type === 'cardio') {
    const blockMinutes = Math.max(4, Math.floor(duration / Math.max(total, 1)))
    return {
      dose: `${blockMinutes} min`,
      rest: '60 sec easy pace',
      cue: index === 0 ? 'Warm up first, then build pace.' : 'Keep the effort steady and controlled.',
    }
  }

  if (type === 'stretch') {
    return {
      dose: index < 2 ? '2 rounds x 45 sec hold' : '2 rounds x 30 sec hold',
      rest: '15 sec transition',
      cue: 'Move slowly and stop before sharp pain.',
    }
  }

  if (index < 2) {
    return {
      dose: duration <= 30 ? '3 sets x 6-8 reps' : '4 sets x 6-8 reps',
      rest: '90 sec rest',
      cue: 'Main lift: use a weight that feels heavy but clean.',
    }
  }

  if (index >= total - 2) {
    return {
      dose: duration <= 45 ? '2 sets x 12-15 reps' : '3 sets x 12-15 reps',
      rest: '45 sec rest',
      cue: 'Finisher: controlled reps, no rushing.',
    }
  }

  return {
    dose: duration <= 30 ? '2 sets x 8-10 reps' : '3 sets x 8-12 reps',
    rest: '60 sec rest',
    cue: 'Accessory work: keep the movement strict.',
  }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ExerciseSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="h-48 animate-pulse bg-muted" />
      <CardContent className="pt-4 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  prescription,
  order,
}: {
  exercise: PlannedExercise
  prescription: ReturnType<typeof getExercisePrescription>
  order: number
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-48 w-full bg-muted flex items-center justify-center">
        {exercise.imageUrl && !imgError ? (
          <Image
            src={exercise.imageUrl}
            alt={exercise.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Dumbbell className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            {order}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold leading-snug text-foreground">{exercise.name}</p>
            {exercise.category && (
              <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {exercise.category}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background/70 p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            Do this exact exercise
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">{prescription.dose}</p>
          <p className="mt-1 text-muted-foreground">{prescription.rest}</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">{prescription.cue}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkoutPlannerPage() {
  const router = useRouter()
  const { status } = useSession()
  const [selectedType, setSelectedType] = useState<WorkoutPlanType | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null)
  const [completedExerciseIndexes, setCompletedExerciseIndexes] = useState<number[]>([])
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(type: WorkoutPlanType, duration: number) {
    setIsLoading(true)
    setError('')
    setPlan(null)
    setActiveExerciseIndex(null)
    setCompletedExerciseIndexes([])
    setIsWorkoutComplete(false)

    try {
      const res = await fetch(`/api/exercises/plan?type=${type}&duration=${duration}`)
      if (!res.ok) throw new Error('Failed to fetch plan')
      const data = (await res.json()) as WorkoutPlan
      setPlan(data)
    } catch {
      setError('Could not load exercises right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleTypeSelect(type: WorkoutPlanType) {
    setSelectedType(type)
    setSelectedDuration(null)
    setPlan(null)
    setActiveExerciseIndex(null)
    setCompletedExerciseIndexes([])
    setIsWorkoutComplete(false)
    setError('')
  }

  function handleDurationSelect(duration: number) {
    setSelectedDuration(duration)
    if (selectedType) {
      handleGenerate(selectedType, duration)
    }
  }

  function handleReset() {
    setSelectedType(null)
    setSelectedDuration(null)
    setPlan(null)
    setActiveExerciseIndex(null)
    setCompletedExerciseIndexes([])
    setIsWorkoutComplete(false)
    setError('')
  }

  function handleStartFollowMode() {
    if (!plan || plan.exercises.length === 0) return
    setActiveExerciseIndex(0)
    setCompletedExerciseIndexes([])
    setIsWorkoutComplete(false)
  }

  function handleCompleteCurrentExercise() {
    if (!plan || activeExerciseIndex === null) return

    setCompletedExerciseIndexes((prev) =>
      prev.includes(activeExerciseIndex) ? prev : [...prev, activeExerciseIndex]
    )

    const nextIndex = activeExerciseIndex + 1
    if (nextIndex >= plan.exercises.length) {
      setActiveExerciseIndex(null)
      setIsWorkoutComplete(true)
      return
    }

    setActiveExerciseIndex(nextIndex)
  }

  function handlePreviousExercise() {
    setActiveExerciseIndex((prev) => {
      if (prev === null) return prev
      return Math.max(0, prev - 1)
    })
  }

  function handleExitFollowMode() {
    setActiveExerciseIndex(null)
    setIsWorkoutComplete(false)
  }

  const selectedTypeInfo = WORKOUT_TYPES.find((w) => w.type === selectedType)
  const activeExercise =
    plan && activeExerciseIndex !== null ? plan.exercises[activeExerciseIndex] : null
  const activePrescription =
    plan && activeExerciseIndex !== null
      ? getExercisePrescription(plan.type, activeExerciseIndex, plan.exercises.length, plan.duration)
      : null

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Plan Workout"
          description="Choose the training intent and time window, then generate a clean exercise plan."
          eyebrow="Session builder"
          icon={CalendarRange}
          meta={selectedTypeInfo ? `${selectedTypeInfo.label} selected` : 'Pick a session type'}
        />
        {(selectedType || plan) && (
          <Button variant="outline" size="sm" onClick={handleReset} className="self-start">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Start over
          </Button>
        )}
      </div>

      {/* Step 1 – Workout type */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground">Step 1 - workout type</h2>
          <span className="text-xs text-muted-foreground">5 modes</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WORKOUT_TYPES.map((w) => (
            <button
              key={w.type}
              onClick={() => handleTypeSelect(w.type)}
              aria-pressed={selectedType === w.type}
              className={[
                'flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedType === w.type
                  ? w.accent
                  : 'border-border bg-card/90 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm',
              ].join(' ')}
            >
              {w.icon}
              <span className="font-semibold text-sm">{w.label}</span>
              <span className="text-xs text-muted-foreground leading-tight">{w.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 2 – Duration (appears after type chosen) */}
      {selectedType && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground">Step 2 - duration</h2>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                onClick={() => handleDurationSelect(d.minutes)}
                aria-pressed={selectedDuration === d.minutes}
                className={[
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedDuration === d.minutes
                    ? 'border-zinc-950 bg-zinc-950 text-white'
                    : 'border-border bg-card hover:bg-secondary',
                ].join(' ')}
              >
                <Clock className="h-3.5 w-3.5" />
                {d.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Building your plan...</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciseSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {plan && !isLoading && (
        <section className="rounded-lg border border-border bg-card/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase text-muted-foreground">
              Your {selectedTypeInfo?.label} workout ·{' '}
              {DURATIONS.find((d) => d.minutes === plan.duration)?.label}
            </h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {plan.exercises.length} exercises
            </span>
          </div>

          {status !== 'authenticated' && (
            <div className="mb-4 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
              <div className="flex items-start gap-2">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Guest mode lets you follow this workout step by step. Nothing is saved when you leave this page.
                </p>
              </div>
            </div>
          )}

          {activeExercise && activePrescription && (
            <div className="mb-5 rounded-lg border border-primary/30 bg-background p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Exercise {activeExerciseIndex! + 1} of {plan.exercises.length}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold">{activeExercise.name}</h3>
                  {activeExercise.category && (
                    <p className="mt-1 text-sm text-muted-foreground">{activeExercise.category}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleExitFollowMode}>
                  Exit follow mode
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-md border border-border bg-card/70 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Do</p>
                  <p className="mt-1 text-lg font-semibold">{activePrescription.dose}</p>
                </div>
                <div className="rounded-md border border-border bg-card/70 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Rest</p>
                  <p className="mt-1 text-lg font-semibold">{activePrescription.rest}</p>
                </div>
                <div className="rounded-md border border-border bg-card/70 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Focus</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{activePrescription.cue}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {plan.exercises.map((exercise, index) => (
                    <span
                      key={`${exercise.id}-${index}-step`}
                      className={[
                        'rounded-full px-3 py-1 text-xs font-medium',
                        index === activeExerciseIndex
                          ? 'bg-primary text-primary-foreground'
                          : completedExerciseIndexes.includes(index)
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousExercise}
                    disabled={activeExerciseIndex === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button onClick={handleCompleteCurrentExercise}>
                    <Check className="mr-2 h-4 w-4" />
                    {activeExerciseIndex === plan.exercises.length - 1 ? 'Finish workout' : 'Done, next'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isWorkoutComplete && (
            <div className="mb-5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
              Workout complete. This guest session was not saved.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.exercises.map((ex, index) => (
              <ExerciseCard
                key={`${ex.id}-${index}`}
                exercise={ex}
                order={index + 1}
                prescription={getExercisePrescription(
                  plan.type,
                  index,
                  plan.exercises.length,
                  plan.duration
                )}
              />
            ))}
          </div>

          {/* CTA to log the workout */}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleStartFollowMode}>
              <Play className="mr-2 h-4 w-4" />
              Follow step by step
            </Button>
            <Button onClick={() => router.push(status === 'authenticated' ? '/dashboard/workouts' : '/register')}>
              {status === 'authenticated' ? 'Log this workout' : 'Create account to log'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
