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
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-3xl mx-auto space-y-6 px-4">
        <div>
          <Link href="/subscriptions" className="inline-flex items-center text-sm text-[var(--mute)] hover:text-[var(--on-primary)] mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-3xl font-bold text-[var(--on-primary)]">New Subscription</h1>
          <p className="text-sm text-[var(--mute)] mt-1">Enroll a member in a plan</p>
        </div>

        <SubscriptionForm onSubmit={handleSubmit} isLoading={createSubscription.isPending} submitLabel="Enroll Member" />
      </div>
    </div>
  )
}
