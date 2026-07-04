"use client"

import { PlanCards } from "@/components/platform/PlanCards"
import { Button } from "@/components/ui/Button"
import { Plus } from "lucide-react"

export default function PlatformPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--on-primary)]">Membership Plans</h1>
          <p className="text-[14px] text-[#666666] mt-1">Manage the SaaS subscription plans available for gyms.</p>
        </div>
        <Button className="flex-shrink-0 bg-[#171717] text-white hover:bg-[#333333]">
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <PlanCards />
    </div>
  )
}
