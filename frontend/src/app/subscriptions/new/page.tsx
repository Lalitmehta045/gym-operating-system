"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm"
import { useCreateSubscription } from "@/hooks/api/useSubscriptions"
import { CreateSubscriptionDto } from "@/hooks/api/useSubscriptions"

export default function CreateSubscriptionPage() {
  const router = useRouter()
  const createSubscription = useCreateSubscription()

  const handleSubmit = async (data: CreateSubscriptionDto) => {
    try {
      await createSubscription.mutateAsync(data)
      router.push("/subscriptions")
    } catch (error) {
      console.error("Failed to create subscription:", error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/subscriptions" className="text-[#888888] hover:text-[#171717] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">New Subscription</h1>
          <p className="text-sm text-[#888888]">Enroll a member in a plan</p>
        </div>
      </div>

      <SubscriptionForm onSubmit={handleSubmit} isLoading={createSubscription.isPending} submitLabel="Enroll Member" />
    </div>
  )
}
