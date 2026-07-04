'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { RevenueSummary } from '@/components/reports/RevenueSummary';
import { Receipt, Search, Filter, Calendar } from 'lucide-react';

export default function PaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('ALL');
  const [method, setMethod] = React.useState('ALL');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] tracking-tight">Payments & Revenue</h1>
          <p className="text-[16px] text-[var(--mute)] mt-1">Manage all incoming payments and track revenue</p>
        </div>
        <Button onClick={() => router.push('/payments/new')} className="bg-[#6C47FF] hover:bg-[#5835e5] text-white px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm">
          <Receipt className="w-5 h-5" />
          Record Payment
        </Button>
      </div>

      <RevenueSummary />

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

          <Button variant="outline" className="flex items-center gap-2 bg-[var(--canvas-light)] text-[var(--ink-soft)] border-[var(--hairline)] hover:bg-[var(--canvas-paper)] h-10 px-3 rounded-lg text-sm font-medium">
            <Calendar className="w-4 h-4 text-[var(--mute)]" />
            This Month
          </Button>

          <Button variant="outline" className="flex items-center gap-2 bg-[var(--canvas-light)] text-[var(--ink-soft)] border-[var(--hairline)] hover:bg-[var(--canvas-paper)] h-10 px-3 rounded-lg text-sm font-medium">
            <Filter className="w-4 h-4 text-[var(--mute)]" />
            Filters
          </Button>
        </div>
      </div>

      <PaymentsTable search={search} status={status} method={method} />
    </div>
  );
}
