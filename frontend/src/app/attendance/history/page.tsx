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
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false)
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null)

  const { data, isLoading } = useAttendances({
    page: 1,
    limit: 50,
    memberId: memberSearch ? memberSearch : undefined,
    dateFrom: dateFrom ? dateFrom : undefined,
    dateTo: dateTo ? dateTo : undefined,
    ...(status === "INSIDE" ? { isInside: true } : {}),
    ...(status === "COMPLETED" ? { isInside: false, status: "PRESENT" } : {}),
    ...(status === "ABSENT" ? { status: "ABSENT" } : {}),
    ...(status === "MANUAL" ? { status: "MISSED" } : {}),
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
    <div className="min-h-screen bg-[var(--canvas-soft)] py-8">
      <div className="max-w-6xl mx-auto space-y-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/attendance" className="inline-flex items-center text-sm text-[var(--mute)] hover:text-[var(--on-primary)] mb-4 transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[var(--on-primary)]">Attendance History</h1>
            <p className="text-sm text-[var(--mute)] mt-1">View and manage all attendance records</p>
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
        startDate={dateFrom}
        setStartDate={setDateFrom}
        endDate={dateTo}
        setEndDate={setDateTo}
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
    </div>
  )
}
