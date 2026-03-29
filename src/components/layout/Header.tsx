'use client'

import Image from 'next/image'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  mobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

export default function Header({ mobileMenuOpen, onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 transition-colors hover:bg-accent md:hidden"
          aria-label="Toggle menu"
          onClick={onToggleMobileMenu}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="FitTrack Analytics logo"
            width={24}
            height={24}
            className="h-6 w-6 rounded-md"
          />
          <span className="text-sm font-semibold text-foreground">FitTrack Analytics</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Welcome back</span>
      </div>
    </header>
  )
}
