'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { useDashboardFinancialMetrics } from '@/hooks/api/useFinancials';
import { Download, Plus, Search, Calendar, Filter, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = React.useState('');
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
          <select className="h-10 px-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] min-w-[130px] text-[var(--ink-soft)]">
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          
          <select className="h-10 px-3 rounded-lg border border-[var(--hairline)] bg-[var(--canvas-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] min-w-[130px] text-[var(--ink-soft)]">
            <option value="ALL">All Plans</option>
            <option value="PREMIUM">Premium Plan</option>
            <option value="STANDARD">Standard Plan</option>
            <option value="BASIC">Basic Plan</option>
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

      <InvoicesTable search={search} />
    </div>
  );
}
