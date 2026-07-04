"use client"

import { usePlatformPlans } from "@/hooks/api/usePlatform"
import { CheckCircle2, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function PlanCards() {
  const { data, isLoading } = usePlatformPlans()

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[400px] rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {data.map((plan) => (
        <div 
          key={plan.id} 
          className="relative flex flex-col rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="absolute right-4 top-4">
            <button className="text-[var(--ash)] hover:text-[var(--on-primary)]">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-[18px] font-semibold text-[var(--on-primary)]">{plan.name}</h3>
            <div className="mt-4 flex items-baseline text-[36px] font-bold text-[var(--on-primary)]">
              ${plan.price}
              <span className="ml-1 text-[14px] font-medium text-[#666666]">/mo</span>
            </div>
            <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              {plan.status}
            </span>
          </div>

          <ul className="mb-8 flex-1 space-y-4">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="mr-3 h-5 w-5 flex-shrink-0 text-[var(--on-primary)]" />
                <span className="text-[14px] text-[#666666]">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex gap-2">
            <Button variant="outline" className="w-full">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
