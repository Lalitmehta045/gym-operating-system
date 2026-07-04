"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PlanTable } from "@/components/plans/PlanTable"
import { PlanFilters } from "@/components/plans/PlanFilters"
import { PlanDashboardCards } from "@/components/plans/PlanDashboardCards"
import { usePlans, useDeletePlan } from "@/hooks/api/usePlans"
import { useAuth } from "@/hooks/useAuth"

export default function PlansPage() {
  const { user } = useAuth()
  const isOwner = user?.role === "OWNER"

  const [search, setSearch] = React.useState("")
  const [planType, setPlanType] = React.useState("")
  const [isActive, setIsActive] = React.useState("")

  const { data, isLoading } = usePlans({
    search: search || undefined,
    planType: planType || undefined,
    isActive: isActive === "" ? undefined : isActive === "true",
  })

  const deletePlan = useDeletePlan()

  const handleDelete = async (id: string) => {
    try {
      await deletePlan.mutateAsync(id)
    } catch (error) {
      console.error("Failed to delete plan:", error)
    }
  }

  return (
    <div className="flex flex-col pb-8 pt-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] leading-none">Membership Plans</h1>
          <p className="text-sm text-[var(--mute)]">Manage your gym's membership packages</p>
        </div>
        {isOwner && (
          <Link href="/plans/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5b3ce0] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </Link>
        )}
      </div>

      {/* DASHBOARD CARDS */}
      <PlanDashboardCards />

      {/* SEARCH/FILTERS */}
      <PlanFilters
        search={search}
        setSearch={setSearch}
        planType={planType}
        setPlanType={setPlanType}
        isActive={isActive}
        setIsActive={setIsActive}
      />

      {/* TABLE */}
      <PlanTable
        plans={data?.data || []}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )
}
