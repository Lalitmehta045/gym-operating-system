"use client"

import { useAttendanceReportsDaily } from "@/hooks/api/useAttendances"
import { useDashboardOverview } from "@/hooks/api/useDashboard"
import { LoadingState, ErrorState } from "@/components/ui/States"
import { Users, UserCheck, UserX, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function AttendanceDashboardCards() {
  const { user } = useAuth()
  const canViewMetrics = user?.role === 'OWNER' || user?.role === 'MANAGER'
  const { data: attendanceData, isLoading: attLoading, isError: attError } = useAttendanceReportsDaily()
  const { data: overviewData, isLoading: overLoading, isError: overError } = useDashboardOverview()

  if (!canViewMetrics || attError || overError) return null;

  if (attLoading || overLoading) return <LoadingState />
  // If data is missing we just use safe fallbacks to avoid crash
  
  const totalMembers = overviewData?.totalMembers ?? 0;
  const presentCount = attendanceData?.presentCount ?? 0;
  const absentCount = attendanceData?.absentCount ?? 0;
  const rate = attendanceData?.attendanceRate ?? 0;

  const presentPercentage = totalMembers > 0 ? Math.min((presentCount / totalMembers) * 100, 100).toFixed(1) : "0.0";
  const absentPercentage = totalMembers > 0 ? Math.min((absentCount / totalMembers) * 100, 100).toFixed(1) : "0.0";

  const cards = [
    { 
      title: "Total Members", 
      value: totalMembers, 
      subtitle: "All registered members",
      icon: Users,
      iconBg: "bg-[#EDE9FE]",
      iconColor: "text-[#6C47FF]",
      sparklineColor: "#6C47FF",
      gradientId: "gradPurple",
      gradientColors: ["#6C47FF", "#ffffff"],
      animated: false,
      path: "M0 25 Q 15 15, 30 25 T 60 20 T 90 30 T 120 20 T 150 25 T 180 20 T 200 25"
    },
    { 
      title: "Checked In Today", 
      value: presentCount, 
      subtitle: `${presentPercentage}% of total members`,
      icon: UserCheck,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
      sparklineColor: "#22C55E",
      gradientId: "gradGreen",
      gradientColors: ["#22C55E", "#ffffff"],
      animated: true,
      path: "M0 30 Q 20 20, 40 25 T 80 15 T 120 25 T 160 10 T 200 20"
    },
    { 
      title: "Absent Today", 
      value: absentCount, 
      subtitle: `${absentPercentage}% of total members`,
      icon: UserX,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
      sparklineColor: "#F59E0B",
      gradientId: "gradOrange",
      gradientColors: ["#F59E0B", "#ffffff"],
      animated: false,
      path: "M0 20 Q 25 10, 50 25 T 100 20 T 150 30 T 200 20"
    },
    { 
      title: "Attendance Rate", 
      value: `${rate.toFixed(1)}%`, 
      subtitle: "Today's attendance rate",
      icon: Calendar,
      iconBg: "bg-[#DBEAFE]",
      iconColor: "text-[#3B82F6]",
      sparklineColor: "#3B82F6",
      gradientId: "gradBlue",
      gradientColors: ["#3B82F6", "#ffffff"],
      animated: false,
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
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full ${card.iconBg}`}>
                      {card.animated && (
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${card.iconBg.replace('bg-', 'bg-').replace('100', '400')}`} style={{ backgroundColor: card.sparklineColor }}></div>
                      )}
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
