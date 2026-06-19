import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payments & Revenue | GymOS",
  description: "Track and manage payments",
}

export default function PaymentsLayout({
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
