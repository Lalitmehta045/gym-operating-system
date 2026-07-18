"use client"

import { useDashboardSubscriptions } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { CheckCircle2, Clock, AlertCircle, XCircle, CalendarClock, CalendarDays, CalendarRange } from "lucide-react"
import { useSectionFilter } from "@/hooks/useSectionFilter"
import { DateFilter } from "@/components/ui/DateFilter"
import { format } from "date-fns"

export function SubscriptionAnalytics() {
  const { dateRange } = useSectionFilter("subscriptions")
  const dateParams = {
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }
  const { data, isLoading, isError } = useDashboardSubscriptions(dateParams)

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load subscription analytics" />
  if (!data) return null

  const statusBadges = [
    { label: "Active", value: data.activeSubscriptions, icon: CheckCircle2, color: "#22c55e", bg: "bg-[#22c55e]/10", textColor: "text-[#22c55e]" },
    { label: "Pending", value: data.pendingSubscriptions, icon: Clock, color: "#f59e0b", bg: "bg-[#f59e0b]/10", textColor: "text-[#f59e0b]" },
    { label: "Expired", value: data.expiredSubscriptions, icon: AlertCircle, color: "#ef4444", bg: "bg-[#ef4444]/10", textColor: "text-[#ef4444]" },
    { label: "Cancelled", value: data.cancelledSubscriptions, icon: XCircle, color: "#6b7280", bg: "bg-[var(--canvas-paper)]", textColor: "text-[var(--mute)]" },
  ]

  const expiryTimelines = [
    { label: "Next 7 Days", value: data.expiringNext7Days, icon: CalendarClock, sublabel: "Subscriptions" },
    { label: "Next 15 Days", value: data.expiringNext15Days, icon: CalendarDays, sublabel: "Subscriptions" },
    { label: "Next 30 Days", value: data.expiringNext30Days, icon: CalendarRange, sublabel: "Subscriptions" },
  ]

  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[var(--on-primary)]">Subscription Analytics</h2>
        <DateFilter paramPrefix="subscriptions" />
      </div>

      {/* Status Badges */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {statusBadges.map((badge, i) => {
          const Icon = badge.icon
          return (
            <div key={i} className={`flex items-center gap-2 ${badge.bg} rounded-full px-3 py-1.5`}>
              <Icon className={`w-3.5 h-3.5 ${badge.textColor}`} />
              <span className="text-[11px] text-[var(--mute)] font-medium">{badge.label}</span>
              <span className="text-[13px] font-bold text-[var(--on-primary)] bg-[var(--canvas-light)] rounded-full w-6 h-6 flex items-center justify-center shadow-sm">{badge.value}</span>
            </div>
          )
        })}
      </div>

      {/* Upcoming Expiries */}
      <div>
        <p className="text-[12px] text-[var(--ash)] font-medium mb-3">Upcoming Expiries</p>
        <div className="grid grid-cols-3 gap-3">
          {expiryTimelines.map((timeline, i) => {
            const Icon = timeline.icon
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-paper)]/50">
                <div className="w-9 h-9 rounded-full bg-[var(--canvas-light)] border border-[var(--hairline-soft)] flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-[var(--ash)]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-[var(--ash)] font-medium">{timeline.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[18px] font-bold text-[var(--on-primary)]">{timeline.value}</span>
                    <span className="text-[10px] text-[var(--ash)] truncate">{timeline.sublabel}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
