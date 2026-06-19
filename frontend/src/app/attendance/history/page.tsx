"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters"
import { ManualAttendanceModal } from "@/components/attendance/ManualAttendanceModal"
import { MemberAttendanceDrawer } from "@/components/attendance/MemberAttendanceDrawer"
import { useAttendances, useCheckOut } from "@/hooks/api/useAttendances"

export default function AttendanceHistoryPage() {
  const [memberSearch, setMemberSearch] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false)
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null)

  const { data, isLoading } = useAttendances({
    page: 1,
    limit: 50,
    memberId: memberSearch ? memberSearch : undefined, // Assuming search is ID for now, or the API handles search string
    status: status ? status : undefined,
    startDate: startDate ? startDate : undefined,
    endDate: endDate ? endDate : undefined
  })

  const checkOutMutation = useCheckOut()

  const handleCheckOut = async (id: string) => {
    try {
      await checkOutMutation.mutateAsync({ id })
    } catch (err) {
      console.error("Check-out failed", err)
    }
  }

  const handleMemberClick = (id: string) => {
    setSelectedMemberId(id)
  }

  return (
    <div className="flex flex-col gap-y-[32px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-y-[8px]">
          <Link href="/attendance" className="inline-flex items-center text-sm text-[#888888] hover:text-[#171717] mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">Attendance History</h1>
          <p className="text-[16px] text-[#4d4d4d]">View and manage all attendance records</p>
        </div>
        <Button variant="primary" onClick={() => setIsManualModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </div>

      <AttendanceFilters 
        memberSearch={memberSearch}
        setMemberSearch={setMemberSearch}
        status={status}
        setStatus={setStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <AttendanceTable 
        attendances={data?.data || []}
        isLoading={isLoading}
        onCheckOut={handleCheckOut}
        onMemberClick={handleMemberClick}
      />

      <ManualAttendanceModal 
        open={isManualModalOpen} 
        onOpenChange={setIsManualModalOpen} 
      />

      <MemberAttendanceDrawer 
        memberId={selectedMemberId}
        open={!!selectedMemberId}
        onOpenChange={(open) => !open && setSelectedMemberId(null)}
      />
    </div>
  )
}
