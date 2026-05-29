import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-white-text/10 bg-dark-bg/50 backdrop-blur-md text-white-text shadow", className)} {...props} />
))
Card.displayName = "Card"

export { Card }
