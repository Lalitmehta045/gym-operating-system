'use client';

import * as React from 'react';
import { useRevenueReport } from '@/hooks/api/useReports';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { TrendingUp, Banknote, CreditCard, Building2, Smartphone, BarChart3 } from 'lucide-react';

export function RevenueSummary() {
  const { data: report, isLoading, isError } = useRevenueReport();

  if (isLoading) return <LoadingState className="min-h-[100px]" />;
  if (isError || !report) return <ErrorState title="Failed to load revenue" className="min-h-[100px]" />;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const total = report.totalRevenue || 1;
  const getPercentage = (amount: number) => ((amount / total) * 100).toFixed(1) + '% of total';

  return (
    <div className="flex flex-nowrap overflow-x-auto lg:flex lg:flex-row gap-4 mb-8 pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Total Revenue */}
      <div className="min-w-[260px] lg:w-[25%] bg-[#1E1B4B] text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div className="z-10">
            <h3 className="text-sm text-white/80 font-medium mb-1">Total Revenue</h3>
            <p className="text-[28px] font-bold tracking-tight">
              {formatCurrency(report.totalRevenue)}
            </p>
          </div>
          <div className="p-2 bg-[var(--canvas-light)]/10 rounded-lg z-10">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="z-10 mt-2">
          <p className="text-xs text-[#4ade80] font-medium flex items-center gap-1">
            ↑ 18.6% vs last month
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50 translate-y-2">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="w-full h-full">
             <path d="M 0 50 L 0 35 C 50 25, 70 15, 100 25 C 140 40, 160 10, 200 15 L 200 50 Z" fill="none" stroke="#6C47FF" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Cash */}
      <div className="min-w-[220px] lg:flex-1 bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl">
              <Banknote className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Cash</h3>
          </div>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-2xl font-bold text-[var(--on-primary)] mb-1">
            {formatCurrency(report.byMethod.CASH || 0)}
          </p>
          <p className="text-xs text-[var(--ash)]">{getPercentage(report.byMethod.CASH || 0)}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
             <path d="M 0 30 L 0 20 C 30 15, 60 25, 100 10 L 100 30 Z" fill="none" stroke="#22c55e" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* UPI */}
      <div className="min-w-[220px] lg:flex-1 bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <Smartphone className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">UPI</h3>
          </div>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-2xl font-bold text-[var(--on-primary)] mb-1">
            {formatCurrency(report.byMethod.UPI || 0)}
          </p>
          <p className="text-xs text-[var(--ash)]">{getPercentage(report.byMethod.UPI || 0)}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
             <path d="M 0 30 L 0 15 C 40 5, 60 25, 100 15 L 100 30 Z" fill="none" stroke="#a855f7" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Card */}
      <div className="min-w-[220px] lg:flex-1 bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl">
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Card</h3>
          </div>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-2xl font-bold text-[var(--on-primary)] mb-1">
            {formatCurrency(report.byMethod.CARD || 0)}
          </p>
          <p className="text-xs text-[var(--ash)]">{getPercentage(report.byMethod.CARD || 0)}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
             <path d="M 0 30 L 0 25 C 30 15, 70 25, 100 10 L 100 30 Z" fill="none" stroke="#f97316" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Bank Transfer */}
      <div className="min-w-[220px] lg:flex-1 bg-[var(--canvas-light)] border border-[var(--hairline-soft)] p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm text-[var(--mute)] font-medium">Bank Transfer</h3>
          </div>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-2xl font-bold text-[var(--on-primary)] mb-1">
            {formatCurrency(report.byMethod.BANK_TRANSFER || 0)}
          </p>
          <p className="text-xs text-[var(--ash)]">{getPercentage(report.byMethod.BANK_TRANSFER || 0)}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-60">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
             <path d="M 0 30 L 0 10 C 40 25, 60 5, 100 20 L 100 30 Z" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

    </div>
  );
}
