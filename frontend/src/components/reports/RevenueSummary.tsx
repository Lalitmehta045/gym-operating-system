'use client';

import * as React from 'react';
import { useRevenueReport } from '@/hooks/api/useReports';
import { LoadingState, ErrorState } from '@/components/ui/States';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-[#171717] text-white p-[24px] rounded-[12px] shadow-sm flex flex-col justify-between">
        <h3 className="text-[14px] text-white/80 font-medium">Total Revenue</h3>
        <p className="text-[32px] font-semibold mt-2 tracking-tight">
          {formatCurrency(report.totalRevenue)}
        </p>
      </div>

      <div className="bg-white border border-[#ebebeb] p-[24px] rounded-[12px] shadow-sm flex flex-col justify-between">
        <h3 className="text-[14px] text-[#888888] font-medium">Cash</h3>
        <p className="text-[24px] font-semibold mt-2 text-[#171717]">
          {formatCurrency(report.byMethod.CASH || 0)}
        </p>
      </div>

      <div className="bg-white border border-[#ebebeb] p-[24px] rounded-[12px] shadow-sm flex flex-col justify-between">
        <h3 className="text-[14px] text-[#888888] font-medium">UPI</h3>
        <p className="text-[24px] font-semibold mt-2 text-[#171717]">
          {formatCurrency(report.byMethod.UPI || 0)}
        </p>
      </div>

      <div className="bg-white border border-[#ebebeb] p-[24px] rounded-[12px] shadow-sm flex flex-col justify-between">
        <h3 className="text-[14px] text-[#888888] font-medium">Card</h3>
        <p className="text-[24px] font-semibold mt-2 text-[#171717]">
          {formatCurrency(report.byMethod.CARD || 0)}
        </p>
      </div>

      <div className="bg-white border border-[#ebebeb] p-[24px] rounded-[12px] shadow-sm flex flex-col justify-between">
        <h3 className="text-[14px] text-[#888888] font-medium">Bank Transfer</h3>
        <p className="text-[24px] font-semibold mt-2 text-[#171717]">
          {formatCurrency(report.byMethod.BANK_TRANSFER || 0)}
        </p>
      </div>
    </div>
  );
}
