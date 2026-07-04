import React from 'react';
import { HardDrive, Image as ImageIcon, FileText } from 'lucide-react';
import { StorageMetrics } from '@/hooks/api/useStorage';

export function StorageCard({ metrics }: { metrics: StorageMetrics }) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const percentage = Math.min(100, (metrics.usedStorageBytes / metrics.storageLimitBytes) * 100);

  return (
    <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] rounded-xl p-6 shadow-sm flex flex-col space-y-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <HardDrive className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--on-primary)]">Storage Usage</h2>
          <p className="text-sm text-[var(--mute)]">
            {formatBytes(metrics.usedStorageBytes)} used of {formatBytes(metrics.storageLimitBytes)}
          </p>
        </div>
      </div>

      <div className="w-full bg-[var(--canvas-paper)] rounded-full h-3 mb-4 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--hairline-soft)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-md">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--mute)] font-medium uppercase tracking-wider">Images</p>
            <p className="text-lg font-semibold text-[var(--on-primary)]">{metrics.totalImages}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--mute)] font-medium uppercase tracking-wider">Documents</p>
            <p className="text-lg font-semibold text-[var(--on-primary)]">{metrics.totalDocuments}</p>
          </div>
        </div>
      </div>
      
      {percentage >= 100 && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium border border-red-200">
          Uploads disabled. You have exceeded your storage limit. Please upgrade your plan to resume uploads.
        </div>
      )}
      
      {percentage >= 80 && percentage < 100 && (
        <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded-md text-sm font-medium border border-amber-200">
          You are approaching your storage limit ({percentage.toFixed(1)}%). Consider upgrading your plan soon.
        </div>
      )}
    </div>
  );
}
