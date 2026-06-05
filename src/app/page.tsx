"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Dumbbell, LineChart, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [logoError, setLogoError] = useState(false)

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="surface-grid absolute inset-0 opacity-[0.06]" />
      <div className="absolute -right-24 top-8 h-72 w-72 bg-emerald-400/20 blur-3xl animate-drift-slow" />
      <div className="absolute -bottom-28 left-1/4 h-72 w-72 bg-cyan-400/15 blur-3xl animate-float-slow" />

      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
            {logoError ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-400/20">
                <Dumbbell className="h-4 w-4 text-emerald-300" />
              </div>
            ) : (
              <Image
                src="/logo.svg"
                alt="FitTrack Analytics logo"
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 rounded-md"
                onError={() => setLogoError(true)}
                priority
              />
            )}
            Product preview
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-normal sm:text-6xl lg:text-7xl">
              FitTrack Analytics
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-300">
              A focused command center for workouts, nutrition and progress, tuned for getting into the next session fast.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/plan"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
            >
              Try workout planner
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              View demo
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            >
              Register
            </Link>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              { icon: LineChart, label: 'Trend view', value: '7-day signal' },
              { icon: Dumbbell, label: 'Training', value: 'Preview workflow' },
              { icon: ShieldCheck, label: 'Guest mode', value: 'Planner only' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <item.icon className="mb-4 h-5 w-5 text-emerald-300" />
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-zinc-400">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-lg border border-white/10 bg-white/[0.07] p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-zinc-400">Today&apos;s readiness</p>
                <p className="text-3xl font-semibold">82%</p>
              </div>
              <div className="rounded-md bg-emerald-400 px-3 py-1 text-xs font-semibold text-zinc-950">Active</div>
            </div>
            <div className="space-y-3">
              {[
                ['Strength', '50 min', 'w-[78%]', 'bg-emerald-400'],
                ['Nutrition', '762 kcal', 'w-[54%]', 'bg-amber-300'],
                ['Recovery', '3 checks', 'w-[64%]', 'bg-cyan-300'],
              ].map(([label, value, width, color]) => (
                <div key={label} className="rounded-md bg-zinc-950/60 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-zinc-400">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className={`h-2 rounded-full ${color} ${width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
