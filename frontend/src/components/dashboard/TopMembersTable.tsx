"use client"

import { useDashboardTopMembers } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States"
import { Trophy } from "lucide-react"

const rankEmojis = ["🥇", "🥈", "🥉"]

export function TopMembersTable() {
  const { data, isLoading, isError } = useDashboardTopMembers()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load top members" />
  if (!data) return null

  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#6C47FF]/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-[#6C47FF]" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--on-primary)]">Top Members <span className="text-[#f59e0b] font-normal">(Attendance)</span></h2>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState title="No members found" description="There is not enough attendance data to determine top members yet." />
      ) : (
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_1fr_140px] gap-2 px-3 py-2 text-[11px] font-medium text-[var(--ash)] uppercase tracking-wider border-b border-[var(--hairline-soft)]">
            <span>Rank</span>
            <span>Member Name</span>
            <span className="text-right">Attendance %</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-50">
            {data.map((member, index) => (
              <div key={member.memberId} className="grid grid-cols-[50px_1fr_140px] gap-2 px-3 py-2.5 items-center hover:bg-[var(--canvas-paper)]/50 transition-colors">
                {/* Rank */}
                <div className="flex items-center gap-1.5">
                  {index < 3 ? (
                    <span className="text-[16px]">{rankEmojis[index]}</span>
                  ) : null}
                  <span className="text-[13px] font-medium text-[var(--mute)]">#{index + 1}</span>
                </div>

                {/* Member Name */}
                <span className="text-[13px] font-medium text-[var(--on-primary)] truncate">{member.memberName}</span>

                {/* Attendance % with Progress Bar */}
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-20 h-1.5 bg-[var(--canvas-paper)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6C47FF] to-[#8b5cf6]"
                      style={{ width: `${Math.min(100, Math.max(0, member.attendancePercentage))}%` }}
                    />
                  </div>
                  <span className="text-[13px] font-medium text-[var(--ink-soft)] w-14 text-right">
                    {member.attendancePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
