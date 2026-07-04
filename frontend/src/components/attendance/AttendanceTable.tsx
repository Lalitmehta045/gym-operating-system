"use client"

import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable"
import { Attendance } from "@/hooks/api/useAttendances"
import { Button } from "@/components/ui/Button"

// Assuming standard States.tsx badge or I will use inline styling
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-800 border-green-200",
    ABSENT: "bg-red-100 text-red-800 border-red-200",
    LATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    MISSED: "bg-orange-100 text-orange-800 border-orange-200",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-[var(--canvas-paper)] text-[var(--on-primary)]"}`}>
      {status}
    </span>
  )
}

interface AttendanceTableProps {
  attendances: Attendance[]
  isLoading: boolean
  onCheckOut: (id: string) => void
  onMemberClick: (memberId: string) => void
}

export function AttendanceTable({ attendances, isLoading, onCheckOut, onMemberClick }: AttendanceTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-[var(--ash)]">Loading attendance history...</div>
  }

  if (attendances.length === 0) {
    return <div className="p-8 text-center text-[var(--ash)]">No attendance records found.</div>
  }

  return (
    <div className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--canvas-light)] shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--canvas-paper)]/50 hover:bg-[var(--canvas-paper)]/50 border-b border-[var(--hairline-soft)]">
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Member</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Date</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Check In</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Check Out</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Status</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12">Marked By</TableHead>
            <TableHead className="font-medium text-[var(--mute)] text-xs uppercase tracking-wider h-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendances.map((record) => (
            <TableRow key={record.id} className="border-b border-gray-50 hover:bg-[var(--canvas-paper)]/50 transition-colors">
              <TableCell className="py-3">
                <button 
                  className="font-medium text-[#6C47FF] hover:text-purple-700 transition text-sm text-left"
                  onClick={() => onMemberClick(record.memberId)}
                >
                  {record.memberName || `${record.member?.firstName ?? ''} ${record.member?.lastName ?? ''}`.trim() || 'Unknown'}
                  <div className="text-xs text-[var(--mute)] font-normal mt-0.5">{record.member?.memberCode || '-'}</div>
                </button>
              </TableCell>
              <TableCell className="text-sm text-[var(--ink-soft)]">{format(new Date(record.attendanceDate), 'MMM d, yyyy')}</TableCell>
              <TableCell className="text-sm text-[var(--ink-soft)] font-medium">{record.checkInAt ? format(new Date(record.checkInAt), 'h:mm a') : '-'}</TableCell>
              <TableCell className="text-sm text-[var(--ink-soft)] font-medium">{record.checkOutAt ? format(new Date(record.checkOutAt), 'h:mm a') : '-'}</TableCell>
              <TableCell>
                <StatusBadge status={record.status} />
              </TableCell>
              <TableCell className="text-sm text-[var(--slate-soft)]">
                {record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'}
              </TableCell>
              <TableCell className="text-right">
                {!record.checkOutAt && (record.status === 'PRESENT' || record.status === 'LATE') && (
                  <Button 
                    size="sm"
                    className="bg-[var(--canvas-light)] border border-[#6C47FF] text-[#6C47FF] hover:bg-purple-50 rounded-lg text-xs font-medium"
                    onClick={() => onCheckOut(record.id)}
                  >
                    Check Out
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
