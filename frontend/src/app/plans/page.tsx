"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PlanTable } from "@/components/plans/PlanTable"
import { PlanFilters } from "@/components/plans/PlanFilters"
import { usePlans, useDeletePlan } from "@/hooks/api/usePlans"

export default function PlansPage() {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Membership Plans</h1>
          <p className="text-sm text-[#888888]">Manage your gym&apos;s membership packages</p>
        </div>
        <Link href="/plans/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
        </Link>
      </div>

      <PlanFilters
        search={search}
        setSearch={setSearch}
        planType={planType}
        setPlanType={setPlanType}
        isActive={isActive}
        setIsActive={setIsActive}
      />

      <PlanTable
        plans={data?.data || []}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )
}
