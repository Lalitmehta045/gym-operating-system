"use client"

import { useDashboardAttendance } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function AttendanceAnalytics() {
  const { data, isLoading, isError } = useDashboardAttendance()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load attendance analytics" />
  if (!data) return null

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between border-b border-[var(--hairline-soft)] pb-4 mb-[24px]">
        <h2 className="text-mono-caps text-[var(--mute)]">Attendance Analytics</h2>
        <span className="text-body-sm font-medium text-[var(--on-primary)]">Rate: {data.attendanceRate.toFixed(1)}%</span>
      </div>

      <div className="grid grid-cols-2 gap-[16px] sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Present</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.todayPresent}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Absent</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.todayAbsent}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Late</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.todayLate}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-body-sm text-[var(--ash)]">Missed</span>
          <span className="text-heading-sm text-[var(--on-primary)]">{data.todayMissed}</span>
        </div>
      </div>
    </div>
  )
}
