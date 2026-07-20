"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { PlanTable } from "@/components/plans/PlanTable"
import { PlanFilters } from "@/components/plans/PlanFilters"
import { PlanDashboardCards } from "@/components/plans/PlanDashboardCards"
import { usePlans, useDeletePlan } from "@/hooks/api/usePlans"
import { useAuth } from "@/hooks/useAuth"
import { useUrlFilters } from "@/hooks/useUrlFilters"
import { useDebounce } from "@/hooks/useDebounce"

export default function PlansPage() {
  const { user } = useAuth()
  const canManage = user?.role === "OWNER"

  const { getFilter, setFilter, setFilters, clearFilters } = useUrlFilters()

  const [localSearch, setLocalSearch] = React.useState(getFilter("search"))
  const debouncedSearch = useDebounce(localSearch, 300)

  React.useEffect(() => {
    setFilter("search", debouncedSearch)
  }, [debouncedSearch, setFilter])

  const planType = getFilter("planType")
  const isActive = getFilter("isActive")
  const minDuration = getFilter("minDuration")
  const maxDuration = getFilter("maxDuration")
  const minPrice = getFilter("minPrice")
  const maxPrice = getFilter("maxPrice")

  const { data, isLoading } = usePlans({
    search: getFilter("search") || undefined,
    planType: planType || undefined,
    isActive: isActive === "" ? undefined : isActive === "true",
    minDuration: minDuration ? parseInt(minDuration, 10) : undefined,
    maxDuration: maxDuration ? parseInt(maxDuration, 10) : undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
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
        {canManage && (
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
        search={localSearch}
        setSearch={setLocalSearch}
        planType={planType}
        setPlanType={(val) => setFilter("planType", val)}
        isActive={isActive}
        setIsActive={(val) => setFilter("isActive", val)}
        minDuration={minDuration}
        maxDuration={maxDuration}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApplyAdvancedFilters={(filters) => setFilters(filters)}
        onClearAdvancedFilters={() => clearFilters(["search", "planType", "isActive"])}
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
