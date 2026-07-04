import React from 'react';
import { useMemberTimeline } from '@/hooks/api/useAuditLogs';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ActivityCard } from './ActivityCard';

interface ActivityTimelineProps {
  memberId: string;
}

export function ActivityTimeline({ memberId }: ActivityTimelineProps) {
  const { data, isLoading, isError } = useMemberTimeline(memberId);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState title="Failed to load timeline" description="Could not load the activity timeline for this member." />;
  
  if (!data?.data || data.data.length === 0) {
    return (
      <div className="bg-[var(--canvas-light)] rounded-[12px] p-8 border border-[var(--hairline-soft)] text-center text-[var(--ash)]">
        No activity history found for this member.
      </div>
    );
  }

  return (
    <div className="bg-[var(--canvas-light)] rounded-[12px] p-6 border border-[var(--hairline-soft)]">
      <h3 className="text-lg font-medium text-[var(--on-primary)] mb-6">Activity Timeline</h3>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#ebebeb] before:to-transparent">
        {data.data.map((log) => (
          <ActivityCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
