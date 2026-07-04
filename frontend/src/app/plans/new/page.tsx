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
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-3xl mx-auto space-y-6 px-4">
        <div>
          <Link href="/plans" className="inline-flex items-center text-sm text-[var(--mute)] hover:text-[var(--on-primary)] mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-[var(--on-primary)]">Create Membership Plan</h1>
          <p className="text-sm text-[var(--mute)] mt-1">Add a new pricing tier for your members</p>
        </div>

        <PlanForm onSubmit={handleSubmit} isLoading={createPlan.isPending} submitLabel="Create Plan" />
      </div>
    </div>
  )
}
