'use client'

import * as React from "react"
import { Menu, Bell } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function Header({
  onMenuClick,
  className
}: {
  onMenuClick: () => void
  className?: string
}) {
  const { user } = useAuth()

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "GU"

  // Generate current date range display
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const formatDate = (d: Date) => `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
  const dateRangeStr = `${formatDate(weekStart)} - ${formatDate(weekEnd)}, ${weekEnd.getFullYear()}`

  return (
    <header className={cn("sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-[var(--canvas-soft)] px-6 sm:gap-x-6", className)}>
      <button
        type="button"
        className="-m-2.5 p-2.5 text-[var(--on-primary)] md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mail Notification */}
          <button onClick={() => {}} className="relative p-2 rounded-xl hover:bg-[var(--canvas-light)] transition-colors">
            <svg className="w-5 h-5 text-[var(--mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#EF4444] border-2 border-[#F8F7FF] rounded-full text-[8px] font-bold text-white flex items-center justify-center">
              2
            </span>
          </button>

          {/* User Avatar */}
          <button onClick={() => {}} className="flex items-center gap-2.5 bg-transparent px-1 py-1.5 transition-shadow">
            <div className="w-8 h-8 rounded-full bg-[#EF4444] flex items-center justify-center text-white text-[13px] font-semibold">
              D
            </div>
            <div className="hidden md:flex flex-col items-start min-w-0">
              <span className="text-[13px] font-medium text-[var(--ink-soft)] truncate">demo@gmail.com</span>
              <span className="text-[11px] text-[var(--mute)]">Admin</span>
            </div>
            <svg className="w-4 h-4 text-[var(--ash)] ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
