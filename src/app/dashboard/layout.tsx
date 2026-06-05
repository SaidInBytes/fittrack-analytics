"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import '@/app/globals.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()
  const isGuestPlanMode = status === 'unauthenticated' && pathname === '/dashboard/plan'

  const closeMobileMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/dashboard/plan') {
      router.replace('/demo')
    }
  }, [pathname, router, status])

  if (status === 'loading' || (status === 'unauthenticated' && !isGuestPlanMode)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
          Loading workspace...
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar mobileOpen={mobileMenuOpen} onNavigate={closeMobileMenu} guestMode={isGuestPlanMode} />
      {mobileMenuOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          guestMode={isGuestPlanMode}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
