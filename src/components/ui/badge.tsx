import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
  children?: React.ReactNode;
  className?: string;
}

function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#2563EB] text-white",
    secondary: "bg-white/5 text-slate-400 font-bold",
    outline: "border border-white/10 text-white",
    destructive: "bg-rose-500 text-white"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
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
