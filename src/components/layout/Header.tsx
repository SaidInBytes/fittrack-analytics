'use client'

import Image from 'next/image'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
  guestMode?: boolean
}

export default function Header({ mobileMenuOpen, onToggleMobileMenu, guestMode = false }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 transition-colors hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
          onClick={onToggleMobileMenu}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="FitTrack Analytics logo"
            width={24}
            height={24}
            unoptimized
            className="h-6 w-6 rounded-md"
          />
          <span className="text-sm font-semibold text-foreground">FitTrack Analytics</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
          {guestMode ? 'Guest mode' : 'Workspace online'}
        </span>
        <span className="text-sm font-medium text-foreground">
          {guestMode ? 'Workout planner only' : 'Welcome back'}
        </span>
      </div>
    </header>
  )
}
