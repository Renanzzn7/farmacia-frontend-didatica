import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../../components/AuthShell'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import {
  API_URL, NETWORK_ERROR_MESSAGE, errorMessageFrom, hasToken, readToken, saveToken,
} from '../../config/api'

type Modo = 'entrar' | 'cadastrar'

export default function PLogin() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>(params.get('modo') === 'cadastro' ? 'cadastrar' : 'entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  if (hasToken()) return <Navigate to="/" replace />

  const trocarModo = (m: Modo) => {
    setModo(m)
    setErro('')
  }

  const validar = (): string => {
    if (modo === 'cadastrar' && !nome.trim()) return 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Informe um e-mail válido.'
    if (!senha) return 'Informe a senha.'
    if (modo === 'cadastrar' && senha.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.'
    return ''
  }

  // POST ${API_URL}/login
  const entrar = async () => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), senha }),
    })
    if (!res.ok) {
      throw new Error(res.status === 401 || res.status === 403 ? 'E-mail ou senha incorretos.' : await errorMessageFrom(res))
    }
    const token = await readToken(res)
    if (!token) throw new Error('A API respondeu sem token de acesso.')
    saveToken(token)
    navigate('/', { replace: true })
  }

  // POST ${API_URL}/usuario
  const cadastrar = async () => {
    const res = await fetch(`${API_URL}/usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
    })
    if (!res.ok) throw new Error(await errorMessageFrom(res))
    toast.success('Conta criada. Agora é só entrar.')
    setSenha('')
    trocarModo('entrar')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const problema = validar()
    setErro(problema)
    if (problema) return
    setLoading(true)
    try {
      if (modo === 'entrar') await entrar()
      else await cadastrar()
    } catch (err) {
      setErro(err instanceof TypeError ? NETWORK_ERROR_MESSAGE : err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const entrando = modo === 'entrar'

  return (
    <AuthShell
      title={entrando ? 'Entrar na conta' : 'Criar conta'}
      subtitle={entrando ? 'Use seu e-mail e senha para acessar o painel.' : 'Preencha os dados para cadastrar um novo usuário.'}
      footer={
        entrando ? (
          <>Ainda não tem conta? <button type="button" className="text-brand hover:text-brand-hover" onClick={() => trocarModo('cadastrar')}>Criar conta</button></>
        ) : (
          <>Já tem conta? <button type="button" className="text-brand hover:text-brand-hover" onClick={() => trocarModo('entrar')}>Entrar</button></>
        )
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {!entrando && (
          <Field label="Nome">
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" autoFocus />
          </Field>
        )}
        <Field label="E-mail">
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus={entrando} />
        </Field>
        <Field label="Senha">
          <input
            type="password"
            className="input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={entrando ? 'current-password' : 'new-password'}
          />
        </Field>

        {erro && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>}

        <Button type="submit" loading={loading} className="w-full">
          {entrando ? 'Entrar' : 'Criar conta'}
        </Button>
      </form>
    </AuthShell>
  )
}
