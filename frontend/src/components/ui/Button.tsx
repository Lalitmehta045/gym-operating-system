import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "ghost" | "outline" | "default" | "destructive"
  size?: "md" | "lg" | "icon" | "sm"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "lg", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#6C47FF] text-white hover:bg-purple-700": variant === "primary" || variant === "default",
            "bg-[var(--canvas-light)] text-[var(--ink-soft)] border border-[var(--hairline)] hover:bg-[var(--canvas-paper)] shadow-sm": variant === "secondary" || variant === "outline",
            "bg-transparent text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)]": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "px-6 py-2.5 rounded-lg text-sm font-medium": size === "md" || size === "lg",
            "px-3 py-1.5 rounded-md text-sm": size === "sm",
            "h-10 w-10 rounded-full border border-[var(--hairline)] bg-[var(--canvas-light)] text-[var(--ink-soft)] hover:bg-[var(--canvas-paper)]": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
