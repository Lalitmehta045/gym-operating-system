"use client";

import React from 'react';
import { usePlatformStorage } from '@/hooks/api/useStorage';
import { TenantStorageTable } from '@/components/storage/TenantStorageTable';
import { LoadingState, ErrorState } from '@/components/ui/States';

export default function PlatformStoragePage() {
  const { data, isLoading, isError } = usePlatformStorage();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState title="Failed to load platform storage" description="Could not fetch global storage metrics." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-[#171717]">Platform Storage</h1>
        <p className="text-sm text-[#888888] mt-1">Monitor storage quotas and usage across all tenants.</p>
      </div>

      <TenantStorageTable data={data} />
    </div>
  );
}
