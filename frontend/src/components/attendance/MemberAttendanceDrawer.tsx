"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/Drawer"
import { useMemberAttendance } from "@/hooks/api/useAttendances"
import { LoadingState, ErrorState } from "@/components/ui/States"

interface MemberAttendanceDrawerProps {
  memberId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberAttendanceDrawer({ memberId, open, onOpenChange }: MemberAttendanceDrawerProps) {
  const { data, isLoading, isError } = useMemberAttendance(memberId || "")

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Member Attendance Stats</DrawerTitle>
          <DrawerDescription>Overview of attendance performance</DrawerDescription>
        </DrawerHeader>

        <div className="mt-6">
          {isLoading && <LoadingState />}
          {isError && <ErrorState title="Failed to load member stats" />}
          
          {data && (
            <div className="space-y-6">
              <div className="text-center p-6 bg-[#fafafa] rounded-[8px] border border-[#ebebeb]">
                <div className="text-4xl font-bold text-[#171717]">{data.attendancePercentage.toFixed(1)}%</div>
                <div className="text-sm text-[#888888] mt-1">Overall Attendance Rate</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-[#ebebeb] rounded-[8px]">
                  <div className="text-sm text-[#888888]">Total Present</div>
                  <div className="text-xl font-semibold text-[#171717]">{data.totalPresent}</div>
                </div>
                <div className="p-4 border border-[#ebebeb] rounded-[8px]">
                  <div className="text-sm text-[#888888]">Total Absent</div>
                  <div className="text-xl font-semibold text-[#171717]">{data.totalAbsent}</div>
                </div>
                <div className="p-4 border border-[#ebebeb] rounded-[8px]">
                  <div className="text-sm text-[#888888]">Total Late</div>
                  <div className="text-xl font-semibold text-[#171717]">{data.totalLate}</div>
                </div>
                <div className="p-4 border border-[#ebebeb] rounded-[8px]">
                  <div className="text-sm text-[#888888]">Total Missed</div>
                  <div className="text-xl font-semibold text-[#171717]">{data.totalMissed}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
