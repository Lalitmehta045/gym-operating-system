import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Membership Plans | GymOS",
  description: "Manage your gym membership plans",
}

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
