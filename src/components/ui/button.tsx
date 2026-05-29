import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "success" | "danger" | "secondary" | "subtle"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const variants = {
      default: "bg-[#2563EB] text-[#F8FAFC] border border-blue-500/25 hover:bg-blue-600 shadow-md shadow-blue-500/10 active:scale-[0.98]",
      outline: "border border-white/10 text-slate-200 hover:bg-white/5 hover:text-white active:scale-[0.98]",
      ghost: "text-slate-400 hover:bg-white/5 hover:text-white active:scale-[0.98]",
      success: "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98]",
      danger: "bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 active:scale-[0.98]",
      secondary: "bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 active:scale-[0.98]",
      subtle: "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10 hover:text-white active:scale-[0.98]"
    }
    const sizes = {
      default: "h-10 px-4 py-2 rounded-lg text-sm",
      sm: "h-9 px-3 rounded-lg text-xs",
      lg: "h-11 px-6 rounded-xl text-base",
      icon: "h-10 w-10 rounded-lg justify-center",
    }
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variants[variant],
          sizes[size],
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
