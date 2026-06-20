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
    <div className="metric-card">
      <h2 className="mb-[16px] text-mono-caps text-[var(--mute)]">Top Members (Attendance)</h2>

      {data.length === 0 ? (
        <EmptyState title="No members found" description="There is not enough attendance data to determine top members yet." />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-app-lg)] border border-[var(--hairline-soft)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[var(--hairline-soft)] hover:bg-[var(--canvas)]">
                <TableHead className="w-16 text-[var(--mute)]">Rank</TableHead>
                <TableHead className="text-[var(--mute)]">Member Name</TableHead>
                <TableHead className="text-right text-[var(--mute)]">Attendance %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((member, index) => (
                <TableRow key={member.memberId} className="border-b border-[var(--hairline-soft)] hover:bg-[var(--canvas)]">
                  <TableCell className="font-medium text-[var(--ash)]">#{index + 1}</TableCell>
                  <TableCell className="font-medium text-[var(--on-primary)]">{member.memberName}</TableCell>
                  <TableCell className="text-right text-[var(--on-primary)]">{member.attendancePercentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
