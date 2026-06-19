"use client"

import { useDashboardRevenue } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function RevenueAnalytics() {
  const { data, isLoading, isError } = useDashboardRevenue()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load revenue analytics" />
  if (!data) return null

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
      <h2 className="font-mono text-[12px] uppercase tracking-wider text-[#888888]">Revenue Analytics</h2>

      <div className="mt-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-3">
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Total</span>
          <span className="text-[20px] font-semibold text-[#171717]">${data.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Monthly</span>
          <span className="text-[20px] font-semibold text-[#171717]">${data.monthlyRevenue.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Weekly</span>
          <span className="text-[20px] font-semibold text-[#171717]">${data.weeklyRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-[24px] border-t border-[#ebebeb] pt-[24px]">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-[#888888]">By Payment Method</h3>
        <div className="mt-[12px] grid grid-cols-2 gap-[16px] sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">Cash</span>
            <span className="text-[16px] font-medium text-[#171717]">${data.revenueByMethod.CASH.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">UPI</span>
            <span className="text-[16px] font-medium text-[#171717]">${data.revenueByMethod.UPI.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">Card</span>
            <span className="text-[16px] font-medium text-[#171717]">${data.revenueByMethod.CARD.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-[#4d4d4d]">Bank</span>
            <span className="text-[16px] font-medium text-[#171717]">${data.revenueByMethod.BANK_TRANSFER.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
