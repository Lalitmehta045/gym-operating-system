"use client"

import { useDashboardAttendance } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function AttendanceAnalytics() {
  const { data, isLoading, isError } = useDashboardAttendance()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load attendance analytics" />
  if (!data) return null

  const statuses = [
    { label: "Present", value: data.todayPresent, emoji: "✅", color: "#22c55e" },
    { label: "Absent", value: data.todayAbsent, emoji: "😢", color: "#ef4444" },
    { label: "Late", value: data.todayLate, emoji: "🕐", color: "#f59e0b" },
    { label: "Missed", value: data.todayMissed, emoji: "⊗", color: "#6b7280" },
  ]

  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[var(--on-primary)]">Attendance Analytics</h2>
        <span className="text-[13px] font-medium text-[var(--mute)] bg-[var(--canvas-paper)] border border-[var(--hairline-soft)] px-2.5 py-1 rounded-lg">
          Rate: {data.attendanceRate.toFixed(1)}%
        </span>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-3">
        {statuses.map((status, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <p className="text-[11px] text-[var(--ash)] font-medium mb-1">{status.label}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-[16px]">{status.emoji}</span>
              <span className="text-[20px] font-bold text-[var(--on-primary)]">{status.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
