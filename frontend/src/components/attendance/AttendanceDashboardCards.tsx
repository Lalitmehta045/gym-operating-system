"use client"

import * as React from "react"
import { useAttendances, useCheckOut } from "@/hooks/api/useAttendances"
import { useDashboardOverview, useDashboardAttendance } from "@/hooks/api/useDashboard"
import { LoadingState } from "@/components/ui/States"
import { Users, UserCheck, UserX, Calendar, MapPin, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { format } from "date-fns"
import { useSectionFilter } from "@/hooks/useSectionFilter"

export function AttendanceDashboardCards() {
  const { user } = useAuth()
  const canViewMetrics = user?.role === 'OWNER' || user?.role === 'MANAGER'
  
  const { dateRange } = useSectionFilter("attendance")
  const dateParams = {
    dateFrom: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    dateTo: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }

  const { data: attendanceData, isLoading: attLoading, isError: attError } = useDashboardAttendance(dateParams)
  const { data: overviewData, isLoading: overLoading, isError: overError } = useDashboardOverview(dateParams)
  
  // "Currently Inside" widget should NEVER use historical filters
  const { data: insideData, isLoading: insideLoading, isError: insideError } = useAttendances({
    isInside: true,
    limit: 100
  })

  const checkOutMutation = useCheckOut()

  const handleCheckOut = async (attendanceId: string) => {
    try {
      await checkOutMutation.mutateAsync({ id: attendanceId })
    } catch (e) {
      console.error("Check-out failed:", e)
    }
  }

  if (!canViewMetrics || attError || overError || insideError) return null;

  if (attLoading || overLoading || insideLoading) return <LoadingState />

  const totalMembers = overviewData?.totalMembers ?? 0
  const presentCount = attendanceData?.todayPresent ?? 0
  const absentCount = attendanceData?.todayAbsent ?? 0
  const rate = attendanceData?.attendanceRate ?? 0
  const insideMembers = insideData?.data ?? []

  const presentPercentage = totalMembers > 0 ? Math.min((presentCount / totalMembers) * 100, 100).toFixed(1) : "0.0"
  const absentPercentage = totalMembers > 0 ? Math.min((absentCount / totalMembers) * 100, 100).toFixed(1) : "0.0"

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6 items-start">
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
                        <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-[#22C55E]"></div>
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

      {/* Currently Inside Gym Card */}
      <div className="flex flex-col bg-[var(--canvas-light)] rounded-xl border border-[var(--hairline-soft)] shadow-sm overflow-hidden min-h-[220px]">
        <div className="p-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600">
              {insideMembers.length > 0 && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500"></div>
              )}
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--mute)] mb-0.5">Currently Inside Gym</p>
              <h3 className="text-3xl font-bold text-[var(--on-primary)] leading-none">{insideMembers.length}</h3>
            </div>
          </div>
        </div>

        {/* Scrollable list of members inside */}
        <div className="border-t border-[var(--hairline-soft)] p-4 pt-3 flex-1 flex flex-col justify-start">
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {insideMembers.length === 0 ? (
              <p className="text-xs text-[var(--mute)] py-6 text-center">No members inside currently</p>
            ) : (
              insideMembers.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-gray-50 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--on-primary)] truncate">
                      {record.memberName || `${record.member?.firstName ?? ''} ${record.member?.lastName ?? ''}`.trim() || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-[var(--mute)] mt-0.5">
                      {record.checkInAt ? format(new Date(record.checkInAt), 'h:mm a') : '-'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-[var(--canvas-light)] border border-[#6C47FF] text-[#6C47FF] hover:bg-purple-50 rounded-lg text-[10px] font-semibold cursor-pointer shrink-0 transition-colors"
                    onClick={() => handleCheckOut(record.id)}
                    disabled={checkOutMutation.isPending}
                  >
                    Check Out
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
