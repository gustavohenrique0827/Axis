import * as React from "react"
import { cn } from "../../lib/utils"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
}

/**
 * Wrapper padrão para campos de formulário (usar com react-hook-form: passar
 * `error={errors.campo?.message}`). Não substitui o Input/Select — só padroniza
 * label, indicador de obrigatório, hint e mensagem de erro ao redor deles.
 */
function FormField({ label, htmlFor, required, hint, error, className, children, ...props }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-primary)]">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  )
}

export { FormField }
