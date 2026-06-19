"use client"

import { useAttendanceReportsDaily } from "@/hooks/api/useAttendances"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { UserCheck, UserX, Clock, AlertCircle, Activity } from "lucide-react"

export function AttendanceDashboardCards() {
  const { data, isLoading, isError } = useAttendanceReportsDaily()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load attendance report" />
  if (!data) return null

  const cards = [
    { title: "Present", value: data.presentCount, icon: UserCheck },
    { title: "Absent", value: data.absentCount, icon: UserX },
    { title: "Late", value: data.lateCount, icon: Clock },
    { title: "Missed", value: data.missedCount, icon: AlertCircle },
    { title: "Attendance Rate", value: `${data.attendanceRate.toFixed(1)}%`, icon: Activity },
  ]

  return (
    <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div 
            key={i} 
            className="flex items-center justify-between rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]"
          >
            <div>
              <p className="font-mono text-[12px] uppercase tracking-wider text-[#888888]">
                {card.title}
              </p>
              <h3 className="mt-[8px] text-[24px] font-semibold text-[#171717]">
                {card.value}
              </h3>
            </div>
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#fafafa]">
              <Icon className="h-[24px] w-[24px] text-[#171717]" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
