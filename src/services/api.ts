import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL, clearToken, getToken } from '../config/api'
import type {
  Produto, ProdutoInput, Cliente, ClienteInput, Venda, VendaInput,
} from '../types'

/**
 * Rotas do backend. Ajuste aqui se o seu backend usar outros caminhos
 * (ex.: '/api/produtos').
 */
export const ROUTES = {
  produtos: '/produtos',
  clientes: '/clientes',
  vendas: '/vendas',
} as const

export const api = axios.create({
  // API_URL já vem sem barra final (src/config/api.ts)
  baseURL: API_URL || 'http://localhost:8080',
  // O plano gratuito do Render "dorme" e pode levar ~30-60s para acordar na primeira chamada.
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// Envia Authorization: Bearer <token> em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Se a API está no Render (plano gratuito), ela pode estar acordando: aguarde cerca de 1 minuto e tente de novo. Se persistir, confira VITE_API_URL e o CORS do backend.'
    }
    const data = error.response.data as { message?: string; error?: string } | string | undefined
    if (typeof data === 'string' && data.length > 0 && data.length < 200) return data
    if (data && typeof data === 'object') {
      const msg = data.message ?? data.error
      if (msg) return msg
    }
    switch (error.response.status) {
      case 400: return 'Dados inválidos. Revise os campos e tente de novo.'
      case 401: return 'Sessão expirada. Entre novamente.'
      case 403: return 'Você não tem permissão para esta ação.'
      case 404: return 'Registro não encontrado.'
      case 409: return 'Conflito: este registro já existe ou está em uso.'
      default: return `Erro no servidor (${error.response.status}). Tente novamente.`
    }
  }
  return 'Ocorreu um erro inesperado.'
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Token vencido ou inválido: volta para a tela de boas-vindas
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken()
      const p = window.location.pathname
      if (!p.startsWith('/welcome') && !p.startsWith('/login')) window.location.assign('/welcome')
    }
    const msg = getErrorMessage(error)
    toast.error(msg, { id: msg }) // id evita toasts repetidos
    return Promise.reject(error)
  },
)

// Aceita array puro ou respostas paginadas ({ content }, { data }, { items }, { results }).
function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const k of ['content', 'data', 'items', 'results']) {
      if (Array.isArray(o[k])) return o[k] as T[]
    }
  }
  return []
}

function createCrud<T, TInput>(resource: string) {
  return {
    list: () => api.get(resource).then((r) => unwrapList<T>(r.data)),
    get: (id: number | string) => api.get<T>(`${resource}/${id}`).then((r) => r.data),
    create: (data: TInput) => api.post<T>(resource, data).then((r) => r.data),
    update: (id: number | string, data: TInput) =>
      api.put<T>(`${resource}/${id}`, data).then((r) => r.data),
    remove: (id: number | string) => api.delete(`${resource}/${id}`).then(() => undefined),
  }
}

export const produtosService = createCrud<Produto, ProdutoInput>(ROUTES.produtos)
export const clientesService = createCrud<Cliente, ClienteInput>(ROUTES.clientes)
export const vendasService = createCrud<Venda, VendaInput>(ROUTES.vendas)
