"use client"

import { usePlatformRevenue } from "@/hooks/api/usePlatform"
import { RevenueChart } from "@/components/platform/RevenueChart"
import { DollarSign, TrendingUp, Calendar } from "lucide-react"

export default function PlatformRevenuePage() {
  const { data, isLoading } = usePlatformRevenue()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717]">Revenue</h1>
          <p className="text-[14px] text-[#666666] mt-1">Platform financial metrics and revenue tracking.</p>
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-[24px] sm:grid-cols-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#ebebeb] bg-white p-6 h-[116px]"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-[24px] sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-[#ebebeb] bg-white p-6">
            <dt>
              <div className="absolute rounded-md p-3 text-emerald-600 bg-gray-50">
                <DollarSign className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-[14px] font-medium text-[#666666]">
                MRR (Monthly Recurring Revenue)
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-[24px] font-semibold text-[#171717]">
                {formatCurrency(data.mrr)}
              </p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-[#ebebeb] bg-white p-6">
            <dt>
              <div className="absolute rounded-md p-3 text-blue-600 bg-gray-50">
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-[14px] font-medium text-[#666666]">
                ARR (Annual Recurring Revenue)
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-[24px] font-semibold text-[#171717]">
                {formatCurrency(data.arr)}
              </p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-[#ebebeb] bg-white p-6">
            <dt>
              <div className="absolute rounded-md p-3 text-indigo-600 bg-gray-50">
                <Calendar className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-[14px] font-medium text-[#666666]">
                Revenue This Month
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
              <p className="text-[24px] font-semibold text-[#171717]">
                {formatCurrency(data.revenueThisMonth)}
              </p>
            </dd>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
      </div>
    </div>
  )
}
