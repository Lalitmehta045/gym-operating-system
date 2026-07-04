"use client"

import { GymsTable } from "@/components/platform/GymsTable"

export default function PlatformGymsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--on-primary)]">Gyms</h1>
          <p className="text-[14px] text-[#666666] mt-1">Manage all tenant gyms on the platform.</p>
        </div>
      </div>

      <GymsTable />
    </div>
  )
}
