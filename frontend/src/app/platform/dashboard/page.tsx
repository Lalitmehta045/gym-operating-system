"use client"

import { PlatformStatsCards } from "@/components/platform/PlatformStatsCards"
import { RevenueChart } from "@/components/platform/RevenueChart"

export default function PlatformDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-semibold text-[#171717]">Platform Dashboard</h1>
        <p className="text-[14px] text-[#666666] mt-1">Overview of your SaaS platform metrics.</p>
      </div>

      <PlatformStatsCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
      </div>
    </div>
  )
}
