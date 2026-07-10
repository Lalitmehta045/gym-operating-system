"use client"

import Link from "next/link"
import { CheckSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { AttendanceDashboardCards } from "@/components/attendance/AttendanceDashboardCards"
import { KioskQRSection } from "@/components/attendance/KioskQRSection"
import { AttendanceCharts } from "@/components/attendance/AttendanceCharts"
import { useAuth } from "@/hooks/useAuth"

export default function AttendancePage() {
  const { user } = useAuth()
  const canManageKiosk = user?.role === "OWNER" || user?.role === "MANAGER"
  const isTrainer = user?.role === "TRAINER"

  return (
    <div className="flex flex-col pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[var(--on-primary)]">Attendance Dashboard</h1>
          <p className="text-sm text-[var(--mute)]">Daily attendance overview and operations</p>
        </div>
        <div className="flex items-center gap-3">
          {!isTrainer && (
            <Link href="/attendance/history">
              <button className="flex items-center bg-[var(--canvas-light)] border border-[var(--hairline)] text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)] rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                <Clock className="mr-2 h-4 w-4 text-[var(--mute)]" />
                History
              </button>
            </Link>
          )}
          <Link href="/attendance/check-in">
            <button className="flex items-center bg-[#6C47FF] hover:bg-[#5b3ce0] text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors shadow-sm">
              <CheckSquare className="mr-2 h-4 w-4" />
              Check In
            </button>
          </Link>
        </div>
      </div>

      {canManageKiosk && <KioskQRSection />}

      <AttendanceDashboardCards />
      
      {!isTrainer && <AttendanceCharts />}
    </div>
  )
}
