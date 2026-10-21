import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Pill, Users, ShoppingCart, Wallet } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import PageHeader from '../components/ui/PageHeader'
import { useFetch } from '../hooks/useFetch'
import { produtosService, clientesService, vendasService } from '../services/api'
import { brl, dateBR } from '../lib/format'

const LOW_STOCK = 5

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <h3 className="mb-4 text-sm font-medium text-ink-muted">{title}</h3>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const produtos = useFetch(() => produtosService.list())
  const clientes = useFetch(() => clientesService.list())
  const vendas = useFetch(() => vendasService.list())

  const faturamento = useMemo(
    () => (vendas.data ?? []).reduce((s, v) => s + Number(v.total || 0), 0),
    [vendas.data],
  )

  const baixoEstoque = useMemo(
    () => (produtos.data ?? []).filter((p) => p.quantidade <= LOW_STOCK).sort((a, b) => a.quantidade - b.quantidade),
    [produtos.data],
  )

  const dias = useMemo(() => {
    const out: { key: string; label: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      out.push({
        key: d.toLocaleDateString('sv-SE'),
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        total: 0,
      })
    }
    for (const v of vendas.data ?? []) {
      const d = new Date(v.data)
      if (isNaN(d.getTime())) continue
      const slot = out.find((o) => o.key === d.toLocaleDateString('sv-SE'))
      if (slot) slot.total += Number(v.total || 0)
    }
    return out
  }, [vendas.data])

  const max = Math.max(...dias.map((d) => d.total), 1)

  const recentes = useMemo(
    () => [...(vendas.data ?? [])].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5),
    [vendas.data],
  )

  const show = (loading: boolean, v: string | number) => (loading ? '—' : v)

  return (
    <div>
      <PageHeader title="Visão geral" subtitle="Resumo da operação da farmácia" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Produtos cadastrados" value={show(produtos.loading, produtos.data?.length ?? 0)} icon={Pill} />
        <StatCard label="Clientes" value={show(clientes.loading, clientes.data?.length ?? 0)} icon={Users} />
        <StatCard label="Vendas registradas" value={show(vendas.loading, vendas.data?.length ?? 0)} icon={ShoppingCart} tone="success" />
        <StatCard label="Faturamento total" value={show(vendas.loading, brl(faturamento))} icon={Wallet} tone="success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Faturamento nos últimos 7 dias">
            <div className="flex h-44 items-end gap-3">
              {dias.map((d) => (
                <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-md bg-success/80"
                    style={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 4 : 1)}%` }}
                    title={brl(d.total)}
                  />
                  <span className="text-xs text-ink-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title={`Estoque baixo (${LOW_STOCK} ou menos)`}>
          {baixoEstoque.length === 0 ? (
            <p className="text-sm text-ink-muted">Nenhum produto com estoque baixo.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {baixoEstoque.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span className="truncate pr-3">{p.nome}</span>
                  <span className={p.quantidade === 0 ? 'text-danger' : 'text-warn'}>{p.quantidade} un.</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Últimas vendas">
          {recentes.length === 0 ? (
            <p className="text-sm text-ink-muted">Nenhuma venda registrada.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {recentes.map((v) => (
                <li key={v.id} className="flex justify-between py-2">
                  <span>Venda #{v.id} <span className="text-ink-muted">em {dateBR(v.data)}</span></span>
                  <span className="font-medium tabular-nums">{brl(v.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
