import * as React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdvancedFiltersDrawer } from '@/components/ui/AdvancedFiltersDrawer';

interface InvoiceFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  membershipPlanId: string;
  onApplyAdvancedFilters: (filters: { paymentMethod: string, dateFrom: string, dateTo: string, minAmount: string, maxAmount: string, membershipPlanId: string }) => void;
  onClearAdvancedFilters: () => void;
}

export function InvoiceFilters({
  search,
  setSearch,
  status,
  setStatus,
  dateFilter,
  setDateFilter,
  paymentMethod,
  dateFrom,
  dateTo,
  minAmount,
  maxAmount,
  membershipPlanId,
  onApplyAdvancedFilters,
  onClearAdvancedFilters
}: InvoiceFiltersProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  const [localPaymentMethod, setLocalPaymentMethod] = React.useState(paymentMethod);
  const [localDateFrom, setLocalDateFrom] = React.useState(dateFrom);
  const [localDateTo, setLocalDateTo] = React.useState(dateTo);
  const [localMinAmount, setLocalMinAmount] = React.useState(minAmount);
  const [localMaxAmount, setLocalMaxAmount] = React.useState(maxAmount);
  const [localMembershipPlanId, setLocalMembershipPlanId] = React.useState(membershipPlanId);

  React.useEffect(() => {
    if (drawerOpen) {
      setLocalPaymentMethod(paymentMethod);
      setLocalDateFrom(dateFrom);
      setLocalDateTo(dateTo);
      setLocalMinAmount(minAmount);
      setLocalMaxAmount(maxAmount);
      setLocalMembershipPlanId(membershipPlanId);
    }
  }, [drawerOpen, paymentMethod, dateFrom, dateTo, minAmount, maxAmount, membershipPlanId]);

  const handleApply = () => {
    onApplyAdvancedFilters({
      paymentMethod: localPaymentMethod,
      dateFrom: localDateFrom,
      dateTo: localDateTo,
      minAmount: localMinAmount,
      maxAmount: localMaxAmount,
      membershipPlanId: localMembershipPlanId
    });
  };

  const handleClear = () => {
    setLocalPaymentMethod("");
    setLocalDateFrom("");
    setLocalDateTo("");
    setLocalMinAmount("");
    setLocalMaxAmount("");
    setLocalMembershipPlanId("");
    onClearAdvancedFilters();
  };

  return (
    <>
      <div className="bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between mb-6 shadow-sm">
        <div className="relative w-full lg:w-[450px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ash)]" />
          <Input
            placeholder="Search by invoice number or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full bg-transparent border-[var(--hairline)] focus:border-[#6C47FF] focus:ring-[#6C47FF]/20"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] min-w-[130px] text-[var(--ink-soft)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          
          <Button 
            variant="outline" 
            onClick={() => setDateFilter(dateFilter === 'ALL_TIME' ? 'THIS_MONTH' : 'ALL_TIME')}
            className={`flex items-center gap-2 bg-[var(--canvas-light)] text-[var(--ink-soft)] border-[var(--hairline)] hover:bg-[var(--canvas-paper)] h-10 px-3 rounded-lg text-sm font-medium ${dateFilter === 'THIS_MONTH' ? 'bg-[var(--canvas-paper)] border-[#6C47FF] text-[#6C47FF]' : ''}`}
          >
            <Calendar className={`w-4 h-4 ${dateFilter === 'THIS_MONTH' ? 'text-[#6C47FF]' : 'text-[var(--mute)]'}`} />
            {dateFilter === 'ALL_TIME' ? 'All Time' : 'This Month'}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 bg-[var(--canvas-light)] text-[var(--ink-soft)] border-[var(--hairline)] hover:bg-[var(--canvas-paper)] h-10 px-3 rounded-lg text-sm font-medium relative"
          >
            <Filter className="w-4 h-4 text-[var(--mute)]" />
            Filters
            {(paymentMethod || dateFrom || dateTo || minAmount || maxAmount || membershipPlanId) && (
              <span className="w-2 h-2 rounded-full bg-[#EF4444] ml-1" />
            )}
          </Button>
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
              value={localMembershipPlanId}
              onChange={(e) => setLocalMembershipPlanId(e.target.value)}
              className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Payment Method</label>
            <div className="relative">
              <select
                value={localPaymentMethod}
                onChange={(e) => setLocalPaymentMethod(e.target.value)}
                className="w-full appearance-none bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm text-[var(--ink-soft)] focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              >
                <option value="">Any</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
              <svg className="w-4 h-4 text-[var(--ash)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Date From</label>
              <input
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Date To</label>
              <input
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Min Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={localMinAmount}
                onChange={(e) => setLocalMinAmount(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--ink-soft)] mb-1.5 block">Max Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={localMaxAmount}
                onChange={(e) => setLocalMaxAmount(e.target.value)}
                className="w-full bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
              />
            </div>
          </div>
        </div>
      </AdvancedFiltersDrawer>
    </>
  );
}
