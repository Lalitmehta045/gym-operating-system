import { cn } from "@/lib/utils"

export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED'

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const styles = {
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    INACTIVE: "bg-[var(--canvas-paper)] text-[var(--on-primary)] border-[var(--hairline)]",
    TRIAL: "bg-blue-100 text-blue-800 border-blue-200",
    EXPIRED: "bg-red-100 text-red-800 border-red-200",
    SUSPENDED: "bg-amber-100 text-amber-800 border-amber-200",
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      styles[status]
    )}>
      {status}
    </span>
  )
}
