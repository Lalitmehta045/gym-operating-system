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
          "flex w-full border border-[#ebebeb] bg-[#ffffff] text-[#171717] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171717] disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          {
            "h-8 px-[8px] rounded-[6px] text-[14px]": inputSize === "sm",
            "h-10 px-[12px] rounded-[6px] text-[14px]": inputSize === "md",
            "h-12 px-[12px] rounded-[6px] text-[16px]": inputSize === "lg",
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
