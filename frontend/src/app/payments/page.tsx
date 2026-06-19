'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PaymentsTable } from '@/components/payments/PaymentsTable';
import { RevenueSummary } from '@/components/reports/RevenueSummary';

export default function PaymentsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('ALL');
  const [method, setMethod] = React.useState('ALL');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Payments & Revenue</h1>
          <p className="text-[14px] text-[#888888] mt-1">Manage all incoming payments and track revenue</p>
        </div>
        <Button onClick={() => router.push('/payments/new')} variant="primary">
          Record Payment
        </Button>
      </div>

      <RevenueSummary />

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="w-full sm:w-1/3">
          <Input
            placeholder="Search by name or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/4">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </Select>
        </div>
        <div className="w-full sm:w-1/4">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </Select>
        </div>
      </div>

      <PaymentsTable search={search} status={status} method={method} />
    </div>
  );
}
