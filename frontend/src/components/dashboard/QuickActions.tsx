"use client"

import Link from "next/link"
import { UserPlus, CreditCard, CalendarCheck, BarChart3 } from "lucide-react"

const actions = [
  {
    title: "Add Member",
    subtitle: "Register new member",
    icon: UserPlus,
    href: "/members",
    color: "#6C47FF",
    bg: "bg-[#6C47FF]/10",
  },
  {
    title: "New Subscription",
    subtitle: "Create subscription",
    icon: CreditCard,
    href: "/subscriptions",
    color: "#22c55e",
    bg: "bg-[#22c55e]/10",
  },
  {
    title: "Mark Attendance",
    subtitle: "Take attendance",
    icon: CalendarCheck,
    href: "/attendance",
    color: "#3b82f6",
    bg: "bg-[#3b82f6]/10",
  },
  {
    title: "View Reports",
    subtitle: "Detailed analytics",
    icon: BarChart3,
    href: "/notifications",
    color: "#f59e0b",
    bg: "bg-[#f59e0b]/10",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <Link
            key={i}
            href={action.href}
            className="flex items-center gap-3 bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-4 shadow-sm hover:shadow-md hover:border-[var(--hairline)] transition-all duration-200 group"
          >
            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--on-primary)]">{action.title}</p>
              <p className="text-[11px] text-[var(--ash)]">{action.subtitle}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
