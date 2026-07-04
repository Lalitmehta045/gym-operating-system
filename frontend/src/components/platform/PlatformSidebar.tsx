import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Repeat, DollarSign, ClipboardList, ClipboardCheck, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/platform/dashboard", icon: LayoutDashboard },
  { name: "Gyms", href: "/platform/gyms", icon: Building2 },
  { name: "Approvals", href: "/platform/approvals", icon: ClipboardCheck },
  { name: "Subscriptions", href: "/platform/subscriptions", icon: Repeat },
  { name: "Revenue", href: "/platform/revenue", icon: DollarSign },
  { name: "Plans", href: "/platform/plans", icon: ClipboardList },
  { name: "Audit Logs", href: "/platform/audit", icon: Activity },
]

export function PlatformSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-[240px] flex-col border-r border-[var(--hairline-soft)] bg-[var(--canvas-light)]", className)}>
      <div className="flex h-16 items-center px-[24px]">
        <span className="text-[16px] font-semibold tracking-tight text-[var(--on-primary)]">GymOS <span className="text-[12px] text-[#666666] ml-2 bg-[#f0f0f0] px-2 py-0.5 rounded-full">Platform</span></span>
      </div>
      <nav className="flex-1 space-y-1 px-[16px] py-[24px]">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-[6px] px-[12px] py-[8px] text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--canvas-soft)] text-[var(--on-primary)] shadow-[inset_3px_0_0_0_#171717]"
                  : "text-[var(--mute)] hover:bg-[var(--canvas-soft)] hover:text-[var(--on-primary)]"
              )}
            >
              <item.icon
                className={cn(
                  "mr-[12px] h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-[var(--on-primary)]" : "text-[var(--ash)] group-hover:text-[var(--on-primary)]"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
