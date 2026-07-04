"use client"

import { SubscriptionTable } from "@/components/platform/SubscriptionTable"

export default function PlatformSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--on-primary)]">Subscriptions</h1>
          <p className="text-[14px] text-[#666666] mt-1">View all tenant subscriptions across the platform.</p>
        </div>
      </div>

      <SubscriptionTable />
    </div>
  )
}
