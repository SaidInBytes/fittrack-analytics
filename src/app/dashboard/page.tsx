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
import { Activity, Apple, CalendarRange, Clock3, Weight } from 'lucide-react'
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
}: {
  title: string
  value: string
  icon: React.ReactNode
  hint: string
}) {
  return (
    <Card>
      <CardHeader className="mb-3 flex flex-row items-center justify-between p-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-0">
        <p className="text-2xl font-bold">{value}</p>
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
    return <p className="text-sm text-muted-foreground">Loading dashboard...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your recent fitness activity.</p>
      </div>

      {/* Plan workout CTA */}
      <Link href="/dashboard/plan" className="block">
        <div className="flex items-center justify-between rounded-xl border-2 border-primary/40 bg-primary/5 px-6 py-4 transition-colors hover:bg-primary/10">
          <div className="flex items-center gap-4">
            <CalendarRange className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-primary">Plan today&apos;s workout</p>
              <p className="text-sm text-muted-foreground">
                Choose Push, Pull, Leg Day, Cardio or Stretch — then pick your duration.
              </p>
            </div>
          </div>
          <Activity className="h-5 w-5 text-primary" />
        </div>
      </Link>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Workouts"
          value={String(data.workouts.length)}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          hint="All logged sessions"
        />
        <StatCard
          title="Workout Minutes"
          value={String(totalWorkoutMinutes)}
          icon={<Clock3 className="h-4 w-4 text-muted-foreground" />}
          hint="Accumulated duration"
        />
        <StatCard
          title="Avg Calories"
          value={String(avgCalories)}
          icon={<Apple className="h-4 w-4 text-muted-foreground" />}
          hint="Per nutrition log"
        />
        <StatCard
          title="Latest Weight"
          value={latestWeight ? `${latestWeight} kg` : '--'}
          icon={<Weight className="h-4 w-4 text-muted-foreground" />}
          hint="Most recent check-in"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Workout Minutes (Last 7)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {workoutTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workoutTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} />
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
          </CardHeader>
          <CardContent className="space-y-3">
            {data.workouts.slice(0, 5).map((workout) => (
              <div key={workout._id} className="rounded-md border border-border p-3">
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
