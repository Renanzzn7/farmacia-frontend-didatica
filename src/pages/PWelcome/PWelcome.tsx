import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/AuthShell'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import {
  API_URL, NETWORK_ERROR_MESSAGE, errorMessageFrom, hasToken, readToken, saveToken,
} from '../../config/api'

// Tenta ${API_URL}/auth/login e, se a rota não existir (ou a chamada falhar), ${API_URL}/login.
async function autenticar(credenciais: { email: string; senha: string }): Promise<Response> {
  const init: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciais),
  }
  let res: Response | null = null
  try {
    res = await fetch(`${API_URL}/auth/login`, init)
  } catch {
    res = null
  }
  if (!res || res.status === 404 || res.status === 405) {
    res = await fetch(`${API_URL}/login`, init)
  }
  return res
}

export default function PWelcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  if (hasToken()) return <Navigate to="/" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.')
      return
    }
    setErro('')
    setLoading(true)
    try {
      const res = await autenticar({ email: email.trim(), senha })
      if (!res.ok) {
        throw new Error(res.status === 401 || res.status === 403 ? 'E-mail ou senha incorretos.' : await errorMessageFrom(res))
      }
      const token = await readToken(res)
      if (!token) throw new Error('A API respondeu sem token de acesso.')
      saveToken(token)
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(err instanceof TypeError ? NETWORK_ERROR_MESSAGE : err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Bem-vindo à Farmácia"
      subtitle="Entre para gerenciar produtos, clientes e vendas."
      footer={
        <>Primeiro acesso? <Link to="/login?modo=cadastro" className="text-brand hover:text-brand-hover">Criar conta</Link></>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="E-mail">
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
        </Field>
        <Field label="Senha">
          <input type="password" className="input" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        </Field>

        {erro && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>}

        <Button type="submit" loading={loading} className="w-full">Entrar</Button>
      </form>
    </AuthShell>
  )
}
