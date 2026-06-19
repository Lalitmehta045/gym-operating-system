"use client"

import { useDashboardTopMembers } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/States"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/DataTable"

export function TopMembersTable() {
  const { data, isLoading, isError } = useDashboardTopMembers()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load top members" />
  if (!data) return null

  return (
    <div className="rounded-[8px] border border-[#ebebeb] bg-[#ffffff] p-[24px] shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a]">
      <h2 className="mb-[16px] font-mono text-[12px] uppercase tracking-wider text-[#888888]">Top Members (Attendance)</h2>

      {data.length === 0 ? (
        <EmptyState title="No members found" description="There is not enough attendance data to determine top members yet." />
      ) : (
        <div className="overflow-hidden rounded-[8px] border border-[#ebebeb]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead className="text-right">Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((member, index) => (
                <TableRow key={member.memberId}>
                  <TableCell className="font-medium text-[#888888]">#{index + 1}</TableCell>
                  <TableCell className="font-medium">{member.memberName}</TableCell>
                  <TableCell className="text-right">{member.attendancePercentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
