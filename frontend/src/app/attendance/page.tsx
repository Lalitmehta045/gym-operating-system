import Link from "next/link"
import { CheckSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { AttendanceDashboardCards } from "@/components/attendance/AttendanceDashboardCards"
import { KioskQRSection } from "@/components/attendance/KioskQRSection"

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-y-[32px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-y-[8px]">
          <h1 className="text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">Attendance Dashboard</h1>
          <p className="text-[16px] text-[#4d4d4d]">Daily attendance overview and operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/attendance/history">
            <Button variant="secondary">
              <Clock className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
          <Link href="/attendance/check-in">
            <Button variant="primary">
              <CheckSquare className="mr-2 h-4 w-4" />
              Check In
            </Button>
          </Link>
        </div>
      </div>

      <KioskQRSection />

      <AttendanceDashboardCards />
    </div>
  )
}
