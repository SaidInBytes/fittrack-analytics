"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Dumbbell } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [logoError, setLogoError] = useState(false)

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-drift-slow" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-float-slow" />
      </div>

      <div className="relative w-full max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card/90 p-8 text-center shadow-xl backdrop-blur-sm sm:p-10">
        <div className="flex justify-center">
          <div className="animate-float-slow rounded-2xl border border-border/60 bg-background/90 p-2.5 shadow-md">
            {logoError ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <Image
                src="/logo.png"
                alt="FitTrack Analytics logo"
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl"
                onError={() => setLogoError(true)}
                priority
              />
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold">FitTrack Analytics</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Track your fitness journey with detailed analytics and personalized workout insights.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium shadow-sm transition hover:bg-primary/90"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-border bg-background px-6 py-3 font-medium transition hover:bg-accent"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}
