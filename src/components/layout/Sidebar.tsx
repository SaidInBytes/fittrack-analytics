'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Dumbbell, Apple, TrendingUp, Settings, CalendarRange, LogIn } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/plan', label: 'Plan Workout', icon: CalendarRange },
  { href: '/dashboard/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/dashboard/nutrition', label: 'Nutrition', icon: Apple },
  { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  mobileOpen?: boolean
  onNavigate?: () => void
  guestMode?: boolean
}

export default function Sidebar({ mobileOpen = false, onNavigate, guestMode = false }: SidebarProps) {
  const pathname = usePathname()
  const visibleNavItems = guestMode
    ? [{ href: '/dashboard/plan', label: 'Plan Workout', icon: CalendarRange }]
    : navItems

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-white/10 bg-zinc-950 text-zinc-100 shadow-2xl transition-transform md:static md:z-auto md:flex md:translate-x-0',
        mobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
      )}
    >
      <div className="border-b border-white/10 p-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="FitTrack Analytics logo"
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-md"
            priority
          />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">FitTrack</h2>
            <p className="text-xs text-emerald-300">{guestMode ? 'Guest planner' : 'Analytics lab'}</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-emerald-400 text-zinc-950'
                : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-50'
            )}
            onClick={onNavigate}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        {guestMode && (
          <Link
            href="/login"
            className="mt-4 flex items-center gap-3 rounded-md border border-white/10 px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-zinc-50"
            onClick={onNavigate}
          >
            <LogIn className="h-4 w-4" />
            Login to save
          </Link>
        )}
      </nav>
    </aside>
  )
}
