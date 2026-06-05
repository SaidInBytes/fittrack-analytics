'use client'

import { useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'

function applyDarkMode(enabled: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', enabled)
}

function ThemeSync() {
  const { status } = useSession()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTheme = window.localStorage.getItem('fittrack.darkMode')
    if (savedTheme !== null) {
      applyDarkMode(savedTheme === 'true')
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (status === 'loading') return

    let cancelled = false

    async function loadThemePreference() {
      try {
        if (status === 'unauthenticated') return

        const res = await fetch('/api/user', { cache: 'no-store' })
        if (!res.ok) return

        const data = await res.json()
        const darkMode = Boolean(data?.preferences?.darkMode)

        if (!cancelled) {
          applyDarkMode(darkMode)
          window.localStorage.setItem('fittrack.darkMode', String(darkMode))
        }
      } catch {
        // Ignore theme sync failures to avoid blocking rendering.
      }
    }

    loadThemePreference()

    return () => {
      cancelled = true
    }
  }, [status])

  useEffect(() => {
    if (typeof window === 'undefined') return

    function onThemeChange(event: Event) {
      const customEvent = event as CustomEvent<{ darkMode?: boolean }>
      const darkMode = Boolean(customEvent.detail?.darkMode)
      applyDarkMode(darkMode)
      window.localStorage.setItem('fittrack.darkMode', String(darkMode))
    }

    window.addEventListener('fittrack:theme', onThemeChange)

    return () => {
      window.removeEventListener('fittrack:theme', onThemeChange)
    }
  }, [])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeSync />
      {children}
    </SessionProvider>
  )
}
