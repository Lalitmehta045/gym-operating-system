"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PlanForm } from "@/components/plans/PlanForm"
import { useCreatePlan } from "@/hooks/api/usePlans"
import { CreatePlanDto } from "@/hooks/api/usePlans"

export default function CreatePlanPage() {
  const router = useRouter()
  const createPlan = useCreatePlan()

  const handleSubmit = async (data: CreatePlanDto) => {
    try {
      await createPlan.mutateAsync(data)
      router.push("/plans")
    } catch (error) {
      console.error("Failed to create plan:", error)
      // We could add a toast notification here
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plans" className="text-[#888888] hover:text-[#171717] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Create Membership Plan</h1>
          <p className="text-sm text-[#888888]">Add a new pricing tier for your members</p>
        </div>
      </div>

      <PlanForm onSubmit={handleSubmit} isLoading={createPlan.isPending} submitLabel="Create Plan" />
    </div>
  )
}
