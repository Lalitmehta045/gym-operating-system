"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { usePlan } from "@/hooks/api/usePlans"

export default function PlanDetailsPage() {
  const params = useParams()
  const planId = params.id as string

  const { data: plan, isLoading } = usePlan(planId)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-[#888888] text-sm">Loading plan details...</span>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-[#ebebeb] rounded-[6px] bg-white">
        <span className="text-[#888888] text-sm mb-4">Plan not found.</span>
        <Link href="/plans">
          <Button variant="secondary">Back to Plans</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/plans" className="text-[#888888] hover:text-[#171717] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#171717]">{plan.name}</h1>
            <p className="text-sm text-[#888888]">Plan Details</p>
          </div>
        </div>
        <Link href={`/plans/${plan.id}/edit`}>
          <Button variant="secondary">
            <Edit className="mr-2 h-4 w-4" />
            Edit Plan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[6px] border border-[#ebebeb] space-y-4">
          <h2 className="text-lg font-medium text-[#171717] border-b border-[#ebebeb] pb-2">General Information</h2>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">Plan Type</p>
              <p className="text-sm text-[#171717] font-medium mt-1">{plan.planType}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">Duration</p>
              <p className="text-sm text-[#171717] font-medium mt-1">{plan.durationDays} Days</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">Status</p>
              <div className="mt-1">
                {plan.isActive ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-green-50 text-green-700 border border-green-200 text-[12px]">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-gray-50 text-gray-700 border border-gray-200 text-[12px]">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">Display Order</p>
              <p className="text-sm text-[#171717] font-medium mt-1">{plan.displayOrder}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">Description</p>
            <p className="text-sm text-[#171717] mt-1 bg-[#fafafa] p-3 rounded-[6px] border border-[#ebebeb] whitespace-pre-wrap">
              {plan.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[6px] border border-[#ebebeb] space-y-4">
          <h2 className="text-lg font-medium text-[#171717] border-b border-[#ebebeb] pb-2">Pricing</h2>
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">Amount</p>
            <p className="text-3xl text-[#171717] font-semibold mt-2">₹{plan.price.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
