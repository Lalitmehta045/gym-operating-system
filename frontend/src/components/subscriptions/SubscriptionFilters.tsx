import * as React from "react"
import { Search, Filter } from "lucide-react"
import { AdvancedFiltersDrawer } from "@/components/ui/AdvancedFiltersDrawer"

interface SubscriptionFiltersProps {
  search: string
  setSearch: (value: string) => void
  status: string
  setStatus: (value: string) => void
  membershipPlanId: string
  startDate: string
  endDate: string
  billingStatus: string
  onApplyAdvancedFilters: (filters: { membershipPlanId: string, startDate: string, endDate: string, billingStatus: string }) => void
  onClearAdvancedFilters: () => void
}

export function SubscriptionFilters({
  search,
  setSearch,
  status,
  setStatus,
  membershipPlanId,
  startDate,
  endDate,
  billingStatus,
  onApplyAdvancedFilters,
  onClearAdvancedFilters
}: SubscriptionFiltersProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [localPlanId, setLocalPlanId] = React.useState(membershipPlanId)
  const [localStartDate, setLocalStartDate] = React.useState(startDate)
  const [localEndDate, setLocalEndDate] = React.useState(endDate)
  const [localBillingStatus, setLocalBillingStatus] = React.useState(billingStatus)

  React.useEffect(() => {
    if (drawerOpen) {
      setLocalPlanId(membershipPlanId)
      setLocalStartDate(startDate)
      setLocalEndDate(endDate)
      setLocalBillingStatus(billingStatus)
    }
  }, [drawerOpen, membershipPlanId, startDate, endDate, billingStatus])

  const handleApply = () => {
    onApplyAdvancedFilters({
      membershipPlanId: localPlanId,
      startDate: localStartDate,
      endDate: localEndDate,
      billingStatus: localBillingStatus
    })
  }

  const handleClear = () => {
    setLocalPlanId("")
    setLocalStartDate("")
    setLocalEndDate("")
    setLocalBillingStatus("")
    onClearAdvancedFilters()
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[var(--canvas-light)] p-3 rounded-xl border border-[var(--hairline-soft)] shadow-sm mb-6">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ash)]" />
          <input
            type="text"
            placeholder="Search by member name, plan, or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-[var(--on-primary)] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-transparent text-sm text-[var(--ink-soft)] font-medium focus:outline-none cursor-pointer border-l border-[var(--hairline-soft)] pl-3"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <button 
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded-lg border-l border-[var(--hairline-soft)] transition-colors relative"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(membershipPlanId || startDate || endDate || billingStatus) && (
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
          <div>
            <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Plan ID</label>
            <input
              type="text"
              placeholder="e.g. plan-123"
              value={localPlanId}
              onChange={(e) => setLocalPlanId(e.target.value)}
              className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Start Date</label>
              <input
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">End Date (Renewal)</label>
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Billing Status</label>
            <div className="relative">
              <select
                value={localBillingStatus}
                onChange={(e) => setLocalBillingStatus(e.target.value)}
                className="w-full appearance-none bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              >
                <option value="">Any</option>
                <option value="PAID">Paid</option>
                <option value="DUE">Due</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
              </select>
              <svg className="w-4 h-4 text-[var(--ash)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </AdvancedFiltersDrawer>
    </>
  )
}
