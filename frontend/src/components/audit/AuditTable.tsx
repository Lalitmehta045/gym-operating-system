import React from 'react';
import { AuditLog } from '@/services/audit.service';
import { format } from 'date-fns';

interface AuditTableProps {
  logs: AuditLog[];
}

export function AuditTable({ logs }: AuditTableProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-[var(--canvas-light)] rounded-[12px] p-8 border border-[var(--hairline-soft)] text-center text-[var(--ash)]">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--hairline-soft)]">
            <th className="py-3 px-4 font-medium text-sm text-[var(--ash)]">Date & Time</th>
            <th className="py-3 px-4 font-medium text-sm text-[var(--ash)]">Entity</th>
            <th className="py-3 px-4 font-medium text-sm text-[var(--ash)]">Action</th>
            <th className="py-3 px-4 font-medium text-sm text-[var(--ash)]">Description</th>
            <th className="py-3 px-4 font-medium text-sm text-[var(--ash)]">IP Address</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ebebeb]">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-[#fdfdfd] transition-colors">
              <td className="py-3 px-4 text-sm text-[var(--on-primary)] whitespace-nowrap">
                {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-[var(--on-primary)]">
                {log.entity}
              </td>
              <td className="py-3 px-4 text-sm text-[var(--on-primary)]">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--canvas-paper)] text-[var(--on-primary)]">
                  {log.action}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-[var(--on-primary)] max-w-md truncate" title={log.description}>
                {log.description}
              </td>
              <td className="py-3 px-4 text-sm text-[var(--ash)]">
                {log.ipAddress || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
