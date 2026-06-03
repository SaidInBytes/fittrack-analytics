'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Dumbbell,
  RefreshCcw,
  Clock,
  ChevronRight,
  Flame,
  Activity,
  Wind,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
    accent: 'border-blue-500 bg-blue-500/10',
    icon: <Dumbbell className="h-8 w-8 text-blue-500" />,
  },
  {
    type: 'pull',
    label: 'Pull',
    description: 'Back · Biceps',
    accent: 'border-purple-500 bg-purple-500/10',
    icon: <Activity className="h-8 w-8 text-purple-500" />,
  },
  {
    type: 'legs',
    label: 'Leg Day',
    description: 'Quads · Hamstrings · Calves',
    accent: 'border-orange-500 bg-orange-500/10',
    icon: <Flame className="h-8 w-8 text-orange-500" />,
  },
  {
    type: 'cardio',
    label: 'Cardio',
    description: 'Endurance · Burns calories',
    accent: 'border-red-500 bg-red-500/10',
    icon: <Activity className="h-8 w-8 text-red-500" />,
  },
  {
    type: 'stretch',
    label: 'Stretch',
    description: 'Mobility · Recovery',
    accent: 'border-green-500 bg-green-500/10',
    icon: <Wind className="h-8 w-8 text-green-500" />,
  },
]

const DURATIONS = [
  { minutes: 30, label: '30 min' },
  { minutes: 45, label: '45 min' },
  { minutes: 60, label: '1 hour' },
  { minutes: 90, label: '1.5 hours' },
  { minutes: 120, label: '2 hours' },
]

function getSetsReps(type: WorkoutPlanType): string {
  switch (type) {
    case 'push':
    case 'pull':
    case 'legs':
      return '4 sets × 10 reps'
    case 'cardio':
      return '3 sets × 60 sec'
    case 'stretch':
      return '2 sets × 30 sec hold'
  }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ExerciseSkeleton() {
  return (
    <Card>
      <div className="h-48 animate-pulse rounded-t-lg bg-muted" />
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
  setsReps,
}: {
  exercise: PlannedExercise
  setsReps: string
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <Card className="overflow-hidden">
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
      <CardContent className="pt-4 space-y-1">
        <p className="font-semibold text-sm leading-snug">{exercise.name}</p>
        {exercise.category && (
          <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {exercise.category}
          </span>
        )}
        <p className="text-xs text-muted-foreground pt-1">{setsReps}</p>
      </CardContent>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorkoutPlannerPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<WorkoutPlanType | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(type: WorkoutPlanType, duration: number) {
    setIsLoading(true)
    setError('')
    setPlan(null)

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
    setError('')
  }

  const selectedTypeInfo = WORKOUT_TYPES.find((w) => w.type === selectedType)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan Your Workout</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a workout type and duration — we&apos;ll build your exercise list.
          </p>
        </div>
        {(selectedType || plan) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Start over
          </Button>
        )}
      </div>

      {/* Step 1 – Workout type */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Step 1 — What type of workout?
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {WORKOUT_TYPES.map((w) => (
            <button
              key={w.type}
              onClick={() => handleTypeSelect(w.type)}
              aria-pressed={selectedType === w.type}
              className={[
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedType === w.type
                  ? w.accent
                  : 'border-border bg-card hover:border-muted-foreground/40',
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
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Step 2 — How long?
          </h2>
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-accent',
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
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Building your plan…
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExerciseSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      {plan && !isLoading && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Your {selectedTypeInfo?.label} workout ·{' '}
              {DURATIONS.find((d) => d.minutes === plan.duration)?.label}
            </h2>
            <span className="text-xs text-muted-foreground">
              {plan.exercises.length} exercises
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                setsReps={getSetsReps(plan.type)}
              />
            ))}
          </div>

          {/* CTA to log the workout */}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => router.push('/dashboard/workouts')}>
              Log this workout
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
