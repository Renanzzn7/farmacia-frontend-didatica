# Farmácia Frontend (Dark)

React + Vite + TypeScript + TailwindCSS, tema escuro, integrado ao backend `farmacia-backend-didatica`.

## Rodando

```bash
npm install
cp .env.example .env     # ajuste VITE_API_URL
npm run dev
```

Build de produção: `npm run build`.

## Integração com o backend (leia isto)

Os repositórios do backend não puderam ser lidos na geração deste projeto, então as rotas e os campos das
entidades são **suposições**. Tudo está concentrado em dois arquivos:

- `src/services/api.ts`: objeto `ROUTES` com os caminhos (`/produtos`, `/clientes`, `/vendas`).
- `src/types/index.ts`: campos de `Produto`, `Cliente` e `Venda`.

Se o backend usar nomes diferentes (ex.: `descricao` vs `description`, `/api/produtos`), ajuste apenas esses arquivos.
Respostas paginadas (`{ content: [...] }`, `{ data: [...] }`) são tratadas automaticamente.

## Estrutura

```
src/
├── components/layout/Layout.tsx
├── components/ui/        Button, Modal, ConfirmDialog, DataTable, Field, StatCard, PageHeader, SearchInput
├── hooks/useFetch.ts
├── lib/format.ts
├── pages/                Dashboard, Produtos, Clientes, Vendas
├── services/api.ts       Axios, tratamento de erros (toasts) e serviços
└── types/index.ts
```
