"use client"

import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/api/useAuditLogs';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditFilters as AuditFiltersComponent } from '@/components/audit/AuditFilters';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { AuditLogFilters } from '@/services/audit.service';
import { Pagination } from '@/components/ui/Pagination';

export default function GymAuditPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({ skip: 0, take: 20 });
  const { data, isLoading, isError } = useAuditLogs(filters);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, skip: (page - 1) * (prev.take || 20) }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#171717]">Security & Audit Logs</h2>
        <p className="text-sm text-[#888888] mt-1">Review activity and security events for your gym.</p>
      </div>

      <div className="bg-white">
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
