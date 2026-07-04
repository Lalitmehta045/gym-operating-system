import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = "md", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-[var(--canvas-light)] rounded-lg border border-[var(--hairline)] px-4 py-2.5 text-[var(--on-primary)] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--ash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50",
          {
            "h-[42px]": inputSize === "md" || !inputSize,
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
