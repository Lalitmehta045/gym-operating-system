"use client";

import React from 'react';
import { useCurrentStorage, useStorageUsage } from '@/hooks/api/useStorage';
import { StorageCard } from '@/components/storage/StorageCard';
import { StorageAnalytics } from '@/components/storage/StorageAnalytics';
import { LoadingState, ErrorState } from '@/components/ui/States';

export default function StorageSettingsPage() {
  const { data: current, isLoading: loadingCurrent, isError: errorCurrent } = useCurrentStorage();
  const { data: usage, isLoading: loadingUsage } = useStorageUsage();

  if (loadingCurrent || loadingUsage) return <LoadingState />;
  if (errorCurrent || !current) return <ErrorState title="Failed to load storage data" description="Could not fetch storage metrics at this time." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-[#171717]">Storage Management</h1>
        <p className="text-sm text-[#888888] mt-1">Manage your gym's file storage quota and limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <StorageCard metrics={current} />
        </div>
        <div>
          {usage && <StorageAnalytics usage={usage} />}
        </div>
      </div>
    </div>
  );
}
