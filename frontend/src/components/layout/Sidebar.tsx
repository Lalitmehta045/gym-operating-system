'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, Calendar, Repeat, BarChart3, MessageSquare, Settings, Moon, Sun, Sparkles, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useProfile } from "@/hooks/api/useSettings"
import { useTheme } from "next-themes"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Plans", href: "/plans", icon: ClipboardList },
  { name: "Subscriptions", href: "/subscriptions", icon: Repeat },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/notifications", icon: BarChart3 },
  { name: "Messages", href: "/invoices", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Build display name from profile or fall back to email
  const firstName = profile?.firstName || ""
  const lastName = profile?.lastName || ""
  const fullName = (firstName && lastName)
    ? `${firstName} ${lastName}`
    : firstName || user?.email?.split("@")[0] || "User"

  const initials = (firstName && lastName)
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "GU"

  const userRole = user?.role === "OWNER" ? "Admin"
    : user?.role === "MANAGER" ? "Manager"
    : user?.role === "TRAINER" ? "Trainer"
    : "Admin"

  return (
    <div className={cn("flex h-full w-[240px] flex-col bg-[var(--sidebar-bg)]", className)}>
      {/* Logo */}
      <div className="flex h-14 items-center px-5 gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#6C47FF] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </div>
        <span className="text-[16px] font-bold tracking-tight text-white">GymOS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navigation.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)
            
          const isMembersActive = isActive && item.name === "Members"
          const isAttendanceActive = isActive && item.name === "Attendance"
          const isSubscriptionsActive = isActive && item.name === "Subscriptions"
          const isPlansActive = isActive && item.name === "Plans"
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 relative",
                isMembersActive
                  ? "bg-[#FFF0F0] text-[#EF4444] shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#EF4444] before:rounded-r-full"
                  : isAttendanceActive || isSubscriptionsActive || isPlansActive
                  ? "bg-[#F3F0FF] text-[#6C47FF] shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-[#6C47FF] before:rounded-r-full"
                  : isActive
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-sm"
                  : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--canvas-light)]/[0.06]"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors",
                  isMembersActive ? "text-[#EF4444]" : (isAttendanceActive || isSubscriptionsActive || isPlansActive) ? "text-[#6C47FF]" : isActive ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade to Pro Card */}
      <div className="px-3 pb-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#6C47FF]/20 to-[#6C47FF]/5 border border-[#6C47FF]/20 p-3.5">
          <div className="mb-1.5">
            <Sparkles className="w-5 h-5 text-[#a78bfa]" />
          </div>
          <h4 className="text-[12px] font-semibold text-white mb-0.5">Upgrade to Pro</h4>
          <p className="text-[10px] text-[var(--sidebar-text)] leading-relaxed mb-2.5">
            Unlock advanced analytics, custom reports and more.
          </p>
          <button className="w-full rounded-lg bg-[#6C47FF] hover:bg-[#5835DB] text-white text-[11px] font-medium py-1.5 px-3 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* User Profile + Theme Toggle */}
      <div className="px-3 pb-4 pt-2 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#6C47FF] flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white truncate">{fullName}</p>
              <p className="text-[10px] text-[var(--sidebar-text)] truncate">{userRole}</p>
            </div>
          </div>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg hover:bg-[var(--canvas-light)]/[0.08] transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--sidebar-text)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--sidebar-text)]" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
