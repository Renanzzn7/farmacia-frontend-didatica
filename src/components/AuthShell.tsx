import type { ReactNode } from 'react'
import { Pill } from 'lucide-react'

export default function AuthShell({ title, subtitle, children, footer }: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="mb-6 flex items-center gap-2 font-semibold">
          <Pill className="text-success" size={22} />
          Farmácia
        </div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 border-t border-line pt-4 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </div>
  )
}
