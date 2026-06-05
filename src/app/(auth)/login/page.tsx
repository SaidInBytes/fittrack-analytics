'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Dumbbell } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid email or password')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/5 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-drift-slow" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-float-slow" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl animate-drift-slow" />
      </div>

      <div className="relative w-full max-w-md space-y-6 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-float-slow rounded-2xl border border-border/60 bg-background/90 p-2.5 shadow-md">
            {logoError ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Dumbbell className="h-7 w-7 text-primary" />
              </div>
            ) : (
              <Image
                src="/logo.svg"
                alt="FitTrack Analytics logo"
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 rounded-xl"
                onError={() => setLogoError(true)}
                priority
              />
            )}
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-sm text-muted-foreground text-center">
            Log in to continue tracking your training and progress.
          </p>
        </div>

        {registered && (
          <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary">
            Account created! Please log in.
          </div>
        )}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-medium text-primary">Use guest workout planner</p>
          <p className="mt-1 text-muted-foreground">
            Guests can build workout plans. Create an account to save and log sessions.
          </p>
          <Link
            href="/dashboard/plan"
            className="mt-3 block w-full rounded-md border border-primary/30 bg-background px-4 py-2 text-center font-medium text-primary shadow-sm transition hover:bg-primary/10"
          >
            Continue as guest
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-4" />}>
      <LoginForm />
    </Suspense>
  )
}
