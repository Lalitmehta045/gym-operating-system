'use client';

import * as React from 'react';
import { useDashboardAnalytics, downloadPdfReport } from '@/hooks/api/useAnalytics';
import { Button } from '@/components/ui/Button';
import { Download, TrendingUp, Users, Activity, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AnalyticsDashboard() {
  const { data, isLoading, error } = useDashboardAnalytics();

  if (isLoading) return <div className="p-8 text-center text-zinc-400">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading dashboard</div>;
  if (!data) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Overview</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadPdfReport('dashboard')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Total Revenue
          </div>
          <div className="mt-4 text-3xl font-bold text-white">₹{data.financials.revenue.toLocaleString()}</div>
        </div>

        {/* Collection Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <CreditCard className="h-4 w-4 text-amber-500" />
            Outstanding
          </div>
          <div className="mt-4 text-3xl font-bold text-white">₹{data.financials.collection.toLocaleString()}</div>
        </div>

        {/* Attendance Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Activity className="h-4 w-4 text-blue-500" />
            Today's Check-ins
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{data.attendance.today}</div>
        </div>

        {/* Renewals Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Users className="h-4 w-4 text-indigo-500" />
            Upcoming Renewals
          </div>
          <div className="mt-4 text-3xl font-bold text-white">{data.renewals.upcoming}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Membership Status Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="mb-4 font-medium text-white">Membership Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.memberships}
                  dataKey="_count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props: any) => `${props.name}: ${props.value}`}
                >
                  {data.memberships.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Performance Chart */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h3 className="mb-4 font-medium text-white">Plan Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.plans} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="planName" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#27272a' }}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
