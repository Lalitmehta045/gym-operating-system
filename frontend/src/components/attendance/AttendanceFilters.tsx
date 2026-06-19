"use client"

import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Search } from "lucide-react"

interface AttendanceFiltersProps {
  memberSearch: string
  setMemberSearch: (v: string) => void
  status: string
  setStatus: (v: string) => void
  startDate: string
  setStartDate: (v: string) => void
  endDate: string
  setEndDate: (v: string) => void
}

export function AttendanceFilters({
  memberSearch, setMemberSearch,
  status, setStatus,
  startDate, setStartDate,
  endDate, setEndDate
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
        <Input
          placeholder="Search by member..."
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-full sm:w-[180px]">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
          <option value="MISSED">Missed</option>
        </Select>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full sm:w-[150px]"
        />
        <span className="text-[#888888]">-</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full sm:w-[150px]"
        />
      </div>
    </div>
  )
}
