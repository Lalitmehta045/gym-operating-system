import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { MembersAnalytics } from "@/components/dashboard/MembersAnalytics"
import { AttendanceAnalytics } from "@/components/dashboard/AttendanceAnalytics"
import { RevenueAnalytics } from "@/components/dashboard/RevenueAnalytics"
import { SubscriptionAnalytics } from "@/components/dashboard/SubscriptionAnalytics"
import { TopMembersTable } from "@/components/dashboard/TopMembersTable"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-y-[32px]">
      <div className="flex flex-col gap-y-[8px]">
        <h1 className="text-[32px] font-semibold tracking-[-1.28px] text-[#171717]">Dashboard</h1>
        <p className="text-[16px] text-[#4d4d4d]">Welcome to GymOS</p>
      </div>

      <OverviewCards />

      <div className="grid grid-cols-1 gap-[32px] xl:grid-cols-2">
        <div className="flex flex-col gap-y-[32px]">
          <MembersAnalytics />
          <SubscriptionAnalytics />
        </div>
        <div className="flex flex-col gap-y-[32px]">
          <RevenueAnalytics />
          <AttendanceAnalytics />
          <TopMembersTable />
        </div>
      </div>
    </div>
  )
}
