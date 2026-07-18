import * as React from 'react';
import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Reports & Analytics | GymOS',
  description: 'View gym performance and analytics',
};

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Reports & Analytics</h2>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
