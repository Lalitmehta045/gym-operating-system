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
    <div className="bg-[var(--canvas-light)] rounded-xl shadow-sm border border-[var(--hairline-soft)] p-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search by member..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="pl-10 h-[42px] w-full"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-[var(--ash)]" />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-[42px] w-full"
          >
            <option value="">All Status</option>
            <option value="INSIDE">Inside</option>
            <option value="COMPLETED">Completed</option>
            <option value="ABSENT">Absent</option>
            <option value="MANUAL">Manual</option>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-[150px] h-[42px]"
          />
          <span className="text-[var(--ash)]">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-[150px] h-[42px]"
          />
        </div>
      </div>
    </div>
  )
}
