import * as React from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-[200px] w-full items-center justify-center rounded-[8px] bg-[#fafafa]", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-[#171717]" />
    </div>
  )
}

export function EmptyState({ 
  title, 
  description, 
  className 
}: { 
  title: string
  description?: string
  className?: string 
}) {
  return (
    <div className={cn("flex min-h-[300px] flex-col items-center justify-center rounded-[12px] bg-[#fafafa] p-[48px] text-center", className)}>
      <h3 className="text-[16px] font-medium text-[#171717]">{title}</h3>
      {description && <p className="mt-2 text-[14px] text-[#4d4d4d]">{description}</p>}
    </div>
  )
}

export function ErrorState({
  title = "An error occurred",
  description,
  className
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-[8px] bg-[#f7d4d6] p-[24px] text-center border border-[#ee0000]/20", className)}>
      <AlertCircle className="mb-2 h-6 w-6 text-[#ee0000]" />
      <h3 className="text-[14px] font-medium text-[#c50000]">{title}</h3>
      {description && <p className="mt-1 text-[12px] text-[#c50000]/80">{description}</p>}
    </div>
  )
}

export function States({
  state,
  title,
  description,
  className,
  action
}: {
  state: "loading" | "empty" | "error"
  title?: string
  description?: string
  className?: string
  action?: {
    label: string
    onClick: () => void
  }
}) {
  if (state === "loading") {
    return <LoadingState className={className} />
  }

  if (state === "empty") {
    return (
      <EmptyState
        title={title || "No data"}
        description={description}
        className={className}
      />
    )
  }

  if (state === "error") {
    return (
      <div className={cn("flex flex-col items-center justify-center rounded-[8px] bg-[#f7d4d6] p-[24px] text-center border border-[#ee0000]/20", className)}>
        <AlertCircle className="mb-2 h-6 w-6 text-[#ee0000]" />
        <h3 className="text-[14px] font-medium text-[#c50000]">{title || "An error occurred"}</h3>
        {description && <p className="mt-1 text-[12px] text-[#c50000]/80">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 px-3 py-1.5 text-[12px] font-medium text-[#c50000] bg-white border border-[#ee0000]/20 rounded-[4px] hover:bg-[#fafafa] transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }

  return null
}

