"use client"

import { useDashboardMembers } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function MembersAnalytics() {
  const { data, isLoading, isError } = useDashboardMembers()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load member analytics" />
  if (!data) return null

  return (
    <div className="metric-card">
      <h2 className="text-mono-caps text-[var(--mute)] border-b border-[var(--hairline-soft)] pb-4 mb-[24px]">Member Analytics</h2>

      <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-5">
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Total Members</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.totalMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Active</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.activeMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Inactive</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.inactiveMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Suspended</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.suspendedMembers}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">New This Month</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.newMembersThisMonth}</span>
        </div>
      </div>
    </div>
  )
}
