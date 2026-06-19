"use client"

import { useDashboardSubscriptions } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function SubscriptionAnalytics() {
  const { data, isLoading, isError } = useDashboardSubscriptions()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load subscription analytics" />
  if (!data) return null

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
      <h2 className="font-mono text-[12px] uppercase tracking-wider text-[#888888]">Subscription Analytics</h2>

      <div className="mt-[24px] grid grid-cols-2 gap-[16px] sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Active</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.activeSubscriptions}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Pending</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.pendingSubscriptions}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Expired</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.expiredSubscriptions}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Cancelled</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.cancelledSubscriptions}</span>
        </div>
      </div>

      <div className="mt-[24px] border-t border-[#ebebeb] pt-[24px]">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-[#888888]">Upcoming Expiries</h3>
        <div className="mt-[12px] grid grid-cols-3 gap-[16px]">
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">Next 7 Days</span>
            <span className="text-[16px] font-medium text-[#171717]">{data.expiringNext7Days}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">Next 15 Days</span>
            <span className="text-[16px] font-medium text-[#171717]">{data.expiringNext15Days}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">Next 30 Days</span>
            <span className="text-[16px] font-medium text-[#171717]">{data.expiringNext30Days}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
