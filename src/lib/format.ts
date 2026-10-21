const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const brl = (n: number | string | undefined | null) => money.format(Number(n ?? 0))

export function dateBR(value?: string): string {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR')
}
