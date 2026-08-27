import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
  label?: string
}

const sizes = {
  sm: "w-4 h-4",
  default: "w-5 h-5",
  lg: "w-8 h-8",
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", label, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label ?? "Carregando"}
      className={cn("inline-flex items-center gap-2 text-[var(--color-text-muted)]", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizes[size])} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
)
Spinner.displayName = "Spinner"

export { Spinner }
