import * as React from "react"
import { Menu, LogOut, Shield } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"

export function PlatformHeader({ 
  onMenuClick, 
  className 
}: { 
  onMenuClick: () => void
  className?: string 
}) {
  const { user, logout } = useAuth()

  return (
    <header className={cn("sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#ebebeb] bg-[#ffffff] px-[24px] sm:gap-x-6", className)}>
      <button
        type="button"
        className="-m-2.5 p-2.5 text-[#171717] md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#171717] px-2.5 py-1 text-[12px] font-medium text-white">
            <Shield className="h-3.5 w-3.5" />
            Super Admin
          </span>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-4">
            <span className="hidden text-[14px] font-medium text-[#171717] lg:block">
              {user?.email || "Platform Admin"}
            </span>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
