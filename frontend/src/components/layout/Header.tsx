import * as React from "react"
import { Menu, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function Header({ 
  onMenuClick, 
  className 
}: { 
  onMenuClick: () => void
  className?: string 
}) {
  const { user, logout } = useAuth()

  return (
    <header className={cn("sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--hairline-soft)] bg-[var(--canvas)] px-[24px] sm:gap-x-6", className)}>
      <button
        type="button"
        className="-m-2.5 p-2.5 text-[var(--on-primary)] md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-4">
            <ThemeToggle />
            <span className="hidden text-body-sm text-[var(--ash)] lg:block">
              {user?.email || "User"}
            </span>
            <button className="button-ghost-dark hover:text-[var(--on-primary)]" onClick={() => logout()} title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
