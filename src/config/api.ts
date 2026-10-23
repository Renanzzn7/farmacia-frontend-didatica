// URL base da API, definida por variável de ambiente (Vite).
// Local: .env.local | Vercel: Settings > Environment Variables (VITE_API_URL).
// As barras finais são removidas para evitar URLs como https://api.onrender.com//produtos.
export const API_URL: string = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '')

if (!API_URL && import.meta.env.DEV) {
  console.warn('VITE_API_URL não está definida. Crie o arquivo .env.local (veja .env.example).')
}

export const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao servidor. Se a API está no Render (plano gratuito), ela pode estar acordando: aguarde cerca de 1 minuto e tente de novo.'

// ---------- token ----------
// Chave onde o token JWT é guardado no localStorage.
// AJUSTE se preferir outro nome (ex.: 'access_token').
export const TOKEN_KEY = 'token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)
export const saveToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY)
export const hasToken = (): boolean => !!getToken()

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

// ---------- respostas ----------
export async function errorMessageFrom(res: Response): Promise<string> {
  try {
    const body = await res.json()
    const msg = body?.message ?? body?.error
    if (typeof msg === 'string' && msg) return msg
  } catch {
    /* corpo vazio ou não-JSON */
  }
  return `Erro ${res.status}`
}

// Converte a resposta em JSON ou lança Error com a mensagem da API.
export async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await errorMessageFrom(res))
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

// Procura o token em formatos comuns: "abc", { token }, { accessToken }, { access_token }, { jwt }, { data: ... }.
export function extractToken(data: unknown): string | null {
  if (typeof data === 'string') return data.trim() || null
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    for (const k of ['token', 'accessToken', 'access_token', 'jwt']) {
      const v = o[k]
      if (typeof v === 'string' && v) return v
    }
    if (o.data) return extractToken(o.data)
  }
  return null
}

export async function readToken(res: Response): Promise<string | null> {
  const text = await res.text()
  try {
    return extractToken(JSON.parse(text))
  } catch {
    return extractToken(text)
  }
}
