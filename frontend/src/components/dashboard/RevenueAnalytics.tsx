"use client"

import { useDashboardRevenue } from "@/hooks/api/useDashboard"
import { useGymProfile } from "@/hooks/api/useSettings"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { formatCurrency } from "@/lib/utils"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useSectionFilter } from "@/hooks/useSectionFilter"
import { DateFilter } from "@/components/ui/DateFilter"
import { format } from "date-fns"
import { TrendingUp, Wallet, Smartphone, CreditCard, Landmark } from "lucide-react"

export function RevenueAnalytics() {
  const { dateRange } = useSectionFilter("revenue")
  const dateParams = {
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }
  const { data, isLoading, isError } = useDashboardRevenue(dateParams)
  const { data: gymProfile } = useGymProfile()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load revenue analytics" />
  if (!data) return null

  const currency = gymProfile?.currency || "INR"

  const paymentMethods = [
    { label: "Cash", value: data.revenueByMethod.CASH, icon: Wallet, color: "#f59e0b", bg: "bg-[#f59e0b]/10" },
    { label: "UPI", value: data.revenueByMethod.UPI, icon: Smartphone, color: "#3b82f6", bg: "bg-[#3b82f6]/10" },
    { label: "Card", value: data.revenueByMethod.CARD, icon: CreditCard, color: "#22c55e", bg: "bg-[#22c55e]/10" },
    { label: "Bank", value: data.revenueByMethod.BANK_TRANSFER, icon: Landmark, color: "#ef4444", bg: "bg-[#ef4444]/10" },
  ]

  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6C47FF]/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#6C47FF]" />
          </div>
          <h2 className="text-[15px] font-semibold text-[var(--on-primary)]">Revenue Analytics</h2>
        </div>
        <DateFilter paramPrefix="revenue" />
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-[12px] text-[var(--ash)] font-medium mb-1">Total Revenue</p>
          <p className="text-[20px] font-bold text-[#6C47FF]">{formatCurrency(data.totalRevenue, currency)}</p>
        </div>
        <div className="text-center">
          <p className="text-[12px] text-[var(--ash)] font-medium mb-1">Monthly</p>
          <p className="text-[20px] font-bold text-[var(--on-primary)]">{formatCurrency(data.monthlyRevenue, currency)}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[var(--ash)] font-medium mb-1">Weekly</p>
          <p className="text-[20px] font-bold text-[var(--on-primary)]">{formatCurrency(data.weeklyRevenue, currency)}</p>
        </div>
      </div>

      {/* By Payment Method */}
      <div>
        <p className="text-[12px] text-[var(--ash)] font-medium mb-3">By Payment Method</p>
        <div className="grid grid-cols-4 gap-3">
          {paymentMethods.map((method, i) => {
            const Icon = method.icon
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-xl ${method.bg} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" style={{ color: method.color }} />
                </div>
                <span className="text-[11px] text-[var(--ash)] font-medium">{method.label}</span>
                <span className="text-[14px] font-bold text-[var(--on-primary)] mt-0.5">
                  {formatCurrency(method.value, currency)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
