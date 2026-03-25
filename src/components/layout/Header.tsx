'use client'

import { Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <button className="md:hidden" aria-label="Toggle menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Welcome back</span>
      </div>
    </header>
  )
}
