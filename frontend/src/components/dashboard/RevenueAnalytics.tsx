"use client"

import { useDashboardRevenue } from "@/hooks/api/useDashboard"
import { useGymProfile } from "@/hooks/api/useSettings"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { formatCurrency } from "@/lib/utils"

export function RevenueAnalytics() {
  const { data, isLoading, isError } = useDashboardRevenue()
  const { data: gymProfile } = useGymProfile()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load revenue analytics" />
  if (!data) return null

  const currency = gymProfile?.currency || "INR"

  return (
    <div className="metric-card">
      <h2 className="text-mono-caps text-[var(--mute)] border-b border-[var(--hairline-soft)] pb-4 mb-[24px]">Revenue Analytics</h2>

      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Total</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{formatCurrency(data.totalRevenue, currency)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Monthly</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{formatCurrency(data.monthlyRevenue, currency)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Weekly</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{formatCurrency(data.weeklyRevenue, currency)}</span>
        </div>
      </div>

      <div className="mt-[24px] border-t border-[var(--hairline-soft)] pt-[24px]">
        <h3 className="text-mono-caps text-[var(--mute)] mb-[12px]">By Payment Method</h3>
        <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">Cash</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{formatCurrency(data.revenueByMethod.CASH, currency)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">UPI</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{formatCurrency(data.revenueByMethod.UPI, currency)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">Card</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{formatCurrency(data.revenueByMethod.CARD, currency)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-body-sm text-[var(--ash)]">Bank</span>
            <span className="text-body font-medium text-[var(--on-primary)]">{formatCurrency(data.revenueByMethod.BANK_TRANSFER, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
