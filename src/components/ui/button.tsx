import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "success" | "danger" | "secondary" | "subtle"
  size?: "default" | "sm" | "lg" | "icon" | "xs"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const variants = {
      default: "bg-[var(--color-primary-blue)] !text-white font-bold border border-[var(--color-primary-blue)]/25 hover:brightness-110 shadow-[var(--shadow-control)] active:scale-[0.98]",
      outline: "border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] active:scale-[0.98]",
      // Antes sem fundo por padrão (só aparecia com bg no hover) — muitos botões de
      // ícone (editar/excluir/fechar) usam essa variante e ficavam praticamente
      // invisíveis até o usuário passar o mouse. Agora tem fundo sutil sempre visível.
      ghost: "bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:border-[var(--color-border-default)] hover:text-[var(--color-text-primary)] active:scale-[0.98]",
      success: "bg-success/10 border border-success/25 text-success hover:bg-success/20 active:scale-[0.98]",
      danger: "bg-danger/10 border border-danger/25 text-danger hover:bg-danger/20 active:scale-[0.98]",
      secondary: "bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 active:scale-[0.98]",
      subtle: "bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] active:scale-[0.98]"
    }
    const sizes = {
      default: "h-10 px-4 py-2 rounded-[var(--radius-control)] text-sm gap-2",
      sm: "h-9 px-3 rounded-[var(--radius-control)] text-xs gap-1.5",
      lg: "h-11 px-6 rounded-[var(--radius-control)] text-base gap-2.5",
      icon: "h-10 w-10 rounded-[var(--radius-control)] justify-center",
      xs: "h-8 px-2 rounded-[var(--radius-control)] text-[10px] gap-1",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-blue)]/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variants[variant],
          sizes[size],
          loading && "opacity-80 pointer-events-none",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-0.5 h-4 w-4 shrink-0 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="!text-white font-bold">{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
