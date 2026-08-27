import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" | "purple" | "cyan" | "neutral";
  dot?: boolean;
  dotPulse?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function Badge({ children, className, variant = "default", dot = false, dotPulse = false, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-primary-blue)] text-white",
    secondary: "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] font-bold",
    outline: "border border-[var(--color-border-default)] text-[var(--color-text-primary)]",
    destructive: "bg-danger/10 text-danger border border-danger/25",
    success: "bg-success/10 text-success border border-success/25",
    warning: "bg-warning/10 text-warning border border-warning/25",
    info: "bg-info/10 text-info border border-info/25",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25",
    neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-text-muted)] border border-[var(--color-border-default)]",
  }

  const dotColors = {
    default: "bg-white",
    secondary: "bg-[var(--color-text-muted)]",
    outline: "bg-[var(--color-primary-blue)]",
    destructive: "bg-danger",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    purple: "bg-purple-400",
    cyan: "bg-cyan-400",
    neutral: "bg-[var(--color-text-muted)]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColors[variant],
            dotPulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge }
