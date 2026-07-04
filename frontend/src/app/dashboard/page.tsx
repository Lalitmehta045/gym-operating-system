import { OverviewCards } from "@/components/dashboard/OverviewCards"
import { MembersAnalytics } from "@/components/dashboard/MembersAnalytics"
import { AttendanceAnalytics } from "@/components/dashboard/AttendanceAnalytics"
import { RevenueAnalytics } from "@/components/dashboard/RevenueAnalytics"
import { SubscriptionAnalytics } from "@/components/dashboard/SubscriptionAnalytics"
import { TopMembersTable } from "@/components/dashboard/TopMembersTable"
import { RevenueOverview } from "@/components/dashboard/RevenueOverview"
import { QuickActions } from "@/components/dashboard/QuickActions"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col gap-y-1 pt-2">
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--on-primary)]">Dashboard</h1>
        <p className="text-[14px] text-[var(--ash)]">Welcome to GymOS 👋</p>
      </div>

      {/* 9 Metric Cards (3×3 Grid) */}
      <OverviewCards />

      {/* Member Analytics + Revenue Analytics (2 columns) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MembersAnalytics />
        <RevenueAnalytics />
      </div>

      {/* Subscription Analytics + Attendance Analytics (2 columns) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SubscriptionAnalytics />
        <div className="flex flex-col gap-6">
          <AttendanceAnalytics />
          <TopMembersTable />
        </div>
      </div>

      {/* Revenue Overview (full width) */}
      <RevenueOverview />

      {/* Quick Actions */}
      <QuickActions />

      {/* Footer */}
      <footer className="flex items-center justify-between pt-4 pb-2 border-t border-[var(--hairline-soft)] mt-2">
        <p className="text-[12px] text-[var(--ash)]">© 2025 GymOS. All rights reserved.</p>
        <p className="text-[12px] text-[var(--ash)]">Made with <span className="text-red-400">❤️</span> for fitness businesses</p>
      </footer>
    </div>
  )
}
