import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, Calendar, ClipboardList, Repeat, Receipt, Bell, Settings, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Members", href: "/members", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "QR Scan", href: "/attendance/scan", icon: ScanLine },
  { name: "Plans", href: "/plans", icon: ClipboardList },
  { name: "Subscriptions", href: "/subscriptions", icon: Repeat },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-[240px] flex-col border-r border-[#ebebeb] bg-[#ffffff]", className)}>
      <div className="flex h-16 items-center px-[24px]">
        <span className="text-[16px] font-semibold tracking-tight text-[#171717]">GymOS</span>
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
                  ? "bg-[#fafafa] text-[#171717] shadow-[inset_3px_0_0_0_#171717]"
                  : "text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]"
              )}
            >
              <item.icon
                className={cn(
                  "mr-[12px] h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-[#171717]" : "text-[#888888] group-hover:text-[#171717]"
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
