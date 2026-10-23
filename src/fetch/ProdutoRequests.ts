import { API_URL, authHeaders, parseResponse } from '../config/api'

// AJUSTE o tipo conforme a entidade do backend.
export type Produto = { id?: number; [campo: string]: unknown }

const BASE = `${API_URL}/produtos`

export const listarProdutos = (): Promise<Produto[]> =>
  fetch(BASE, { headers: authHeaders() }).then((r) => parseResponse<Produto[]>(r))

export const buscarProduto = (id: number | string): Promise<Produto> =>
  fetch(`${BASE}/${id}`, { headers: authHeaders() }).then((r) => parseResponse<Produto>(r))

export const criarProduto = (dados: Produto): Promise<Produto> =>
  fetch(BASE, { method: 'POST', headers: authHeaders(), body: JSON.stringify(dados) }).then((r) =>
    parseResponse<Produto>(r),
  )

export const atualizarProduto = (id: number | string, dados: Produto): Promise<Produto> =>
  fetch(`${BASE}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(dados) }).then((r) =>
    parseResponse<Produto>(r),
  )

export const excluirProduto = (id: number | string): Promise<void> =>
  fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() }).then((r) => parseResponse<void>(r))
