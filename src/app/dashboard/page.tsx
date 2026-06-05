'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Link from 'next/link'
import { Activity, Apple, CalendarRange, Clock3, Dumbbell, Sparkles, Weight } from 'lucide-react'
import type { Nutrition, Progress, Workout } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface DashboardData {
  workouts: Workout[]
  nutrition: Nutrition[]
  progress: Progress[]
}

function StatCard({
  title,
  value,
  icon,
  hint,
  accent,
}: {
  title: string
  value: string
  icon: React.ReactNode
  hint: string
  accent: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <CardHeader className="mb-3 flex flex-row items-center justify-between p-0">
        <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">{title}</CardTitle>
        <div className="rounded-md bg-secondary p-2 text-secondary-foreground">{icon}</div>
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ workouts: [], nutrition: [], progress: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setIsLoading(true)
      setError('')

      try {
        const [workoutsRes, nutritionRes, progressRes] = await Promise.all([
          fetch('/api/workouts', { cache: 'no-store' }),
          fetch('/api/nutrition', { cache: 'no-store' }),
          fetch('/api/progress', { cache: 'no-store' }),
        ])

        if (!workoutsRes.ok || !nutritionRes.ok || !progressRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const [workouts, nutrition, progress] = await Promise.all([
          workoutsRes.json(),
          nutritionRes.json(),
          progressRes.json(),
        ])

        if (!cancelled) {
          setData({ workouts, nutrition, progress })
        }
      } catch {
        if (!cancelled) {
          setError('Could not load your dashboard data right now.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const totalWorkoutMinutes = useMemo(
    () => data.workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0),
    [data.workouts]
  )

  const avgCalories = useMemo(() => {
    if (data.nutrition.length === 0) return 0
    const total = data.nutrition.reduce((sum, entry) => sum + (entry.totals?.calories || 0), 0)
    return Math.round(total / data.nutrition.length)
  }, [data.nutrition])

  const latestWeight = useMemo(() => {
    const withWeight = data.progress.find((entry) => typeof entry.weight === 'number')
    return withWeight?.weight
  }, [data.progress])

  const workoutTrend = useMemo(() => {
    return [...data.workouts]
      .slice(0, 7)
      .reverse()
      .map((workout) => ({
        day: format(new Date(workout.date), 'EEE'),
        minutes: workout.duration,
      }))
  }, [data.workouts])

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-lg bg-zinc-950 px-5 py-6 text-white shadow-[0_24px_80px_-46px_black] sm:px-7 lg:px-8">
        <div className="surface-grid absolute inset-0 opacity-[0.08]" />
        <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 bg-cyan-400/15 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
              <Sparkles className="h-3.5 w-3.5" />
              Training workspace online
            </div>
            <div className="space-y-2">
              <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-normal sm:text-5xl">
                Your training signal, cleaned up.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                Workouts, nutrition and progress are pulled into one focused view so the next session is obvious.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/plan"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
              >
                <CalendarRange className="h-4 w-4" />
                Plan today&apos;s workout
              </Link>
              <Link
                href="/dashboard/workouts"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <Dumbbell className="h-4 w-4" />
                Log workout
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
            <p className="text-xs font-semibold uppercase text-zinc-400">Current load</p>
            <p className="mt-2 text-4xl font-semibold">{totalWorkoutMinutes}</p>
            <p className="text-sm text-zinc-300">minutes tracked across {data.workouts.length} sessions</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-white/10 p-2">
                <p className="font-semibold text-white">{avgCalories}</p>
                <p className="text-zinc-400">avg kcal</p>
              </div>
              <div className="rounded-md bg-white/10 p-2">
                <p className="font-semibold text-white">{latestWeight ? `${latestWeight}` : '--'}</p>
                <p className="text-zinc-400">kg</p>
              </div>
              <div className="rounded-md bg-white/10 p-2">
                <p className="font-semibold text-white">{data.progress.length}</p>
                <p className="text-zinc-400">checks</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Workouts"
          value={String(data.workouts.length)}
          icon={<Activity className="h-4 w-4" />}
          hint="All logged sessions"
          accent="bg-emerald-400"
        />
        <StatCard
          title="Workout Minutes"
          value={String(totalWorkoutMinutes)}
          icon={<Clock3 className="h-4 w-4" />}
          hint="Accumulated duration"
          accent="bg-cyan-400"
        />
        <StatCard
          title="Avg Calories"
          value={String(avgCalories)}
          icon={<Apple className="h-4 w-4" />}
          hint="Per nutrition log"
          accent="bg-amber-400"
        />
        <StatCard
          title="Latest Weight"
          value={latestWeight ? `${latestWeight} kg` : '--'}
          icon={<Weight className="h-4 w-4" />}
          hint="Most recent check-in"
          accent="bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Workout Minutes</CardTitle>
            <p className="text-sm text-muted-foreground">Last 7 logged sessions</p>
          </CardHeader>
          <CardContent className="h-72">
            {workoutTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workoutTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No workout data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <p className="text-sm text-muted-foreground">Most recent logged sessions</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workouts.slice(0, 5).map((workout) => (
              <div key={workout._id} className="rounded-md border border-border bg-background/70 p-3">
                <p className="font-medium">{workout.name}</p>
                <p className="text-xs text-muted-foreground">
                  {workout.type} • {workout.duration} min • {format(new Date(workout.date), 'MMM d')}
                </p>
              </div>
            ))}
            {data.workouts.length === 0 && (
              <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
