// Ajuste os campos abaixo conforme as entidades reais do backend.

export interface Produto {
  id: number
  nome: string
  descricao?: string
  preco: number
  quantidade: number
  validade?: string
}
export type ProdutoInput = Omit<Produto, 'id'>

export interface Cliente {
  id: number
  nome: string
  cpf?: string
  telefone?: string
  email?: string
}
export type ClienteInput = Omit<Cliente, 'id'>

export interface ItemVenda {
  produtoId: number
  quantidade: number
  precoUnitario?: number
}

export interface Venda {
  id: number
  clienteId?: number
  clienteNome?: string
  total: number
  data: string
  itens?: ItemVenda[]
}

export interface VendaInput {
  clienteId?: number
  itens: { produtoId: number; quantidade: number }[]
}
