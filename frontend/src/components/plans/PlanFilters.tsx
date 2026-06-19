import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"

interface PlanFiltersProps {
  search: string
  setSearch: (value: string) => void
  planType: string
  setPlanType: (value: string) => void
  isActive: string
  setIsActive: (value: string) => void
}

export function PlanFilters({
  search,
  setSearch,
  planType,
  setPlanType,
  isActive,
  setIsActive,
}: PlanFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888]" />
        <Input
          placeholder="Search plans by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex gap-4 sm:w-auto w-full">
        <Select
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
          className="w-full sm:w-[160px]"
        >
          <option value="">All Types</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="HALF_YEARLY">Half Yearly</option>
          <option value="ANNUAL">Annual</option>
          <option value="CUSTOM">Custom</option>
        </Select>

        <Select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="w-full sm:w-[140px]"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>
    </div>
  )
}
