import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "success" | "danger" | "secondary" | "subtle"
  size?: "default" | "sm" | "lg" | "icon" | "xs"

}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const variants = {
      default: "bg-[var(--color-primary-blue)] text-white border border-[var(--color-primary-blue)]/25 hover:brightness-110 shadow-[var(--shadow-control)] active:scale-[0.98]",
      outline: "border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] active:scale-[0.98]",
      ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] active:scale-[0.98]",
      success: "bg-success/10 border border-success/25 text-success hover:bg-success/20 active:scale-[0.98]",
      danger: "bg-danger/10 border border-danger/25 text-danger hover:bg-danger/20 active:scale-[0.98]",
      secondary: "bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 active:scale-[0.98]",
      subtle: "bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] active:scale-[0.98]"
    }
    const sizes = {
      default: "h-10 px-4 py-2 rounded-[var(--radius-control)] text-sm",
      sm: "h-9 px-3 rounded-[var(--radius-control)] text-xs",
      lg: "h-11 px-6 rounded-[var(--radius-control)] text-base",
      icon: "h-10 w-10 rounded-[var(--radius-control)] justify-center",
      xs: "h-8 px-2 rounded-[var(--radius-control)] text-[10px]",
    }



    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-blue)]/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
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
