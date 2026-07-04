"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { LoadingState } from "@/components/ui/States"

export function PlatformProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && user.role !== 'SUPER_ADMIN') {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, mounted, router])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return <LoadingState className="h-screen bg-[var(--canvas-soft)]" />
  }

  return <>{children}</>
}
