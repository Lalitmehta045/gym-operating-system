"use client"

import { useDashboardSubscriptions } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function SubscriptionAnalytics() {
  const { data, isLoading, isError } = useDashboardSubscriptions()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load subscription analytics" />
  if (!data) return null

  return (
    <div className="metric-card">
      <h2 className="text-mono-caps text-[var(--mute)] border-b border-[var(--hairline-soft)] pb-4 mb-[24px]">Subscription Analytics</h2>

      <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Active</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.activeSubscriptions}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Pending</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.pendingSubscriptions}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Expired</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.expiredSubscriptions}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Cancelled</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.cancelledSubscriptions}</span>
        </div>
      </div>

      <div className="mt-[24px] border-t border-[var(--hairline-soft)] pt-[24px]">
        <h3 className="text-mono-caps text-[var(--mute)] mb-[12px]">Upcoming Expiries</h3>
        <div className="grid grid-cols-3 gap-[16px]">
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">Next 7 Days</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{data.expiringNext7Days}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">Next 15 Days</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{data.expiringNext15Days}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">Next 30 Days</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{data.expiringNext30Days}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
