import type { LucideIcon } from 'lucide-react'

type Tone = 'brand' | 'success' | 'warn'

const tones: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  success: 'bg-success/10 text-success',
  warn: 'bg-warn/10 text-warn',
}

export default function StatCard({ label, value, icon: Icon, tone = 'brand' }: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: Tone
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  )
}
