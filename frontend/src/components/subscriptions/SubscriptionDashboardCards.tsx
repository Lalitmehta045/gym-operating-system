"use client"

import { useDashboardSubscriptions } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { ClipboardList, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function SubscriptionDashboardCards() {
  const { user } = useAuth()
  const canViewMetrics = user?.role === 'OWNER' || user?.role === 'MANAGER'
  
  const { data, isLoading, isError } = useDashboardSubscriptions()

  if (!canViewMetrics || isError) return null;
  if (isLoading) return <LoadingState />

  const activeCount = data?.activeSubscriptions || 0;
  const pendingCount = data?.pendingSubscriptions || 0;
  const expiredCount = data?.expiredSubscriptions || 0;
  const cancelledCount = data?.cancelledSubscriptions || 0;
  const totalCount = activeCount + pendingCount + expiredCount + cancelledCount;

  const cards = [
    { 
      title: "Total Subscriptions", 
      value: totalCount, 
      subtitle: "All time subscriptions",
      icon: ClipboardList,
      iconBg: "bg-[#F3F0FF]",
      iconColor: "text-[#6C47FF]",
      sparklineColor: "#6C47FF",
      gradientId: "gradSubPurple",
      gradientColors: ["#6C47FF", "#ffffff"],
      path: "M 0 35 C 40 30, 60 20, 100 25 C 140 30, 160 10, 200 15"
    },
    { 
      title: "Active Subscriptions", 
      value: activeCount, 
      subtitle: "Currently active",
      icon: CheckCircle2,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
      sparklineColor: "#22C55E",
      gradientId: "gradSubGreen",
      gradientColors: ["#22C55E", "#ffffff"],
      path: "M 0 25 C 50 15, 80 35, 130 20 C 160 10, 180 25, 200 20"
    },
    { 
      title: "Pending Subscriptions", 
      value: pendingCount, 
      subtitle: "Awaiting payment",
      icon: Clock,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
      sparklineColor: "#F59E0B",
      gradientId: "gradSubOrange",
      gradientColors: ["#F59E0B", "#ffffff"],
      path: "M 0 20 C 40 30, 80 10, 120 25 C 160 40, 180 15, 200 20"
    },
    { 
      title: "Expired Subscriptions", 
      value: expiredCount, 
      subtitle: "Past due subscriptions",
      icon: XCircle,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#EF4444]",
      sparklineColor: "#EF4444",
      gradientId: "gradSubRed",
      gradientColors: ["#EF4444", "#ffffff"],
      path: "M 0 30 C 30 15, 70 35, 110 25 C 150 15, 170 30, 200 25"
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
