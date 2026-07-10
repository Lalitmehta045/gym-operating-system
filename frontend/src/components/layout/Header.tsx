'use client'

import * as React from "react"
import { Menu, Bell, LogOut } from "lucide-react"
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
  const { user, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const profileRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

          {/* Notifications */}
          <button onClick={() => {}} className="relative p-2 rounded-xl hover:bg-[var(--canvas-light)] transition-colors">
            <Bell className="w-5 h-5 text-[var(--mute)]" />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#6C47FF] border-2 border-[var(--canvas-soft)] rounded-full text-[8px] font-bold text-white flex items-center justify-center">
              2
            </span>
          </button>

          {/* User Avatar */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className="flex items-center gap-2.5 bg-transparent px-1 py-1.5 transition-shadow"
            >
              <div className="w-8 h-8 rounded-full bg-[#6C47FF] flex items-center justify-center text-white text-[13px] font-semibold">
                {userInitials.substring(0, 1)}
              </div>
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="text-[13px] font-medium text-[var(--ink-soft)] truncate">{user?.email || "demo@gmail.com"}</span>
                <span className="text-[11px] text-[var(--mute)]">{user?.role === 'OWNER' ? 'Admin' : (user?.role || 'Admin')}</span>
              </div>
              <svg className={cn("w-4 h-4 text-[var(--ash)] ml-1 transition-transform", isProfileOpen ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--canvas-paper)] border border-[var(--hairline-soft)] shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-[var(--hairline-soft)]">
                  <p className="text-sm font-medium text-[var(--on-primary)] truncate">{user?.email || "demo@gmail.com"}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-[#EF4444] hover:bg-[var(--canvas-light)] flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
