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
          "flex w-full border border-[#ebebeb] bg-[#ffffff] text-[#171717] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#888888] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171717] disabled:cursor-not-allowed disabled:opacity-50",
          {
            "h-8 px-[8px] rounded-[6px] text-[14px]": inputSize === "sm",
            "h-10 px-[12px] rounded-[6px] text-[14px]": inputSize === "md",
            "h-12 px-[12px] rounded-[6px] text-[16px]": inputSize === "lg",
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
