import clsx from 'clsx'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-bg hover:bg-brand-hover',
  secondary: 'border border-line bg-raised text-ink hover:border-ink-faint',
  ghost: 'text-ink-muted hover:bg-raised hover:text-ink',
  danger: 'bg-danger text-bg hover:opacity-90',
}

export default function Button({
  variant = 'primary', loading, className, children, disabled, type = 'button', ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
