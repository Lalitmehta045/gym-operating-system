import React from 'react';
import { StorageUsageHistory } from '@/hooks/api/useStorage';

export function StorageAnalytics({ usage }: { usage: StorageUsageHistory }) {
  // Simple bar/line chart rendering using pure CSS
  const maxVal = Math.max(...usage.history.map(h => h.usedMB), 10); // avoid 0 division

  return (
    <div className="bg-[var(--canvas-light)] border border-[var(--hairline-soft)] rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--on-primary)] mb-6">Storage Growth (MB)</h2>
      
      <div className="flex items-end space-x-2 h-48 mt-4">
        {usage.history.map((data, index) => {
          const height = `${(data.usedMB / maxVal) * 100}%`;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div 
                className="w-full bg-blue-100 rounded-t-sm relative group hover:bg-blue-200 transition-colors"
                style={{ height }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
                  {data.usedMB.toFixed(1)} MB
                </div>
              </div>
              <span className="text-xs text-[var(--mute)] mt-2 rotate-45 md:rotate-0 origin-left">{data.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
