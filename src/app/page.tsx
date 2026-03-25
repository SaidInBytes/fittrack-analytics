import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">FitTrack Analytics</h1>
      <p className="text-muted-foreground mb-8">
        Track your fitness journey with detailed analytics
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-md border border-border px-6 py-3 font-medium hover:bg-accent"
        >
          Register
        </Link>
      </div>
    </main>
  )
}
