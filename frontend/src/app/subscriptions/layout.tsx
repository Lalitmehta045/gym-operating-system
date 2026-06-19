import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Subscriptions | GymOS",
  description: "Manage your gym subscriptions",
}

export default function SubscriptionsLayout({
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
