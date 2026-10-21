import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Field from '../components/ui/Field'
import DataTable from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import { useFetch } from '../hooks/useFetch'
import { vendasService, produtosService, clientesService } from '../services/api'
import { brl, dateBR } from '../lib/format'
import type { Venda, VendaInput } from '../types'

interface Line { produtoId: string; quantidade: string }
const newLine = (): Line => ({ produtoId: '', quantidade: '1' })

export default function Vendas() {
  const vendas = useFetch(() => vendasService.list())
  const produtos = useFetch(() => produtosService.list())
  const clientes = useFetch(() => clientesService.list())

  const [open, setOpen] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [lines, setLines] = useState<Line[]>([newLine()])
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<Venda | null>(null)

  const nomeCliente = (v: Venda) =>
    v.clienteNome ?? clientes.data?.find((c) => c.id === v.clienteId)?.nome ?? (v.clienteId ? `Cliente #${v.clienteId}` : 'Sem cliente')

  const rows = useMemo(
    () => [...(vendas.data ?? [])].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [vendas.data],
  )

  const total = lines.reduce((sum, l) => {
    const p = produtos.data?.find((x) => String(x.id) === l.produtoId)
    const q = Number(l.quantidade)
    return sum + (p && q > 0 ? p.preco * q : 0)
  }, 0)

  const openForm = () => {
    setClienteId('')
    setLines([newLine()])
    setOpen(true)
  }

  const updateLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))

  const save = async () => {
    const itens: VendaInput['itens'] = []
    for (const l of lines) {
      if (!l.produtoId) continue
      const q = Number(l.quantidade)
      const p = produtos.data?.find((x) => String(x.id) === l.produtoId)
      if (!Number.isInteger(q) || q <= 0) { toast.error('Use quantidades inteiras maiores que zero.'); return }
      if (p && q > p.quantidade) { toast.error(`Estoque insuficiente de “${p.nome}” (${p.quantidade} un.).`); return }
      itens.push({ produtoId: Number(l.produtoId), quantidade: q })
    }
    if (itens.length === 0) { toast.error('Adicione ao menos um produto à venda.'); return }

    const payload: VendaInput = { itens, clienteId: clienteId ? Number(clienteId) : undefined }
    setSaving(true)
    try {
      await vendasService.create(payload)
      toast.success('Venda registrada.')
      setOpen(false)
      vendas.refetch()
      produtos.refetch()
    } catch {
      /* erro exibido pelo interceptor */
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    if (!removing) return
    setSaving(true)
    try {
      await vendasService.remove(removing.id)
      toast.success('Venda excluída.')
      setRemoving(null)
      vendas.refetch()
    } catch {
      /* erro exibido pelo interceptor */
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Venda>[] = [
    { key: 'id', header: 'Venda', render: (v) => <span className="font-medium">#{v.id}</span> },
    { key: 'data', header: 'Data', render: (v) => dateBR(v.data) },
    { key: 'cliente', header: 'Cliente', render: (v) => nomeCliente(v) },
    { key: 'itens', header: 'Itens', render: (v) => v.itens?.length ?? '—' },
    { key: 'total', header: 'Total', render: (v) => <span className="font-medium tabular-nums">{brl(v.total)}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Histórico e registro de novas vendas"
        action={<Button onClick={openForm}><Plus size={16} /> Nova venda</Button>}
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(v) => v.id}
        loading={vendas.loading}
        emptyTitle="Nenhuma venda registrada"
        emptyHint="Use “Nova venda” para registrar a primeira."
        actions={(v) => (
          <Button variant="ghost" onClick={() => setRemoving(v)} aria-label={`Excluir venda ${v.id}`}><Trash2 size={16} /></Button>
        )}
      />

      {open && (
        <Modal
          wide
          title="Nova venda"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button loading={saving} onClick={save}>Registrar venda</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Cliente (opcional)">
              <select className="input" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Sem cliente</option>
                {(clientes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Field>

            <div className="space-y-2">
              <span className="text-sm text-ink-muted">Produtos</span>
              {lines.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select className="input flex-1" value={l.produtoId} onChange={(e) => updateLine(i, { produtoId: e.target.value })} aria-label="Produto">
                    <option value="">Selecione um produto</option>
                    {(produtos.data ?? []).map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantidade === 0}>
                        {p.nome} — {brl(p.preco)} ({p.quantidade} un.)
                      </option>
                    ))}
                  </select>
                  <input
                    className="input w-20"
                    inputMode="numeric"
                    value={l.quantidade}
                    onChange={(e) => updateLine(i, { quantidade: e.target.value })}
                    aria-label="Quantidade"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls))}
                    aria-label="Remover item"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button variant="secondary" onClick={() => setLines((ls) => [...ls, newLine()])}>
                <Plus size={16} /> Adicionar produto
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-raised px-4 py-3">
              <span className="text-sm text-ink-muted">Total</span>
              <span className="text-lg font-semibold tabular-nums text-success">{brl(total)}</span>
            </div>
          </div>
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title="Excluir venda"
          message={`Excluir a venda #${removing.id}? Esta ação não pode ser desfeita.`}
          loading={saving}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
