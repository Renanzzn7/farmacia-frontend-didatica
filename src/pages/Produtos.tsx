import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Field from '../components/ui/Field'
import DataTable from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import { useFetch } from '../hooks/useFetch'
import { produtosService } from '../services/api'
import { brl, dateBR } from '../lib/format'
import type { Produto, ProdutoInput } from '../types'

const empty = { nome: '', descricao: '', preco: '', quantidade: '', validade: '' }
type Form = typeof empty
type Errors = Partial<Record<keyof Form, string>>

function StockBadge({ qtd }: { qtd: number }) {
  const [color, label] = qtd === 0 ? ['bg-danger', 'Sem estoque'] : qtd <= 5 ? ['bg-warn', `${qtd} un.`] : ['bg-success', `${qtd} un.`]
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  )
}

export default function Produtos() {
  const { data, loading, refetch } = useFetch(() => produtosService.list())
  const [busca, setBusca] = useState('')
  const [editing, setEditing] = useState<Produto | 'new' | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<Produto | null>(null)

  const rows = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (data ?? []).filter((p) => !q || p.nome.toLowerCase().includes(q) || (p.descricao ?? '').toLowerCase().includes(q))
  }, [data, busca])

  const openForm = (p?: Produto) => {
    setErrors({})
    setForm(p
      ? { nome: p.nome, descricao: p.descricao ?? '', preco: String(p.preco), quantidade: String(p.quantidade), validade: p.validade?.slice(0, 10) ?? '' }
      : empty)
    setEditing(p ?? 'new')
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = (): Errors => {
    const e: Errors = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome do produto.'
    const preco = Number(form.preco.replace(',', '.'))
    if (form.preco === '' || isNaN(preco) || preco < 0) e.preco = 'Informe um preço válido.'
    const qtd = Number(form.quantidade)
    if (form.quantidade === '' || !Number.isInteger(qtd) || qtd < 0) e.quantidade = 'Informe uma quantidade inteira (0 ou mais).'
    return e
  }

  const save = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    const payload: ProdutoInput = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      preco: Number(form.preco.replace(',', '.')),
      quantidade: Number(form.quantidade),
      validade: form.validade || undefined,
    }
    setSaving(true)
    try {
      if (editing && editing !== 'new') {
        await produtosService.update(editing.id, payload)
        toast.success('Produto atualizado.')
      } else {
        await produtosService.create(payload)
        toast.success('Produto cadastrado.')
      }
      setEditing(null)
      refetch()
    } catch {
      /* o erro já é exibido pelo interceptor */
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    if (!removing) return
    setSaving(true)
    try {
      await produtosService.remove(removing.id)
      toast.success('Produto excluído.')
      setRemoving(null)
      refetch()
    } catch {
      /* erro exibido pelo interceptor */
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Produto>[] = [
    { key: 'nome', header: 'Produto', render: (p) => <span className="font-medium">{p.nome}</span> },
    { key: 'preco', header: 'Preço', render: (p) => <span className="tabular-nums">{brl(p.preco)}</span> },
    { key: 'qtd', header: 'Estoque', render: (p) => <StockBadge qtd={p.quantidade} /> },
    { key: 'validade', header: 'Validade', render: (p) => dateBR(p.validade) },
  ]

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Cadastro e controle de estoque"
        action={<Button onClick={() => openForm()}><Plus size={16} /> Novo produto</Button>}
      />
      <div className="mb-4"><SearchInput value={busca} onChange={setBusca} placeholder="Buscar produto" /></div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        loading={loading}
        emptyTitle={busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
        emptyHint={busca ? 'Tente outro termo de busca.' : 'Use “Novo produto” para cadastrar o primeiro.'}
        actions={(p) => (
          <>
            <Button variant="ghost" onClick={() => openForm(p)} aria-label={`Editar ${p.nome}`}><Pencil size={16} /></Button>
            <Button variant="ghost" onClick={() => setRemoving(p)} aria-label={`Excluir ${p.nome}`}><Trash2 size={16} /></Button>
          </>
        )}
      />

      {editing && (
        <Modal
          title={editing === 'new' ? 'Novo produto' : 'Editar produto'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button loading={saving} onClick={save}>Salvar produto</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Nome" error={errors.nome}><input className="input" value={form.nome} onChange={set('nome')} autoFocus /></Field>
            <Field label="Descrição"><textarea className="input min-h-[72px]" value={form.descricao} onChange={set('descricao')} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preço (R$)" error={errors.preco}><input className="input" inputMode="decimal" value={form.preco} onChange={set('preco')} placeholder="0,00" /></Field>
              <Field label="Quantidade em estoque" error={errors.quantidade}><input className="input" inputMode="numeric" value={form.quantidade} onChange={set('quantidade')} /></Field>
            </div>
            <Field label="Validade"><input type="date" className="input" value={form.validade} onChange={set('validade')} /></Field>
          </div>
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title="Excluir produto"
          message={`Excluir “${removing.nome}”? Esta ação não pode ser desfeita.`}
          loading={saving}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
