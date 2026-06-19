'use client';

import * as React from 'react';
import { Input } from '@/components/ui/Input';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';

export default function InvoicesPage() {
  const [search, setSearch] = React.useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[24px] font-semibold text-[#171717] tracking-tight">Invoices</h1>
          <p className="text-[14px] text-[#888888] mt-1">View and manage member invoices</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="w-full sm:w-1/3">
          <Input
            placeholder="Search by invoice number or member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <InvoicesTable search={search} />
    </div>
  );
}
