"use client"

import * as React from "react"
import { useState } from "react"
import { PlatformSidebar } from "./PlatformSidebar"
import { PlatformHeader } from "./PlatformHeader"
import { cn } from "@/lib/utils"
import { PlatformProtectedRoute } from "@/components/auth/PlatformProtectedRoute"

export function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PlatformProtectedRoute>
      <div className="flex h-screen w-full bg-[#fafafa] overflow-hidden">
        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-[#171717]/50 backdrop-blur-sm md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <PlatformSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <PlatformHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-[24px]">
            <div className="mx-auto max-w-[1400px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PlatformProtectedRoute>
  )
}
