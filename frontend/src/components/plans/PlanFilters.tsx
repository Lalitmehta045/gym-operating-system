import * as React from "react"
import { Search, Filter } from "lucide-react"
import { AdvancedFiltersDrawer } from "@/components/ui/AdvancedFiltersDrawer"

interface PlanFiltersProps {
  search: string
  setSearch: (value: string) => void
  planType: string
  setPlanType: (value: string) => void
  isActive: string
  setIsActive: (value: string) => void
  minDuration: string
  maxDuration: string
  minPrice: string
  maxPrice: string
  onApplyAdvancedFilters: (filters: { minDuration: string, maxDuration: string, minPrice: string, maxPrice: string }) => void
  onClearAdvancedFilters: () => void
}

export function PlanFilters({
  search,
  setSearch,
  planType,
  setPlanType,
  isActive,
  setIsActive,
  minDuration,
  maxDuration,
  minPrice,
  maxPrice,
  onApplyAdvancedFilters,
  onClearAdvancedFilters
}: PlanFiltersProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [localMinDuration, setLocalMinDuration] = React.useState(minDuration)
  const [localMaxDuration, setLocalMaxDuration] = React.useState(maxDuration)
  const [localMinPrice, setLocalMinPrice] = React.useState(minPrice)
  const [localMaxPrice, setLocalMaxPrice] = React.useState(maxPrice)

  React.useEffect(() => {
    if (drawerOpen) {
      setLocalMinDuration(minDuration)
      setLocalMaxDuration(maxDuration)
      setLocalMinPrice(minPrice)
      setLocalMaxPrice(maxPrice)
    }
  }, [drawerOpen, minDuration, maxDuration, minPrice, maxPrice])

  const handleApply = () => {
    onApplyAdvancedFilters({
      minDuration: localMinDuration,
      maxDuration: localMaxDuration,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice
    })
  }

  const handleClear = () => {
    setLocalMinDuration("")
    setLocalMaxDuration("")
    setLocalMinPrice("")
    setLocalMaxPrice("")
    onClearAdvancedFilters()
  }

  return (
    <>
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
        
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
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

          <button 
            onClick={() => setDrawerOpen(true)} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded-lg border-l border-[var(--hairline-soft)] transition-colors relative"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(minDuration || maxDuration || minPrice || maxPrice) && (
              <span className="w-2 h-2 rounded-full bg-[#EF4444] ml-1" />
            )}
          </button>
        </div>
      </div>

      <AdvancedFiltersDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onApply={handleApply}
        onClearAll={handleClear}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Min Duration (days)</label>
              <input
                type="number"
                min="0"
                value={localMinDuration}
                onChange={(e) => setLocalMinDuration(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Max Duration (days)</label>
              <input
                type="number"
                min="0"
                value={localMaxDuration}
                onChange={(e) => setLocalMaxDuration(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Min Price (₹)</label>
              <input
                type="number"
                min="0"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Max Price (₹)</label>
              <input
                type="number"
                min="0"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
          </div>
        </div>
      </AdvancedFiltersDrawer>
    </>
  )
}
