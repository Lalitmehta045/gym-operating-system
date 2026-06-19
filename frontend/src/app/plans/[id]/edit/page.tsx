"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PlanForm } from "@/components/plans/PlanForm"
import { usePlan, useUpdatePlan } from "@/hooks/api/usePlans"
import { CreatePlanDto } from "@/hooks/api/usePlans"

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const { data: plan, isLoading: isFetching } = usePlan(planId)
  const updatePlan = useUpdatePlan(planId)

  const handleSubmit = async (data: CreatePlanDto) => {
    try {
      await updatePlan.mutateAsync(data)
      router.push("/plans")
    } catch (error) {
      console.error("Failed to update plan:", error)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-[#888888] text-sm">Loading plan details...</span>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-[#888888] text-sm">Plan not found.</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/plans" className="text-[#888888] hover:text-[#171717] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Edit Plan: {plan.name}</h1>
          <p className="text-sm text-[#888888]">Update membership plan details</p>
        </div>
      </div>

      <PlanForm 
        initialValues={plan} 
        onSubmit={handleSubmit} 
        isLoading={updatePlan.isPending} 
        submitLabel="Save Changes" 
      />
    </div>
  )
}
