'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { PaymentFilters } from '@/components/payments/PaymentFilters';
import { RevenueSummary } from '@/components/reports/RevenueSummary';
import { Receipt } from 'lucide-react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebounce } from '@/hooks/useDebounce';

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getFilter, setFilter, setFilters, clearFilters } = useUrlFilters();
  
  const [localSearch, setLocalSearch] = React.useState(getFilter('search'));
  const debouncedSearch = useDebounce(localSearch, 300);

  React.useEffect(() => {
    setFilter('search', debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const status = getFilter('status') || 'ALL';
  const method = getFilter('method') || 'ALL';
  const dateFilter = getFilter('dateFilter') || 'ALL_TIME';
  const minAmount = getFilter('minAmount');
  const maxAmount = getFilter('maxAmount');
  
  const getStartDate = () => {
    if (dateFilter === 'THIS_MONTH') {
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1) - (330 * 60 * 1000));
      return startOfMonth.toISOString();
    }
    return undefined;
  };

  React.useEffect(() => {
    if (user && user.role === 'TRAINER') {
      toast.error("You don't have permission for this page");
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user?.role === 'TRAINER') return null;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] tracking-tight">Payments & Revenue</h1>
          <p className="text-[16px] text-[var(--mute)] mt-1">Manage all incoming payments and track revenue</p>
        </div>
        {user?.role === 'OWNER' && (
          <Button onClick={() => router.push('/payments/new')} className="bg-[#6C47FF] hover:bg-[#5835e5] text-white px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm">
            <Receipt className="w-5 h-5" />
            Record Payment
          </Button>
        )}
      </div>

      <RevenueSummary />

      <PaymentFilters
        search={localSearch}
        setSearch={setLocalSearch}
        status={status}
        setStatus={(val) => setFilter('status', val)}
        method={method}
        setMethod={(val) => setFilter('method', val)}
        dateFilter={dateFilter}
        setDateFilter={(val) => setFilter('dateFilter', val)}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onApplyAdvancedFilters={(filters) => setFilters(filters)}
        onClearAdvancedFilters={() => clearFilters(['search', 'status', 'method', 'dateFilter'])}
      />

      <PaymentsTable 
        search={getFilter('search')} 
        status={status} 
        method={method} 
        startDate={getStartDate()} 
        minAmount={minAmount ? parseFloat(minAmount) : undefined}
        maxAmount={maxAmount ? parseFloat(maxAmount) : undefined}
      />
    </div>
  );
}
