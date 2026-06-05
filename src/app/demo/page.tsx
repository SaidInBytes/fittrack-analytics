import Link from 'next/link'
import {
  Activity,
  Apple,
  ArrowRight,
  BarChart3,
  CalendarRange,
  Check,
  Dumbbell,
  LineChart,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Weight,
} from 'lucide-react'

const previewStats = [
  { label: 'Logged sessions', value: '18', detail: '4-week training history', icon: Activity, accent: 'bg-emerald-400' },
  { label: 'Workout minutes', value: '740', detail: 'monthly load signal', icon: Dumbbell, accent: 'bg-cyan-300' },
  { label: 'Avg calories', value: '2,180', detail: 'nutrition consistency', icon: Apple, accent: 'bg-amber-300' },
  { label: 'Weight trend', value: '-1.8 kg', detail: 'latest progress line', icon: TrendingUp, accent: 'bg-rose-300' },
]

const plannerPreview = [
  { name: 'Incline Dumbbell Press', dose: '4 sets x 6-8 reps', rest: '90 sec rest' },
  { name: 'Shoulder Press', dose: '4 sets x 6-8 reps', rest: '90 sec rest' },
  { name: 'Lateral Raise', dose: '3 sets x 12-15 reps', rest: '45 sec rest' },
]

const featureBlocks = [
  {
    title: 'Workout planner',
    description: 'Guests can generate a clear session plan before creating an account.',
    icon: CalendarRange,
  },
  {
    title: 'Set-by-set logging',
    description: 'Signed-in athletes can move through a workout and record kg plus reps.',
    icon: NotebookPen,
  },
  {
    title: 'Nutrition overview',
    description: 'Calories, protein, carbs and fat stay readable without spreadsheet noise.',
    icon: Apple,
  },
  {
    title: 'Progress tracking',
    description: 'Bodyweight and measurements become a quick trend instead of scattered notes.',
    icon: LineChart,
  },
]

const weeklyBars = [
  { day: 'Mon', value: 'h-20', tone: 'bg-emerald-400' },
  { day: 'Tue', value: 'h-12', tone: 'bg-cyan-300' },
  { day: 'Wed', value: 'h-28', tone: 'bg-emerald-400' },
  { day: 'Thu', value: 'h-16', tone: 'bg-amber-300' },
  { day: 'Fri', value: 'h-24', tone: 'bg-emerald-400' },
  { day: 'Sat', value: 'h-10', tone: 'bg-rose-300' },
  { day: 'Sun', value: 'h-32', tone: 'bg-cyan-300' },
]

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden px-5 py-5 sm:px-8">
        <div className="surface-grid absolute inset-0 opacity-[0.06]" />
        <div className="absolute -right-24 top-10 h-72 w-72 bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 bg-cyan-400/15 blur-3xl" />

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">FitTrack</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-emerald-400 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
            >
              Create account
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto grid max-w-7xl gap-8 py-10 lg:grid-cols-[1fr_500px] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
              <LockKeyhole className="h-3.5 w-3.5" />
              Preview only · guest planner available
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">
                A cleaner way to plan, log and understand training.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                Explore the product with sample data, then try the workout planner as a guest. Create an account when you want to save sessions and track progress.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/plan"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
              >
                Try guest planner
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Save with account
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-zinc-400">Example readiness</p>
                <p className="text-4xl font-semibold">82%</p>
              </div>
              <span className="rounded-md bg-emerald-400 px-3 py-1 text-xs font-semibold text-zinc-950">
                Sample data
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {previewStats.map((stat) => (
                <div key={stat.label} className="rounded-md bg-zinc-950/60 p-4">
                  <div className={`mb-4 h-1.5 w-12 rounded-full ${stat.accent}`} />
                  <stat.icon className="mb-3 h-5 w-5 text-zinc-200" />
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-xs text-zinc-400">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-900 px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-400">Guest planner preview</p>
                <h2 className="mt-1 text-2xl font-semibold">Push · 45 minutes</h2>
              </div>
              <CalendarRange className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="space-y-3">
              {plannerPreview.map((exercise, index) => (
                <div key={exercise.name} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.05] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-zinc-950">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{exercise.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{exercise.dose} · {exercise.rest}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/plan"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Generate your plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-400">Weekly training load</p>
                <h2 className="mt-1 text-2xl font-semibold">Minutes by day</h2>
              </div>
              <BarChart3 className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="flex h-44 items-end gap-3 rounded-md bg-zinc-950/60 p-4">
              {weeklyBars.map((bar) => (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className={`w-full rounded-t-md ${bar.tone} ${bar.value}`} />
                  <span className="text-xs text-zinc-400">{bar.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-zinc-950/60 p-3">
                <p className="text-lg font-semibold">5</p>
                <p className="text-zinc-400">sessions</p>
              </div>
              <div className="rounded-md bg-zinc-950/60 p-3">
                <p className="text-lg font-semibold">312</p>
                <p className="text-zinc-400">minutes</p>
              </div>
              <div className="rounded-md bg-zinc-950/60 p-3">
                <p className="text-lg font-semibold">+9%</p>
                <p className="text-zinc-400">load</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureBlocks.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <feature.icon className="mb-5 h-6 w-6 text-emerald-300" />
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-zinc-900 px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <h2 className="text-xl font-semibold">Guest mode</h2>
            </div>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-300" /> Generate workout plans</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-300" /> See exact exercises, sets, reps and rest</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-300" /> No saved personal data</li>
            </ul>
          </div>
          <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Weight className="h-6 w-6 text-emerald-200" />
              <h2 className="text-xl font-semibold">Account mode</h2>
            </div>
            <ul className="space-y-3 text-sm text-zinc-200">
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-200" /> Save workouts and templates</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-200" /> Log nutrition and progress</li>
              <li className="flex gap-2"><Check className="h-4 w-4 text-emerald-200" /> Build long-term dashboard history</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-lg border border-white/10 bg-white/[0.07] p-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Ready to try it
            </div>
            <h2 className="text-2xl font-semibold">Start with a workout plan, save when you are ready.</h2>
          </div>
          <Link
            href="/dashboard/plan"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 sm:w-auto"
          >
            Try guest planner
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
