'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SettingsFormState {
  name: string
  age: string
  height: string
  currentWeight: string
  goalWeight: string
  activityLevel: string
  goals: string
  unit: 'metric' | 'imperial'
  darkMode: boolean
}

const initialForm: SettingsFormState = {
  name: '',
  age: '',
  height: '',
  currentWeight: '',
  goalWeight: '',
  activityLevel: '',
  goals: '',
  unit: 'metric',
  darkMode: false,
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsFormState>(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      setIsLoading(true)
      setError('')

      try {
        const res = await fetch('/api/user', { cache: 'no-store' })

        if (!res.ok) {
          throw new Error('Failed to load user settings')
        }

        const data = await res.json()

        if (!cancelled) {
          setForm({
            name: data.name || '',
            age: data.profile?.age?.toString() || '',
            height: data.profile?.height?.toString() || '',
            currentWeight: data.profile?.currentWeight?.toString() || '',
            goalWeight: data.profile?.goalWeight?.toString() || '',
            activityLevel: data.profile?.activityLevel || '',
            goals: Array.isArray(data.profile?.goals) ? data.profile.goals.join(', ') : '',
            unit: data.preferences?.unit === 'imperial' ? 'imperial' : 'metric',
            darkMode: Boolean(data.preferences?.darkMode),
          })
        }
      } catch {
        if (!cancelled) {
          setError('Could not load your settings right now.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    const age = toOptionalNumber(form.age)
    const height = toOptionalNumber(form.height)
    const currentWeight = toOptionalNumber(form.currentWeight)
    const goalWeight = toOptionalNumber(form.goalWeight)

    const numericValues = [age, height, currentWeight, goalWeight].filter(
      (value): value is number => typeof value === 'number'
    )

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }

    if (numericValues.some((value) => value <= 0)) {
      setError('Age, height and weight values must be positive numbers.')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        profile: {
          age,
          height,
          currentWeight,
          goalWeight,
          activityLevel: form.activityLevel.trim() || undefined,
          goals: form.goals
            .split(',')
            .map((goal) => goal.trim())
            .filter(Boolean),
        },
        preferences: {
          unit: form.unit,
          darkMode: form.darkMode,
        },
      }

      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Could not save settings.')
        return
      }

      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', form.darkMode)
        window.localStorage.setItem('fittrack.darkMode', String(form.darkMode))
        window.dispatchEvent(
          new CustomEvent('fittrack:theme', {
            detail: { darkMode: form.darkMode },
          })
        )
      }

      setSuccessMessage('Settings saved successfully.')
    } catch {
      setError('Could not save settings right now.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || status === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile details and app preferences.</p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-0 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {successMessage && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="p-0 text-sm text-emerald-700">{successMessage}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile & Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            <select
              value={form.activityLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, activityLevel: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Activity level (optional)</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very-active">Very Active</option>
            </select>
            <input
              type="number"
              min="1"
              placeholder="Age"
              value={form.age}
              onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              step="0.1"
              placeholder={`Height (${form.unit === 'metric' ? 'cm' : 'in'})`}
              value={form.height}
              onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              step="0.1"
              placeholder={`Current weight (${form.unit === 'metric' ? 'kg' : 'lb'})`}
              value={form.currentWeight}
              onChange={(e) => setForm((prev) => ({ ...prev, currentWeight: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              step="0.1"
              placeholder={`Goal weight (${form.unit === 'metric' ? 'kg' : 'lb'})`}
              value={form.goalWeight}
              onChange={(e) => setForm((prev) => ({ ...prev, goalWeight: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Goals (comma separated)"
              value={form.goals}
              onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
            />

            <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm">
              <label htmlFor="unit" className="text-muted-foreground">
                Units
              </label>
              <select
                id="unit"
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unit: e.target.value as 'metric' | 'imperial' }))
                }
                className="ml-auto bg-transparent"
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>

            <label className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-sm">
              <span className="text-muted-foreground">Dark mode preference</span>
              <input
                type="checkbox"
                checked={form.darkMode}
                onChange={(e) => setForm((prev) => ({ ...prev, darkMode: e.target.checked }))}
                className="h-4 w-4"
              />
            </label>

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
