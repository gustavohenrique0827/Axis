import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";
  children?: React.ReactNode;
  className?: string;
}

function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-primary-blue)] text-white",
    secondary: "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] font-bold",
    outline: "border border-[var(--color-border-default)] text-[var(--color-text-primary)]",
    destructive: "bg-danger/10 text-danger border border-danger/25",
    success: "bg-success/10 text-success border border-success/25",
    warning: "bg-warning/10 text-warning border border-warning/25",
    info: "bg-info/10 text-info border border-info/25"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
