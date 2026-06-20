"use client"

import { useDashboardOverview } from "@/hooks/api/useDashboard"
import { useGymProfile } from "@/hooks/api/useSettings"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { Users, UserCheck, CreditCard, Activity, Calendar, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function OverviewCards() {
  const { data, isLoading, isError } = useDashboardOverview()
  const { data: gymProfile } = useGymProfile()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load overview data" />
  if (!data) return null

  const currency = gymProfile?.currency || "INR"

  const cards = [
    { title: "Total Members", value: data.totalMembers, icon: Users },
    { title: "Active Members", value: data.activeMembers, icon: UserCheck },
    { title: "Active Subscriptions", value: data.activeSubscriptions, icon: CreditCard },
    { title: "Expired Subscriptions", value: data.expiredSubscriptions, icon: AlertCircle },
    { title: "Today's Attendance", value: data.todayAttendance, icon: Calendar },
    { title: "Attendance Rate", value: `${data.monthlyAttendanceRate.toFixed(1)}%`, icon: Activity },
    { title: "Total Revenue", value: formatCurrency(data.totalRevenue, currency), icon: DollarSign },
    { title: "Monthly Revenue", value: formatCurrency(data.monthlyRevenue, currency), icon: TrendingUp },
    { title: "Expiring Soon", value: data.expiringMemberships, icon: AlertCircle },
  ]

  return (
    <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={i}
            className="metric-card flex flex-col justify-between h-full min-h-[140px]"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-mono-caps text-[var(--mute)]">
                {card.title}
              </p>
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-app-lg)] bg-[var(--canvas-soft)] border border-[var(--hairline-soft)] group-hover:border-[var(--brand)]/30 transition-colors">
                <Icon className="h-[18px] w-[18px] text-[var(--ash)]" />
              </div>
            </div>
            <div>
              <h3 className="text-[32px] font-semibold tracking-tight text-[var(--on-primary)]">
                {card.value}
              </h3>
            </div>
          </div>
        )
      })}
    </div>
  )
}
