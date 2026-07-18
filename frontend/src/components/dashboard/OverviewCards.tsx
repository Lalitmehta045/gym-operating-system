"use client"

import { useDashboardOverview } from "@/hooks/api/useDashboard"
import { useDashboardFinancialMetrics } from "@/hooks/api/useFinancials"
import { useGymProfile } from "@/hooks/api/useSettings"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { formatCurrency } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Users, UserCheck, Banknote, CalendarCheck } from "lucide-react"
import { useSectionFilter } from "@/hooks/useSectionFilter"
import { DateFilter } from "@/components/ui/DateFilter"
import { format } from "date-fns"

// SVG Sparkline component
function Sparkline({ color, seed = 0 }: { color: string; seed?: number }) {
  // Generate a deterministic wave pattern based on seed
  const points: number[] = []
  for (let i = 0; i <= 8; i++) {
    const val = 20 + Math.sin((i + seed) * 0.8) * 12 + Math.cos((i + seed * 0.7) * 1.2) * 8
    points.push(Math.max(5, Math.min(40, val)))
  }
  const width = 120
  const height = 45
  const stepX = width / (points.length - 1)
  const pathData = points
    .map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${height - y}`)
    .join(' ')
  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="mt-2">
      <defs>
        <linearGradient id={`sparkGrad-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkGrad-${seed})`} />
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  sparkColor: string
  seed: number
}

function MetricCard({ title, value, subtitle, icon, iconBg, sparkColor, seed }: MetricCardProps) {
  return (
    <div className="bg-[var(--canvas-light)] rounded-2xl border border-[var(--hairline-soft)] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden">
      <div className="flex items-start justify-between mb-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="text-[13px] text-[var(--ash)] font-medium">{title}</span>
      </div>
      <div className="mt-3">
        <h3 className="text-[28px] font-bold tracking-tight text-[var(--on-primary)] leading-none">{value}</h3>
        <p className="text-[12px] text-[var(--ash)] mt-1">{subtitle}</p>
      </div>
      <Sparkline color={sparkColor} seed={seed} />
    </div>
  )
}

export function OverviewCards() {
  const { dateRange } = useSectionFilter("dashboard")
  const dateParams = {
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }

  const { data, isLoading, isError } = useDashboardOverview(dateParams)
  const { data: financials, isLoading: isFinLoading } = useDashboardFinancialMetrics(dateParams)
  const { data: gymProfile } = useGymProfile()

  if (isLoading || isFinLoading) return <LoadingState />
  if (isError) return <ErrorState title="Failed to load overview data" />
  if (!data || !financials) return null

  const currency = gymProfile?.currency || "INR"

  const cards = [
    {
      title: "Total Members",
      value: data.totalMembers,
      subtitle: "All registered members",
      icon: <svg className="w-5 h-5 text-[#6C47FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
      iconBg: "bg-[#6C47FF]/10",
      sparkColor: "#6C47FF",
      seed: 1,
    },
    {
      title: "Active Members",
      value: data.activeMembers,
      subtitle: "Currently active",
      icon: <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
      iconBg: "bg-[#22c55e]/10",
      sparkColor: "#22c55e",
      seed: 2,
    },
    {
      title: "Active Subscriptions",
      value: data.activeSubscriptions,
      subtitle: "Running subscriptions",
      icon: <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
      iconBg: "bg-[#f59e0b]/10",
      sparkColor: "#f59e0b",
      seed: 3,
    },
    {
      title: "Expired Subscriptions",
      value: data.expiredSubscriptions,
      subtitle: "No expired subscriptions",
      icon: <svg className="w-5 h-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
      iconBg: "bg-[#ef4444]/10",
      sparkColor: "#ef4444",
      seed: 4,
    },
    {
      title: "Today's Attendance",
      value: data.todayAttendance,
      subtitle: "Check-ins today",
      icon: <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
      iconBg: "bg-[#3b82f6]/10",
      sparkColor: "#3b82f6",
      seed: 5,
    },
    {
      title: "Attendance Rate",
      value: `${data.monthlyAttendanceRate.toFixed(1)}%`,
      subtitle: "Overall attendance",
      icon: <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" /></svg>,
      iconBg: "bg-[#8b5cf6]/10",
      sparkColor: "#8b5cf6",
      seed: 6,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(financials.totalRevenue, currency),
      subtitle: "All time revenue",
      icon: <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      iconBg: "bg-[#22c55e]/10",
      sparkColor: "#22c55e",
      seed: 7,
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(financials.totalOutstanding, currency),
      subtitle: "Pending collection",
      icon: <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
      iconBg: "bg-[#f59e0b]/10",
      sparkColor: "#f59e0b",
      seed: 8,
    },
    {
      title: "Expiring Soon",
      value: data.expiringMemberships,
      subtitle: "Subscriptions",
      icon: <svg className="w-5 h-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      iconBg: "bg-[#3b82f6]/10",
      sparkColor: "#3b82f6",
      seed: 9,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-[var(--on-primary)]">Dashboard Overview</h2>
        <DateFilter paramPrefix="dashboard" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <MetricCard key={i} {...card} />
        ))}
      </div>
    </div>
  )
}
