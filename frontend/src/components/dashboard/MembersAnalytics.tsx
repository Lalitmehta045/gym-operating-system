"use client"

import { useDashboardMembers } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { useSectionFilter } from "@/hooks/useSectionFilter"
import { DateFilter } from "@/components/ui/DateFilter"
import { format } from "date-fns"
import { Users } from "lucide-react"

export function MembersAnalytics() {
  const { dateRange } = useSectionFilter("members")
  const dateParams = {
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }
  const { data, isLoading, isError } = useDashboardMembers(dateParams)

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load member analytics" />
  if (!data) return null

  const stats = [
    { label: "Total", value: data.totalMembers, color: null },
    { label: "Active", value: data.activeMembers, color: "#22c55e" },
    { label: "Inactive", value: data.inactiveMembers, color: "#f59e0b" },
    { label: "Suspended", value: data.suspendedMembers, color: null },
    { label: "New This Month", value: data.newMembersThisMonth, color: null },
  ]

  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6C47FF]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#6C47FF]" />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--on-primary)]">Member Growth</h2>
        </div>
        <DateFilter paramPrefix="members" />
      </div>

      {/* Stats Row */}
      <div className="flex items-end justify-between gap-2">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[12px] text-[var(--ash)] font-medium">{stat.label}</span>
              {stat.color && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
              )}
            </div>
            <span className="text-[22px] font-bold text-[var(--on-primary)]">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
