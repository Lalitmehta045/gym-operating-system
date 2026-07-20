'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { InvoiceFilters } from '@/components/invoices/InvoiceFilters';
import { useDashboardFinancialMetrics } from '@/hooks/api/useFinancials';
import { Download, Plus, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { useDebounce } from '@/hooks/useDebounce';

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getFilter, setFilter, setFilters, clearFilters } = useUrlFilters();
  
  const [localSearch, setLocalSearch] = React.useState(getFilter('search'));
  const debouncedSearch = useDebounce(localSearch, 300);

  React.useEffect(() => {
    setFilter('search', debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const status = getFilter('status') || 'ALL';
  const dateFilter = getFilter('dateFilter') || 'ALL_TIME';
  const paymentMethod = getFilter('paymentMethod');
  const dateFrom = getFilter('dateFrom');
  const dateTo = getFilter('dateTo');
  const minAmount = getFilter('minAmount');
  const maxAmount = getFilter('maxAmount');
  const membershipPlanId = getFilter('membershipPlanId');
  
  const { data: financials } = useDashboardFinancialMetrics();

  const total = financials?.totalInvoices || 0;
  const paid = financials?.paidInvoices || 0;
  const pending = financials?.pendingInvoices || 0;
  const overdue = Math.max(0, total - paid - pending);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] tracking-tight">Invoices</h1>
          <p className="text-[16px] text-[var(--mute)] mt-1">View and manage member invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-[var(--canvas-light)] border-[var(--hairline)] text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] h-10 px-4 rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="bg-[#6C47FF] hover:bg-[#5835e5] text-white h-10 px-4 rounded-lg flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* Total Invoices */}
        <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2 z-10">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <FileText className="w-5 h-5 text-[#6C47FF]" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Total Invoices</h3>
          </div>
          <div className="z-10 mt-2">
            <p className="text-3xl font-bold text-[var(--on-primary)] mb-1">{total}</p>
            <p className="text-xs text-[var(--ash)]">All time invoices</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 L0,25 C20,15 40,25 60,10 C80,-5 90,15 100,10 L100,30 Z" fill="none" stroke="#6C47FF" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2 z-10">
            <div className="p-2.5 bg-green-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Paid Invoices</h3>
          </div>
          <div className="z-10 mt-2">
            <p className="text-3xl font-bold text-[var(--on-primary)] mb-1">{paid}</p>
            <p className="text-xs text-[var(--ash)]">{total > 0 ? `${((paid / total) * 100).toFixed(1)}%` : '0%'} of total</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 L0,20 C20,25 40,10 60,15 C80,20 90,5 100,10 L100,30 Z" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2 z-10">
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Pending Invoices</h3>
          </div>
          <div className="z-10 mt-2">
            <p className="text-3xl font-bold text-[var(--on-primary)] mb-1">{pending}</p>
            <p className="text-xs text-[var(--ash)]">{total > 0 ? `${((pending / total) * 100).toFixed(1)}%` : '0%'} of total</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 L0,15 C20,10 40,20 60,15 C80,10 90,20 100,5 L100,30 Z" fill="none" stroke="#f97316" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-2 z-10">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Overdue Invoices</h3>
          </div>
          <div className="z-10 mt-2">
            <p className="text-3xl font-bold text-[var(--on-primary)] mb-1">{overdue}</p>
            <p className="text-xs text-[var(--ash)]">{total > 0 ? `${((overdue / total) * 100).toFixed(1)}%` : '0%'} of total</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,30 L0,20 C20,10 40,15 60,5 C80,-5 90,15 100,10 L100,30 Z" fill="none" stroke="#ef4444" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>

      <InvoiceFilters
        search={localSearch}
        setSearch={setLocalSearch}
        status={status}
        setStatus={(val) => setFilter('status', val)}
        dateFilter={dateFilter}
        setDateFilter={(val) => setFilter('dateFilter', val)}
        paymentMethod={paymentMethod}
        dateFrom={dateFrom}
        dateTo={dateTo}
        minAmount={minAmount}
        maxAmount={maxAmount}
        membershipPlanId={membershipPlanId}
        onApplyAdvancedFilters={(filters) => setFilters(filters)}
        onClearAdvancedFilters={() => clearFilters(['search', 'status', 'dateFilter'])}
      />

      <InvoicesTable 
        search={getFilter('search')}
        status={status}
        dateFilter={dateFilter}
        paymentMethod={paymentMethod}
        dateFrom={dateFrom}
        dateTo={dateTo}
        minAmount={minAmount ? parseFloat(minAmount) : undefined}
        maxAmount={maxAmount ? parseFloat(maxAmount) : undefined}
        membershipPlanId={membershipPlanId}
      />
    </div>
  );
}
