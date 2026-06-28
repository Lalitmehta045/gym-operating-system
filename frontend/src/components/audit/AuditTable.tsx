import React from 'react';
import { AuditLog } from '@/services/audit.service';
import { format } from 'date-fns';

interface AuditTableProps {
  logs: AuditLog[];
}

export function AuditTable({ logs }: AuditTableProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-[12px] p-8 border border-[#ebebeb] text-center text-[#888888]">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#ebebeb]">
            <th className="py-3 px-4 font-medium text-sm text-[#888888]">Date & Time</th>
            <th className="py-3 px-4 font-medium text-sm text-[#888888]">Entity</th>
            <th className="py-3 px-4 font-medium text-sm text-[#888888]">Action</th>
            <th className="py-3 px-4 font-medium text-sm text-[#888888]">Description</th>
            <th className="py-3 px-4 font-medium text-sm text-[#888888]">IP Address</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ebebeb]">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-[#fdfdfd] transition-colors">
              <td className="py-3 px-4 text-sm text-[#171717] whitespace-nowrap">
                {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-[#171717]">
                {log.entity}
              </td>
              <td className="py-3 px-4 text-sm text-[#171717]">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {log.action}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-[#171717] max-w-md truncate" title={log.description}>
                {log.description}
              </td>
              <td className="py-3 px-4 text-sm text-[#888888]">
                {log.ipAddress || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
