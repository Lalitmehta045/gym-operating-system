"use client"

import { usePlatformDashboard } from "@/hooks/api/usePlatform"
import { Building2, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react"

export function PlatformStatsCards() {
  const { data, isLoading } = usePlatformDashboard()

  if (isLoading || !data) {
    return (
      <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6 h-[116px]"></div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      name: "Total Gyms",
      value: data.totalGyms,
      icon: Building2,
      color: "text-[var(--on-primary)]",
    },
    {
      name: "Active",
      value: data.activeGyms,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      name: "Trial",
      value: data.trialGyms,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      name: "Suspended",
      value: data.suspendedGyms,
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      name: "Expired",
      value: data.expiredGyms,
      icon: XCircle,
      color: "text-red-600",
    },
  ]

  return (
    <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color} bg-[var(--canvas-paper)]`}>
              <stat.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-[14px] font-medium text-[#666666]">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
            <p className="text-[24px] font-semibold text-[var(--on-primary)]">
              {stat.value}
            </p>
          </dd>
        </div>
      ))}
    </div>
  )
}
