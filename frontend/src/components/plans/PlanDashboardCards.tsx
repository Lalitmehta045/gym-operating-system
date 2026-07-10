"use client"

import { usePlans } from "@/hooks/api/usePlans"
import { useDashboardOverview } from "@/hooks/api/useDashboard"
import { ClipboardList, CheckCircle2, Archive, Users } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function PlanDashboardCards() {
  const { user } = useAuth()
  const canViewMetrics = user?.role === 'OWNER' || user?.role === 'MANAGER'
  const { data: plansData, isLoading: plansLoading, isError: plansError } = usePlans()
  const { data: overviewData, isLoading: overLoading, isError: overError } = useDashboardOverview()

  if (!canViewMetrics || plansError || overError) return null;

  if (plansLoading || overLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  const plans = plansData?.data || []
  const totalPlans = plansData ? plans.length : 0
  const activePlans = plansData ? plans.filter(p => p.isActive).length : 0
  const inactivePlans = plansData ? totalPlans - activePlans : 0
  const totalMembers = overviewData?.totalMembers ?? 0

  const cards = [
    { 
      title: "Total Plans", 
      value: totalPlans, 
      subtitle: "All membership plans",
      icon: ClipboardList,
      iconBg: "bg-[#F3F0FF]",
      iconColor: "text-[#6C47FF]",
      sparklineColor: "#6C47FF",
      gradientId: "gradPlanPurple",
      gradientColors: ["#6C47FF", "#ffffff"],
      path: "M0 25 Q 15 15, 30 25 T 60 20 T 90 30 T 120 20 T 150 25 T 180 20 T 200 25"
    },
    { 
      title: "Active Plans", 
      value: activePlans, 
      subtitle: "Currently active",
      icon: CheckCircle2,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
      sparklineColor: "#22C55E",
      gradientId: "gradPlanGreen",
      gradientColors: ["#22C55E", "#ffffff"],
      path: "M0 30 Q 20 20, 40 25 T 80 15 T 120 25 T 160 10 T 200 20"
    },
    { 
      title: "Inactive Plans", 
      value: inactivePlans, 
      subtitle: "Currently inactive",
      icon: Archive,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
      sparklineColor: "#F59E0B",
      gradientId: "gradPlanOrange",
      gradientColors: ["#F59E0B", "#ffffff"],
      path: "M0 20 Q 25 10, 50 25 T 100 20 T 150 30 T 200 20"
    },
    { 
      title: "Total Members", 
      value: totalMembers, 
      subtitle: "Across all plans",
      icon: Users,
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#3B82F6]",
      sparklineColor: "#3B82F6",
      gradientId: "gradPlanBlue",
      gradientColors: ["#3B82F6", "#ffffff"],
      path: "M0 25 Q 20 30, 40 20 T 80 25 T 120 15 T 160 25 T 200 15"
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div 
            key={i} 
            className="flex flex-col bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm overflow-hidden"
          >
            <div className="p-5 pb-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${card.iconBg}`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--mute)] mb-0.5">{card.title}</p>
                      <h3 className="text-3xl font-bold text-[var(--on-primary)] leading-none">{card.value}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--mute)] mt-2">{card.subtitle}</p>
                </div>
              </div>
            </div>
            
            {/* Sparkline */}
            <div className="w-full h-12 mt-2">
              <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={card.gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={card.gradientColors[0]} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={card.gradientColors[1]} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d={`${card.path} L 200 40 L 0 40 Z`}
                  fill={`url(#${card.gradientId})`}
                />
                <path 
                  d={card.path}
                  fill="none" 
                  stroke={card.sparklineColor} 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}
