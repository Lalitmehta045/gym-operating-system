import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  inputSize?: "sm" | "md" | "lg"
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, inputSize = "md", children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex w-full bg-[var(--canvas-light)] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          {
            "h-[42px]": inputSize === "md" || !inputSize,
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
