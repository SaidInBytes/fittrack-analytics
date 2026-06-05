'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, Ruler, Scale, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import PageHeader from '@/components/layout/PageHeader'
import type { Progress } from '@/types'

interface ProgressFormState {
  date: string
  weight: string
  chest: string
  waist: string
  hips: string
  arms: string
  legs: string
  notes: string
}

const initialForm: ProgressFormState = {
  date: new Date().toISOString().slice(0, 10),
  weight: '',
  chest: '',
  waist: '',
  hips: '',
  arms: '',
  legs: '',
  notes: '',
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export default function ProgressPage() {
  const [progressEntries, setProgressEntries] = useState<Progress[]>([])
  const [form, setForm] = useState<ProgressFormState>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProgress() {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch('/api/progress', { cache: 'no-store' })

        if (!res.ok) {
          throw new Error('Failed to load progress entries')
        }

        const data = await res.json()

        if (!cancelled) {
          setProgressEntries(data)
        }
      } catch {
        if (!cancelled) {
          setError('Could not fetch progress logs right now.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProgress()

    return () => {
      cancelled = true
    }
  }, [])

  const weightTrend = useMemo(() => {
    return [...progressEntries]
      .filter((entry) => typeof entry.weight === 'number')
      .slice(0, 12)
      .reverse()
      .map((entry) => ({
        day: format(new Date(entry.date), 'MMM d'),
        weight: entry.weight as number,
      }))
  }, [progressEntries])
  const latestEntry = progressEntries[0]

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const weight = toOptionalNumber(form.weight)
    const chest = toOptionalNumber(form.chest)
    const waist = toOptionalNumber(form.waist)
    const hips = toOptionalNumber(form.hips)
    const arms = toOptionalNumber(form.arms)
    const legs = toOptionalNumber(form.legs)

    const numericValues = [weight, chest, waist, hips, arms, legs].filter(
      (value): value is number => typeof value === 'number'
    )

    if (!form.date) {
      setError('Date is required.')
      return
    }

    if (numericValues.some((value) => value <= 0)) {
      setError('Weight and measurements must be greater than 0.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        date: form.date,
        weight,
        measurements: {
          chest,
          waist,
          hips,
          arms,
          legs,
        },
        notes: form.notes.trim() || undefined,
      }

      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const created = await res.json()

      if (!res.ok) {
        setError(created.error || 'Could not create progress entry.')
        return
      }

      setProgressEntries((prev) => [created, ...prev])
      setForm((prev) => ({ ...initialForm, date: prev.date }))
    } catch {
      setError('Could not create progress entry right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Progress"
        description="Track body weight, measurements and notes with enough structure to see change over time."
        eyebrow="Body metrics"
        icon={TrendingUp}
        meta={latestEntry?.weight ? `${latestEntry.weight} kg latest` : 'No weight yet'}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Latest weight', value: latestEntry?.weight ? `${latestEntry.weight} kg` : '--', icon: Scale },
          { label: 'Entries', value: String(progressEntries.length), icon: Activity },
          { label: 'Trend points', value: String(weightTrend.length), icon: Ruler },
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

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add progress entry</CardTitle>
          <p className="text-sm text-muted-foreground">Capture today&apos;s measurements in one pass.</p>
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
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Chest (cm)"
              value={form.chest}
              onChange={(e) => setForm((prev) => ({ ...prev, chest: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Waist (cm)"
              value={form.waist}
              onChange={(e) => setForm((prev) => ({ ...prev, waist: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Hips (cm)"
              value={form.hips}
              onChange={(e) => setForm((prev) => ({ ...prev, hips: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Arms (cm)"
              value={form.arms}
              onChange={(e) => setForm((prev) => ({ ...prev, arms: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Legs (cm)"
              value={form.legs}
              onChange={(e) => setForm((prev) => ({ ...prev, legs: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="rounded-md border border-input bg-background/80 px-3 py-2 text-sm md:col-span-2"
            />

            <div className="md:col-span-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Progress Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weight trend</CardTitle>
          <p className="text-sm text-muted-foreground">Last 12 entries with weight values.</p>
        </CardHeader>
        <CardContent className="h-72">
          {weightTrend.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add at least two entries with weight values to see your trend line.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress history</CardTitle>
          <p className="text-sm text-muted-foreground">Recent check-ins and notes.</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading progress logs...</p>}

          {!isLoading && progressEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">No progress logs yet. Add your first entry above.</p>
          )}

          {!isLoading &&
            progressEntries.map((entry) => (
              <div key={entry._id} className="rounded-md border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{format(new Date(entry.date), 'MMM d, yyyy')}</p>
                  {typeof entry.weight === 'number' && (
                    <p className="text-xs text-muted-foreground">Weight: {entry.weight} kg</p>
                  )}
                </div>

                {entry.measurements && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[entry.measurements.chest ? `Chest ${entry.measurements.chest}cm` : null,
                      entry.measurements.waist ? `Waist ${entry.measurements.waist}cm` : null,
                      entry.measurements.hips ? `Hips ${entry.measurements.hips}cm` : null,
                      entry.measurements.arms ? `Arms ${entry.measurements.arms}cm` : null,
                      entry.measurements.legs ? `Legs ${entry.measurements.legs}cm` : null]
                      .filter(Boolean)
                      .join(' • ') ||
                      'No measurements'}
                  </p>
                )}

                {entry.notes && <p className="mt-2 text-sm">{entry.notes}</p>}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
