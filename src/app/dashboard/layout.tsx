"use client"

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import '@/app/globals.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar mobileOpen={mobileMenuOpen} onNavigate={closeMobileMenu} />
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
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
