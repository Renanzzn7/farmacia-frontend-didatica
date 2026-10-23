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
├── config/api.ts         API_URL (VITE_API_URL), token (localStorage) e helpers
├── fetch/                ProdutoRequests, MovimentacaoRequests, CategoriaRequests (fetch + Bearer)
├── components/layout/Layout.tsx
├── components/RequireAuth.tsx, AuthShell.tsx
├── components/ui/        Button, Modal, ConfirmDialog, DataTable, Field, StatCard, PageHeader, SearchInput
├── hooks/useFetch.ts
├── lib/format.ts
├── pages/                Dashboard, Produtos, Clientes, Vendas, PLogin/, PWelcome/
├── services/api.ts       Axios, tratamento de erros (toasts) e serviços
└── types/index.ts
```

## Deploy: frontend na Vercel + backend no Render

1. **Backend no Render**: publique a API e anote a URL (ex.: `https://farmacia-backend.onrender.com`).
2. **CORS no backend**: libere a origem do seu site da Vercel (ex.: `https://farmacia-frontend.vercel.app`),
   com os métodos GET, POST, PUT, DELETE e OPTIONS e o header `Authorization` se usar JWT.
3. **Frontend na Vercel**: importe o repositório. A Vercel detecta Vite sozinha
   (Build Command `npm run build`, Output Directory `dist`).
4. **Variável de ambiente** na Vercel (Settings → Environment Variables):
   `VITE_API_URL` = URL do Render, com `https://` e sem barra no final.
5. **Redeploy** depois de criar ou alterar a variável: o Vite grava `VITE_*` no build, então só o novo deploy enxerga o valor novo.

O arquivo `vercel.json` já faz o redirecionamento das rotas (`/produtos`, `/vendas`...) para o `index.html`,
evitando erro 404 ao recarregar a página.

No plano gratuito do Render a API "dorme" por inatividade; a primeira requisição pode levar cerca de 1 minuto.
O timeout do Axios já está em 60 s para isso.

## Autenticação

- `/welcome` (`PWelcome`): tela de boas-vindas com login. Tenta `POST ${API_URL}/auth/login` e, se a rota não existir (404/405) ou a chamada falhar, `POST ${API_URL}/login`.
- `/login` (`PLogin`): login (`POST ${API_URL}/login`) e cadastro (`POST ${API_URL}/usuario`).
- O token é guardado no `localStorage` (chave `token`, ver `TOKEN_KEY` em `src/config/api.ts`) e enviado como `Authorization: Bearer <token>` pelo Axios (`src/services/api.ts`) e pelos módulos de `src/fetch/`.
- As demais rotas ficam atrás de `RequireAuth`: sem token, redireciona para `/welcome`. Resposta 401 da API limpa o token e volta para `/welcome`.
- Campos enviados: login `{ email, senha }`; cadastro `{ nome, email, senha }`. Se o backend usar outros nomes, ajuste em `PLogin.tsx` e `PWelcome.tsx`.
