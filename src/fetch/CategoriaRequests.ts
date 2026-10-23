import { API_URL, authHeaders, parseResponse } from '../config/api'

// AJUSTE o tipo conforme a entidade do backend.
export type Categoria = { id?: number; [campo: string]: unknown }

const BASE = `${API_URL}/categorias`

export const listarCategorias = (): Promise<Categoria[]> =>
  fetch(BASE, { headers: authHeaders() }).then((r) => parseResponse<Categoria[]>(r))

export const buscarCategoria = (id: number | string): Promise<Categoria> =>
  fetch(`${BASE}/${id}`, { headers: authHeaders() }).then((r) => parseResponse<Categoria>(r))

export const criarCategoria = (dados: Categoria): Promise<Categoria> =>
  fetch(BASE, { method: 'POST', headers: authHeaders(), body: JSON.stringify(dados) }).then((r) =>
    parseResponse<Categoria>(r),
  )

export const atualizarCategoria = (id: number | string, dados: Categoria): Promise<Categoria> =>
  fetch(`${BASE}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(dados) }).then((r) =>
    parseResponse<Categoria>(r),
  )

export const excluirCategoria = (id: number | string): Promise<void> =>
  fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() }).then((r) => parseResponse<void>(r))
