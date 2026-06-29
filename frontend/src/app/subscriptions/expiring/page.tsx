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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/subscriptions" className="text-[#888888] hover:text-[#171717] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#171717]">Expiring Subscriptions</h1>
            <p className="text-sm text-[#888888]">Members whose plans are ending soon</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 border border-[#ebebeb] rounded-[6px]">
          <span className="text-sm font-medium text-[#171717]">Expiring in next:</span>
          <Select 
            value={days.toString()} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-24 h-8 text-sm"
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
  )
}
