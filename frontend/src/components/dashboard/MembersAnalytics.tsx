"use client"

import { useDashboardMembers } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function MembersAnalytics() {
  const { data, isLoading, isError } = useDashboardMembers()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load member analytics" />
  if (!data) return null

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
      <h2 className="font-mono text-[12px] uppercase tracking-wider text-[#888888]">Member Analytics</h2>

      <div className="mt-[24px] grid grid-cols-2 gap-[16px] sm:grid-cols-5">
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Total Members</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.totalMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Active</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.activeMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Inactive</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.inactiveMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Suspended</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.suspendedMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">New This Month</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.newMembersThisMonth}</span>
        </div>
      </div>
    </div>
  )
}
