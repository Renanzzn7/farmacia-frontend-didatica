import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  emptyTitle?: string
  emptyHint?: string
  actions?: (row: T) => ReactNode
}

/** Tabela no desktop; no mobile cada linha vira um cartão. */
export default function DataTable<T>({
  columns, rows, rowKey, loading, emptyTitle = 'Nada por aqui ainda', emptyHint, actions,
}: Props<T>) {
  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface" />)}
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
        <Inbox className="mb-3 text-ink-faint" size={28} />
        <p className="font-medium">{emptyTitle}</p>
        {emptyHint && <p className="mt-1 text-sm text-ink-muted">{emptyHint}</p>}
      </div>
    )
  }

  const [first, ...rest] = columns

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-muted">
            <tr>
              {columns.map((c) => <th key={c.key} className={`px-4 py-3 font-medium ${c.className ?? ''}`}>{c.header}</th>)}
              {actions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={rowKey(r)} className="hover:bg-raised/60">
                {columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>{c.render(r)}</td>)}
                {actions && <td className="px-4 py-3"><div className="flex justify-end gap-1">{actions(r)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <div key={rowKey(r)} className="rounded-xl border border-line bg-surface p-4 shadow-card">
            <div className="mb-2 font-medium">{first.render(r)}</div>
            <dl className="space-y-1.5 text-sm">
              {rest.map((c) => (
                <div key={c.key} className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{c.header}</dt>
                  <dd className="text-right">{c.render(r)}</dd>
                </div>
              ))}
            </dl>
            {actions && <div className="mt-3 flex justify-end gap-1 border-t border-line pt-3">{actions(r)}</div>}
          </div>
        ))}
      </div>
    </>
  )
}
