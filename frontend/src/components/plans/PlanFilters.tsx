import * as React from "react"
import { Search, Filter } from "lucide-react"

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
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[var(--canvas-light)] p-3 rounded-xl border border-[var(--hairline-soft)] shadow-sm mb-6">
      <div className="relative flex-1 w-full lg:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ash)]" />
        <input
          type="text"
          placeholder="Search plans by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-[var(--on-primary)] focus:outline-none"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <select
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
          className="bg-transparent text-sm text-[var(--ink-soft)] font-medium focus:outline-none cursor-pointer border-l border-[var(--hairline-soft)] pl-3 py-1"
        >
          <option value="">All Types</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="HALF_YEARLY">Half Yearly</option>
          <option value="ANNUAL">Annual</option>
          <option value="CUSTOM">Custom</option>
        </select>

        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="bg-transparent text-sm text-[var(--ink-soft)] font-medium focus:outline-none cursor-pointer border-l border-[var(--hairline-soft)] pl-3 py-1"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button onClick={() => {}} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded-lg border-l border-[var(--hairline-soft)] transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
  )
}
