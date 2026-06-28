"use client"

import React, { useState } from 'react';
import { usePlatformLogs } from '@/hooks/api/useAuditLogs';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditFilters as AuditFiltersComponent } from '@/components/audit/AuditFilters';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { AuditLogFilters } from '@/services/audit.service';
import { Pagination } from '@/components/ui/Pagination';

export default function PlatformAuditPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({ skip: 0, take: 20 });
  const { data, isLoading, isError } = usePlatformLogs(filters);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, skip: (page - 1) * (prev.take || 20) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Platform Audit Logs</h1>
          <p className="text-sm text-[#888888] mt-1">View system-wide activity logs across all gyms.</p>
        </div>
      </div>

      <div className="bg-white rounded-[12px] p-6 border border-[#ebebeb]">
        <AuditFiltersComponent
          filters={filters}
          onChange={(newFilters) => setFilters({ ...newFilters, skip: 0 })}
        />

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState title="Failed to load audit logs" description="An error occurred while fetching audit logs." />
        ) : (
          <>
            <AuditTable logs={data?.data || []} />
            
            {data?.meta && data.meta.total > (filters.take || 20) && (
              <div className="mt-6 flex justify-end">
                <Pagination
                  currentPage={Math.floor((filters.skip || 0) / (filters.take || 20)) + 1}
                  totalPages={Math.ceil(data.meta.total / (filters.take || 20))}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
