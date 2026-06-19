"use client"

import { useDashboardOverview } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { Users, UserCheck, CreditCard, Activity, Calendar, DollarSign, TrendingUp, AlertCircle } from "lucide-react"

export function OverviewCards() {
  const { data, isLoading, isError } = useDashboardOverview()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load overview data" />
  if (!data) return null

  const cards = [
    { title: "Total Members", value: data.totalMembers, icon: Users },
    { title: "Active Members", value: data.activeMembers, icon: UserCheck },
    { title: "Active Subscriptions", value: data.activeSubscriptions, icon: CreditCard },
    { title: "Expired Subscriptions", value: data.expiredSubscriptions, icon: AlertCircle },
    { title: "Today's Attendance", value: data.todayAttendance, icon: Calendar },
    { title: "Attendance Rate", value: `${data.monthlyAttendanceRate.toFixed(1)}%`, icon: Activity },
    { title: "Total Revenue", value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign },
    { title: "Monthly Revenue", value: `$${data.monthlyRevenue.toLocaleString()}`, icon: TrendingUp },
    { title: "Expiring Soon", value: data.expiringMemberships, icon: AlertCircle },
  ]

  return (
    <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={i}
            className="flex items-center justify-between rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]"
          >
            <div>
              <p className="font-mono text-[12px] uppercase tracking-wider text-[#888888]">
                {card.title}
              </p>
              <h3 className="mt-[8px] text-[24px] font-semibold text-[#171717]">
                {card.value}
              </h3>
            </div>
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fafafa]">
              <Icon className="h-[24px] w-[24px] text-[#171717]" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
