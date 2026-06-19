"use client"

import { usePlatformRevenue } from "@/hooks/api/usePlatform"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

export function RevenueChart() {
  const { data, isLoading } = usePlatformRevenue()

  if (isLoading || !data) {
    return <div className="h-[350px] rounded-xl border border-[#ebebeb] bg-white animate-pulse" />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  // We only have revenueByPlan array for chart as per RevenueMetricsDto
  const chartData = data.revenueByPlan.map(item => ({
    name: item.planName,
    revenue: item.revenue
  }))

  const colors = ['#171717', '#666666', '#a3a3a3']

  return (
    <div className="rounded-xl border border-[#ebebeb] bg-white p-6">
      <div className="mb-6">
        <h3 className="text-[16px] font-medium text-[#171717]">Revenue By Plan</h3>
        <p className="text-[14px] text-[#666666]">MRR: {formatCurrency(data.mrr)} | ARR: {formatCurrency(data.arr)}</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666666' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666666' }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: '#fafafa' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #ebebeb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [formatCurrency(typeof value === 'number' ? value : 0), 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
