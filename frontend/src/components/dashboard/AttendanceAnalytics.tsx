"use client"

import { useDashboardAttendance } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"

export function AttendanceAnalytics() {
  const { data, isLoading, isError } = useDashboardAttendance()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load attendance analytics" />
  if (!data) return null

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[12px] uppercase tracking-wider text-[#888888]">Attendance Analytics</h2>
        <span className="text-[14px] font-medium text-[#171717]">Rate: {data.attendanceRate.toFixed(1)}%</span>
      </div>

      <div className="mt-[24px] grid grid-cols-2 gap-[16px] sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Present</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.todayPresent}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Absent</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.todayAbsent}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Late</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.todayLate}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] text-[#4d4d4d]">Missed</span>
          <span className="text-[20px] font-semibold text-[#171717]">{data.todayMissed}</span>
        </div>
      </div>
    </div>
  )
}
