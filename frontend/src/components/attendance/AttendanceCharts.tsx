"use client";

import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
  PieChart, Pie, Cell
} from 'recharts';
import { ChevronDown, Users, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useDashboardAttendance } from '@/hooks/api/useDashboard';
import { useAuth } from '@/hooks/useAuth';

export function AttendanceCharts() {
  const { user } = useAuth();
  const canViewMetrics = user?.role === 'OWNER' || user?.role === 'MANAGER';
  const { data, isLoading, isError } = useDashboardAttendance();

  if (!canViewMetrics || isError) return null;

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64 mt-6 bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--mute)]" />
      </div>
    );
  }

  const { hourlyData = [], planData = [], totalCheckInsThisMonth = 0, growthPercentage = 0 } = data;
  const totalPlanValue = planData.reduce((acc, item) => acc + item.value, 0);
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Today's Attendance Overview */}
      <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-[var(--on-primary)]">Today's Attendance Overview</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg hover:bg-[var(--canvas-paper)] transition-colors">
            Today <ChevronDown className="w-4 h-4 text-[var(--mute)]" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-[#6C47FF]"></div>
            <span className="text-sm text-[var(--slate-soft)] font-medium">Check-ins</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-[#22C55E]"></div>
            <span className="text-sm text-[var(--slate-soft)] font-medium">Check-outs</span>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCheckIns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#6C47FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCheckOuts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="checkOuts" 
                stroke="#22C55E" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCheckOuts)" 
                activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
                dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                dataKey="checkIns" 
                stroke="#6C47FF" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCheckIns)" 
                activeDot={{ r: 6, fill: '#6C47FF', stroke: '#fff', strokeWidth: 2 }}
                dot={{ r: 4, fill: '#6C47FF', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance by Plan */}
      <div className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--on-primary)]">Attendance by Plan</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--ink-soft)] bg-[var(--canvas-light)] border border-[var(--hairline)] rounded-lg hover:bg-[var(--canvas-paper)] transition-colors">
            This Month <ChevronDown className="w-4 h-4 text-[var(--mute)]" />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-between">
          <div className="w-[200px] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} members`, 'Attendance']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 pl-4">
            <div className="space-y-4">
              {planData.map((plan) => {
                const percentage = totalPlanValue > 0 ? Math.round((plan.value / totalPlanValue) * 100) : 0;
                return (
                  <div key={plan.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }}></div>
                      <span className="text-sm font-medium text-[var(--slate-soft)]">{plan.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="border-b border-dotted border-gray-300 w-8 mx-1"></div>
                      <span className="text-sm font-semibold text-[var(--on-primary)]">{plan.value}</span>
                      <span className="text-sm text-[var(--mute)] w-[36px] text-right">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[var(--hairline-soft)]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--mute)] text-xs font-medium">
              <Users className="w-4 h-4" />
              <span>Total Check-ins</span>
            </div>
            <span className="text-lg font-bold text-[var(--on-primary)]">{totalCheckInsThisMonth.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--mute)] text-xs font-medium">
              <Calendar className="w-4 h-4" />
              <span>This Month</span>
            </div>
            <span className="text-sm font-semibold text-[var(--on-primary)] mt-0.5">{currentMonth}</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--mute)] text-xs font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Growth</span>
            </div>
            <span className={`text-sm font-bold mt-0.5 ${growthPercentage >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
              {growthPercentage > 0 ? '+' : ''}{growthPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
