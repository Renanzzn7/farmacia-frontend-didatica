import { API_URL, authHeaders, parseResponse } from '../config/api'

// AJUSTE o tipo conforme a entidade do backend.
export type Movimentacao = { id?: number; [campo: string]: unknown }

const BASE = `${API_URL}/movimentacoes`

export const listarMovimentacoes = (): Promise<Movimentacao[]> =>
  fetch(BASE, { headers: authHeaders() }).then((r) => parseResponse<Movimentacao[]>(r))

export const buscarMovimentacao = (id: number | string): Promise<Movimentacao> =>
  fetch(`${BASE}/${id}`, { headers: authHeaders() }).then((r) => parseResponse<Movimentacao>(r))

export const criarMovimentacao = (dados: Movimentacao): Promise<Movimentacao> =>
  fetch(BASE, { method: 'POST', headers: authHeaders(), body: JSON.stringify(dados) }).then((r) =>
    parseResponse<Movimentacao>(r),
  )

export const atualizarMovimentacao = (id: number | string, dados: Movimentacao): Promise<Movimentacao> =>
  fetch(`${BASE}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(dados) }).then((r) =>
    parseResponse<Movimentacao>(r),
  )

export const excluirMovimentacao = (id: number | string): Promise<void> =>
  fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() }).then((r) => parseResponse<void>(r))
