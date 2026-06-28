import React from 'react';
import { PlatformStorage } from '@/hooks/api/useStorage';

export function TenantStorageTable({ data }: { data: PlatformStorage }) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#ebebeb] flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Global Storage Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total Used: {formatBytes(data.totalUsed)} | Files: {data.totalFiles}
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-[#ebebeb] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium">Used</th>
              <th className="px-6 py-4 font-medium">Limit</th>
              <th className="px-6 py-4 font-medium">Usage %</th>
              <th className="px-6 py-4 font-medium">File Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebebeb]">
            {data.tenants.map((tenant) => (
              <tr key={tenant.tenantId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{tenant.tenantName}</td>
                <td className="px-6 py-4 text-gray-500">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
                    {tenant.planName}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{formatBytes(tenant.usedBytes)}</td>
                <td className="px-6 py-4 text-gray-500">{formatBytes(tenant.limitBytes)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${Number(tenant.usagePercent) >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, Number(tenant.usagePercent))}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${Number(tenant.usagePercent) >= 90 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {tenant.usagePercent}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{tenant.fileCount}</td>
              </tr>
            ))}
            
            {data.tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No storage data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
