import * as React from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-[200px] w-full items-center justify-center rounded-[var(--radius-app-lg)] bg-[var(--canvas-soft)]", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-[var(--on-primary)]" />
    </div>
  )
}

export function EmptyState({ 
  title, 
  description, 
  className,
  action
}: { 
  title: string
  description?: string
  className?: string 
  action?: {
    label: string
    onClick: () => void
  }
}) {
  return (
    <div className={cn("flex min-h-[300px] flex-col items-center justify-center rounded-[var(--radius-marketing)] bg-[var(--canvas-soft)] p-[48px] text-center", className)}>
      <h3 className="text-[16px] font-medium text-[var(--on-primary)]">{title}</h3>
      {description && <p className="mt-2 text-[14px] text-[var(--ash)]">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 button-secondary-dark"
        >
          {action.label}
        </button>
      )}
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
    <div className={cn("flex flex-col items-center justify-center rounded-[var(--radius-app-lg)] bg-[var(--error)]/10 p-[24px] text-center border border-[var(--error)]/20", className)}>
      <AlertCircle className="mb-2 h-6 w-6 text-[var(--error)]" />
      <h3 className="text-[14px] font-medium text-[var(--error)]">{title}</h3>
      {description && <p className="mt-1 text-[12px] text-[var(--error)]/80">{description}</p>}
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
      <div className={cn("flex flex-col items-center justify-center rounded-[var(--radius-app-lg)] bg-[var(--error)]/10 p-[24px] text-center border border-[var(--error)]/20", className)}>
        <AlertCircle className="mb-2 h-6 w-6 text-[var(--error)]" />
        <h3 className="text-[14px] font-medium text-[var(--error)]">{title || "An error occurred"}</h3>
        {description && <p className="mt-1 text-[12px] text-[var(--error)]/80">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 px-3 py-1.5 text-[12px] font-medium text-[var(--error)] bg-transparent border border-[var(--error)]/20 rounded-[var(--radius-app-sm)] hover:bg-[var(--error)]/10 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }

  return null
}

