import * as React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdvancedFiltersDrawer } from '@/components/ui/AdvancedFiltersDrawer';

interface PaymentFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  method: string;
  setMethod: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  minAmount: string;
  maxAmount: string;
  onApplyAdvancedFilters: (filters: { minAmount: string, maxAmount: string }) => void;
  onClearAdvancedFilters: () => void;
}

export function PaymentFilters({
  search,
  setSearch,
  status,
  setStatus,
  method,
  setMethod,
  dateFilter,
  setDateFilter,
  minAmount,
  maxAmount,
  onApplyAdvancedFilters,
  onClearAdvancedFilters
}: PaymentFiltersProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  const [localMinAmount, setLocalMinAmount] = React.useState(minAmount);
  const [localMaxAmount, setLocalMaxAmount] = React.useState(maxAmount);

  React.useEffect(() => {
    if (drawerOpen) {
      setLocalMinAmount(minAmount);
      setLocalMaxAmount(maxAmount);
    }
  }, [drawerOpen, minAmount, maxAmount]);

  const handleApply = () => {
    onApplyAdvancedFilters({
      minAmount: localMinAmount,
      maxAmount: localMaxAmount
    });
  };

  const handleClear = () => {
    setLocalMinAmount("");
    setLocalMaxAmount("");
    onClearAdvancedFilters();
  };

  return (
    <>
      <div className="bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between mb-6 shadow-sm">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ash)]" />
          <Input
            placeholder="Search by name, email, invoice or transaction ID..."
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
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)} 
            className="h-10 px-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] min-w-[130px] text-[var(--ink-soft)]"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
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
            {(minAmount || maxAmount) && (
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
