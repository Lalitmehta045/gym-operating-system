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
            "bg-[#171717] text-[#ffffff] hover:bg-[#171717]/90": variant === "primary" || variant === "default",
            "bg-[#ffffff] text-[#171717] border border-[#ebebeb] hover:bg-[#fafafa] shadow-sm": variant === "secondary" || variant === "outline",
            "bg-transparent text-[#171717] hover:bg-[#fafafa]": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "h-12 px-[12px] text-[16px] leading-[24px] rounded-[100px]": size === "lg",
            "h-8 px-[8px] text-[14px] leading-[20px] rounded-[100px]": size === "md",
            "h-9 px-[8px] text-[14px] leading-[20px] rounded-[6px]": size === "sm",
            "h-10 w-10 rounded-full border border-[#ebebeb] bg-[#ffffff] text-[#171717] hover:bg-[#fafafa]": size === "icon",
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
