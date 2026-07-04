"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ExpiringMembersTable } from "@/components/subscriptions/ExpiringMembersTable"
import { useExpiringSubscriptions } from "@/hooks/api/useSubscriptions"
import { Select } from "@/components/ui/Select"

export default function ExpiringSubscriptionsPage() {
  const [days, setDays] = React.useState(7)
  const { data: subscriptions, isLoading } = useExpiringSubscriptions(days)

  return (
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-6xl mx-auto space-y-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/subscriptions" className="inline-flex items-center text-sm text-[var(--mute)] hover:text-[var(--on-primary)] mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
            <h1 className="text-3xl font-bold text-[var(--on-primary)]">Expiring Subscriptions</h1>
            <p className="text-sm text-[var(--mute)] mt-1">Members whose plans are ending soon</p>
          </div>
          
          <div className="flex items-center gap-2 bg-[var(--canvas-light)] px-3 py-2 border border-[var(--hairline-soft)] rounded-xl shadow-sm">
            <span className="text-sm font-medium text-[var(--ink-soft)]">Expiring in next:</span>
            <Select 
              value={days.toString()} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-28 h-9 text-sm border-none focus-visible:ring-0 shadow-none bg-[var(--canvas-paper)] rounded-lg cursor-pointer font-medium"
            >
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
            </Select>
          </div>
        </div>

        <ExpiringMembersTable
          subscriptions={subscriptions?.data || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
