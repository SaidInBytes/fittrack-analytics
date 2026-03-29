'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Dumbbell, Apple, TrendingUp, Settings, CalendarRange } from 'lucide-react'

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
}

export default function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-card transition-transform md:static md:z-auto md:flex md:translate-x-0',
        mobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
      )}
    >
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="FitTrack Analytics logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-md"
            priority
          />
          <h2 className="text-xl font-bold text-primary">FitTrack Analytics</h2>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={onNavigate}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
