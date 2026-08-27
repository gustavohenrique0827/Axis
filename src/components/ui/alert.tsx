import * as React from "react"
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react"
import { cn } from "../../lib/utils"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info"
  title?: string
}

const variantConfig = {
  default: { icon: Info, classes: "bg-[var(--color-surface-sunken)] border-[var(--color-border-default)] text-[var(--color-text-primary)]" },
  success: { icon: CheckCircle2, classes: "bg-success/10 border-success/25 text-success" },
  warning: { icon: AlertTriangle, classes: "bg-warning/10 border-warning/25 text-warning" },
  danger: { icon: XCircle, classes: "bg-danger/10 border-danger/25 text-danger" },
  info: { icon: Info, classes: "bg-info/10 border-info/25 text-info" },
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", title, children, ...props }, ref) => {
    const { icon: Icon, classes } = variantConfig[variant]
    return (
      <div
        ref={ref}
        role="alert"
        className={cn("flex gap-3 rounded-[var(--radius-panel)] border p-4 text-sm", classes, className)}
        {...props}
      >
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className="text-[var(--color-text-muted)] [&:not(:only-child)]:text-current/80 leading-relaxed">{children}</div>}
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert }
