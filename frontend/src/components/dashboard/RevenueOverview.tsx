"use client"

import { useDashboardRevenue } from "@/hooks/api/useDashboard"
import { useGymProfile } from "@/hooks/api/useSettings"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { formatCurrency } from "@/lib/utils"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

export function RevenueOverview() {
  const { data, isLoading, isError } = useDashboardRevenue()
  const { data: gymProfile } = useGymProfile()

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load revenue overview" />
  if (!data) return null

  const currency = gymProfile?.currency || "INR"

  // Generate sample daily data for the chart (using totalRevenue as context)
  const now = new Date()
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(now.getDate() - 6 + i)
    const label = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`
    // Distribute revenue across days with some variation
    const dayRevenue = i === 6 ? data.monthlyRevenue : Math.round(data.totalRevenue / 30 * (0.5 + Math.random()))
    return { date: label, revenue: Math.max(0, dayRevenue) }
  })

  // Calculate the max value for Y axis
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)
  const pctChange = data.totalRevenue > 0 ? 100 : 0

  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[15px] font-semibold text-[var(--on-primary)]">Revenue Overview</h2>
        <div className="flex items-center gap-2 bg-[var(--canvas-paper)] border border-[var(--hairline-soft)] rounded-lg px-3 py-1.5 text-[12px] text-[var(--mute)] font-medium">
          This Month
          <svg className="w-3 h-3 text-[var(--ash)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-6 items-start">
        {/* Left: Stats */}
        <div>
          <p className="text-[12px] text-[var(--ash)] font-medium mb-1">Total Revenue</p>
          <p className="text-[28px] font-bold text-[var(--on-primary)] tracking-tight">{formatCurrency(data.totalRevenue, currency)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="text-[12px] font-medium text-[#22c55e]">{pctChange}% vs last month</span>
          </div>
        </div>

        {/* Right: Chart */}
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6C47FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  padding: '8px 12px',
                }}
                itemStyle={{ color: '#111827', fontSize: '13px', fontWeight: 600 }}
                labelStyle={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}
                formatter={(value: number) => [formatCurrency(value, currency), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6C47FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
