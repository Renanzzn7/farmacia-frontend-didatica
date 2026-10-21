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
import { clientesService } from '../services/api'
import type { Cliente, ClienteInput } from '../types'

const empty = { nome: '', cpf: '', telefone: '', email: '' }
type Form = typeof empty
type Errors = Partial<Record<keyof Form, string>>

export default function Clientes() {
  const { data, loading, refetch } = useFetch(() => clientesService.list())
  const [busca, setBusca] = useState('')
  const [editing, setEditing] = useState<Cliente | 'new' | null>(null)
  const [form, setForm] = useState<Form>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<Cliente | null>(null)

  const rows = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (data ?? []).filter((c) =>
      !q || c.nome.toLowerCase().includes(q) || (c.cpf ?? '').includes(q) || (c.email ?? '').toLowerCase().includes(q))
  }, [data, busca])

  const openForm = (c?: Cliente) => {
    setErrors({})
    setForm(c ? { nome: c.nome, cpf: c.cpf ?? '', telefone: c.telefone ?? '', email: c.email ?? '' } : empty)
    setEditing(c ?? 'new')
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = (): Errors => {
    const e: Errors = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome do cliente.'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'E-mail inválido.'
    return e
  }

  const save = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    const payload: ClienteInput = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      email: form.email.trim() || undefined,
    }
    setSaving(true)
    try {
      if (editing && editing !== 'new') {
        await clientesService.update(editing.id, payload)
        toast.success('Cliente atualizado.')
      } else {
        await clientesService.create(payload)
        toast.success('Cliente cadastrado.')
      }
      setEditing(null)
      refetch()
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
      await clientesService.remove(removing.id)
      toast.success('Cliente excluído.')
      setRemoving(null)
      refetch()
    } catch {
      /* erro exibido pelo interceptor */
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<Cliente>[] = [
    { key: 'nome', header: 'Nome', render: (c) => <span className="font-medium">{c.nome}</span> },
    { key: 'cpf', header: 'CPF', render: (c) => c.cpf || '—' },
    { key: 'telefone', header: 'Telefone', render: (c) => c.telefone || '—' },
    { key: 'email', header: 'E-mail', render: (c) => c.email || '—' },
  ]

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Quem compra na farmácia"
        action={<Button onClick={() => openForm()}><Plus size={16} /> Novo cliente</Button>}
      />
      <div className="mb-4"><SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome, CPF ou e-mail" /></div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        loading={loading}
        emptyTitle={busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
        emptyHint={busca ? 'Tente outro termo de busca.' : 'Use “Novo cliente” para cadastrar o primeiro.'}
        actions={(c) => (
          <>
            <Button variant="ghost" onClick={() => openForm(c)} aria-label={`Editar ${c.nome}`}><Pencil size={16} /></Button>
            <Button variant="ghost" onClick={() => setRemoving(c)} aria-label={`Excluir ${c.nome}`}><Trash2 size={16} /></Button>
          </>
        )}
      />

      {editing && (
        <Modal
          title={editing === 'new' ? 'Novo cliente' : 'Editar cliente'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button loading={saving} onClick={save}>Salvar cliente</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Nome" error={errors.nome}><input className="input" value={form.nome} onChange={set('nome')} autoFocus /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CPF"><input className="input" value={form.cpf} onChange={set('cpf')} /></Field>
              <Field label="Telefone"><input className="input" value={form.telefone} onChange={set('telefone')} /></Field>
            </div>
            <Field label="E-mail" error={errors.email}><input type="email" className="input" value={form.email} onChange={set('email')} /></Field>
          </div>
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title="Excluir cliente"
          message={`Excluir “${removing.nome}”? Esta ação não pode ser desfeita.`}
          loading={saving}
          onConfirm={confirmRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
    </div>
  )
}
