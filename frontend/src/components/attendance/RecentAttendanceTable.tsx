"use client"

import { format } from "date-fns"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable"
import { useAttendances, useCheckOut, Attendance } from "@/hooks/api/useAttendances"
import { Button } from "@/components/ui/Button"
import { ArrowRight } from "lucide-react"
import { useSectionFilter } from "@/hooks/useSectionFilter"
import { DateFilter } from "@/components/ui/DateFilter"

// Helper to determine the visual status label
export function getStatusLabel(record: { status: string; checkOutAt?: string | null; attendanceDate: string }) {
  if (record.status === 'ABSENT') return 'ABSENT';
  if (record.status === 'MISSED') return 'MANUAL';
  
  // Parse date safely
  const recordDate = new Date(record.attendanceDate);
  const today = new Date();
  const isToday = recordDate.getFullYear() === today.getFullYear() &&
                  recordDate.getMonth() === today.getMonth() &&
                  recordDate.getDate() === today.getDate();
                  
  if (!record.checkOutAt && isToday) {
    return 'INSIDE';
  }
  return 'COMPLETED';
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    INSIDE: "bg-purple-100 text-purple-800 border-purple-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    ABSENT: "bg-red-100 text-red-800 border-red-200",
    MANUAL: "bg-amber-100 text-amber-800 border-amber-200",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-[var(--canvas-paper)] text-[var(--on-primary)]"}`}>
      {status}
    </span>
  )
}

export function RecentAttendanceTable() {
  const { dateRange } = useSectionFilter("attendance")
  const { data, isLoading } = useAttendances({ 
    page: 1, 
    limit: 10,
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  })
  const checkOutMutation = useCheckOut()

  const handleCheckOut = async (id: string) => {
    try {
      await checkOutMutation.mutateAsync({ id })
    } catch (err) {
      console.error("Check-out failed:", err)
    }
  }

  const attendances = data?.data || []

  return (
    <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm overflow-hidden mt-6">
      <div className="p-6 flex items-center justify-between border-b border-[var(--hairline-soft)] bg-[var(--canvas-light)]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-[var(--on-primary)]">Recent Attendance</h2>
          <DateFilter paramPrefix="attendance" />
        </div>
        <Link href="/attendance/history">
          <Button variant="secondary" size="sm" className="flex items-center gap-1 text-xs">
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-[var(--ash)]">Loading recent activities...</div>
      ) : attendances.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--ash)]">No recent attendance records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--canvas-paper)]/50 hover:bg-[var(--canvas-paper)]/50 border-b border-[var(--hairline-soft)]">
                <TableHead className="font-semibold text-[var(--mute)] text-xs uppercase tracking-wider h-11">Member</TableHead>
                <TableHead className="font-semibold text-[var(--mute)] text-xs uppercase tracking-wider h-11">Check In</TableHead>
                <TableHead className="font-semibold text-[var(--mute)] text-xs uppercase tracking-wider h-11">Check Out</TableHead>
                <TableHead className="font-semibold text-[var(--mute)] text-xs uppercase tracking-wider h-11">Status</TableHead>
                <TableHead className="font-semibold text-[var(--mute)] text-xs uppercase tracking-wider h-11">Marked By</TableHead>
                <TableHead className="font-semibold text-[var(--mute)] text-xs uppercase tracking-wider h-11 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.map((record) => {
                const visualStatus = getStatusLabel(record)
                return (
                  <TableRow key={record.id} className="border-b border-gray-50 hover:bg-[var(--canvas-paper)]/30 transition-colors">
                    <TableCell className="py-3">
                      <div className="font-medium text-[var(--on-primary)] text-sm">
                        {record.memberName || `${record.member?.firstName ?? ''} ${record.member?.lastName ?? ''}`.trim() || 'Unknown'}
                      </div>
                      <div className="text-[10px] text-[var(--mute)] mt-0.5">{record.member?.memberCode || '-'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--ink-soft)] font-medium">
                      {record.checkInAt ? format(new Date(record.checkInAt), 'MMM d, h:mm a') : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--ink-soft)] font-medium">
                      {record.checkOutAt ? format(new Date(record.checkOutAt), 'MMM d, h:mm a') : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={visualStatus} />
                    </TableCell>
                    <TableCell className="text-xs text-[var(--slate-soft)]">
                      {record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System/Self'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!record.checkOutAt && (record.status === 'PRESENT' || record.status === 'LATE') && (
                        <Button
                          size="sm"
                          className="bg-[var(--canvas-light)] border border-[#6C47FF] text-[#6C47FF] hover:bg-purple-50 rounded-lg text-xs font-medium cursor-pointer"
                          onClick={() => handleCheckOut(record.id)}
                          disabled={checkOutMutation.isPending}
                        >
                          Check Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
