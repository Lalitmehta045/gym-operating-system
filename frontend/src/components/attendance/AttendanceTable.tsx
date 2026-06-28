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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-800"}`}>
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
    return <div className="p-8 text-center text-[#888888]">Loading attendance history...</div>
  }

  if (attendances.length === 0) {
    return <div className="p-8 text-center text-[#888888]">No attendance records found.</div>
  }

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Marked By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendances.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <button 
                  className="font-medium text-blue-600 hover:underline"
                  onClick={() => onMemberClick(record.memberId)}
                >
                  {record.memberName || `${record.member?.firstName ?? ''} ${record.member?.lastName ?? ''}`.trim() || 'Unknown'}
                  <div className="text-xs text-[#888888] font-normal">{record.member?.memberCode || '-'}</div>
                </button>
              </TableCell>
              <TableCell>{format(new Date(record.attendanceDate), 'MMM d, yyyy')}</TableCell>
              <TableCell>{record.checkInAt ? format(new Date(record.checkInAt), 'h:mm a') : '-'}</TableCell>
              <TableCell>{record.checkOutAt ? format(new Date(record.checkOutAt), 'h:mm a') : '-'}</TableCell>
              <TableCell>
                <StatusBadge status={record.status} />
              </TableCell>
              <TableCell>
                {record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'}
              </TableCell>
              <TableCell className="text-right">
                {!record.checkOutAt && (record.status === 'PRESENT' || record.status === 'LATE') && (
                  <Button 
                    variant="secondary" 
                    size="md"
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
