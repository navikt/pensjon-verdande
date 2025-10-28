import { data } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { env } from './env.server'

export type RequestCtx = {
  accessToken: string
}

export function buildHeaders(ctx: RequestCtx): HeadersInit {
  return {
    Authorization: `Bearer ${ctx.accessToken}`,
    Accept: 'application/json',
  }
}

export function withTimeout(ms: number) {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), ms)
  return { signal: ac.signal, cancel: () => clearTimeout(t) }
}

async function resolveCtx(requestCtx: RequestCtx | Request): Promise<RequestCtx> {
  if (typeof requestCtx === 'object' && requestCtx !== null && 'accessToken' in requestCtx) {
    const token = (requestCtx as { accessToken?: unknown }).accessToken
    if (typeof token === 'string') {
      return { accessToken: token }
    }
  }
  return { accessToken: await requireAccessToken(requestCtx as Request) }
}

async function apiFetch<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  requestCtx: RequestCtx | Request,
  parse: (res: Response) => Promise<T>,
  opts?: { allow404AsUndefined?: boolean },
): Promise<T | undefined> {
  const ctx = await resolveCtx(requestCtx)
  const url = `${env.penUrl}${path}`
  const { signal, cancel } = withTimeout(15_000)
  try {
    const res = await fetch(url, { headers: buildHeaders(ctx), signal })

    if (opts?.allow404AsUndefined && res.status === 404) {
      return undefined
    }

    if (!res.ok) {
      await normalizeAndThrow(res, `Feil ved ${method} ${path}`)
    }

    return await parse(res)
  } catch (err) {
    const code = getNodeErrorCode(err)
    if (code === 'ECONNREFUSED') {
      await normalizeAndThrowNetworkError('ECONNREFUSED', method, path)
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      await normalizeAndThrowNetworkError('ETIMEDOUT', method, path)
    }
    throw err
  } finally {
    cancel()
  }
}

export async function apiGet<T>(path: string, requestCtx: RequestCtx | Request): Promise<T> {
  const result = await apiFetch<T>('GET', path, requestCtx, async (res) => (await res.json()) as T)
  // apiFetch never returns undefined here since allow404AsUndefined is not used
  return result as T
}

export async function apiGetOrUndefined<T>(path: string, requestCtx: RequestCtx | Request): Promise<T | undefined> {
  return apiFetch<T>('GET', path, requestCtx, async (res) => (await res.json()) as T, { allow404AsUndefined: true })
}

export async function apiGetRawStringOrUndefined(
  path: string,
  requestCtx: RequestCtx | Request,
): Promise<string | undefined> {
  return apiFetch<string>('GET', path, requestCtx, (res) => res.text(), { allow404AsUndefined: true })
}

export type NormalizedError = {
  status: number
  title?: string // f.eks. "Not Found"
  message?: string // kort forklaring
  detail?: string // lang tekst/body
  path?: string
  timestamp?: string
  trace?: string // vis kun i dev
  raw?: unknown // original body (for logging)
}

function getNodeErrorCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null) {
    const obj = err as { code?: unknown; cause?: { code?: unknown } }
    if (typeof obj.code === 'string') return obj.code
    if (obj.cause && typeof obj.cause.code === 'string') return obj.cause.code
  }
  return undefined
}

async function normalizeAndThrowNetworkError(code: string | undefined, method: string, path: string): Promise<never> {
  const isTimeout = code === 'ETIMEDOUT' || code === 'ABORT_ERR'
  const status = code === 'ECONNREFUSED' ? 503 : isTimeout ? 504 : 502
  const title =
    code === 'ECONNREFUSED'
      ? 'Tjenesten er utilgjengelig'
      : isTimeout
        ? 'Tidsavbrudd mot tjenesten'
        : 'Nettverksfeil mot tjenesten'

  const normalized: NormalizedError = {
    status,
    title,
    message: `${method} ${path} feilet (${code ?? 'nettverksfeil'}).`,
    detail:
      code === 'ECONNREFUSED'
        ? 'Klarte ikke å opprette forbindelse (ECONNREFUSED). Tjenesten kan være nede eller utilgjengelig.'
        : isTimeout
          ? 'Forespørselen ble avbrutt pga. tidsavbrudd.'
          : undefined,
    path,
    timestamp: new Date().toISOString(),
  }

  throw data(normalized, { status: normalized.status, statusText: normalized.title })
}

export async function normalizeAndThrow(response: Response, fallbackTitle = 'En uventet feil oppstod'): Promise<never> {
  const ct = response.headers.get('content-type') || ''

  let body: unknown
  try {
    if (ct.includes('application/json')) {
      body = await response.json()
    } else {
      const text = await response.text()
      body = text?.length ? text : undefined
    }
  } catch {
    /* ignorer parse-feil */
  }

  const normalized = normalizeErrorBody(response, body, fallbackTitle)

  throw data(normalized, {
    status: normalized.status,
    statusText: normalized.title,
  })
}

function normalizeErrorBody(response: Response, body: unknown, fallbackTitle: string): NormalizedError {
  // Ren tekst → putt som detail
  if (typeof body === 'string') {
    return {
      status: response.status,
      title: response.statusText || fallbackTitle,
      detail: body,
      raw: body,
    }
  }

  // Spring Boot standard error-body
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>
    const status = (typeof b.status === 'number' ? b.status : undefined) ?? response.status
    const title = (typeof b.error === 'string' ? b.error : undefined) || response.statusText || fallbackTitle

    return {
      status,
      title,
      message: typeof b.message === 'string' ? b.message : undefined,
      detail: typeof b.detail === 'string' ? b.detail : undefined,
      path: typeof b.path === 'string' ? b.path : undefined,
      timestamp: typeof b.timestamp === 'string' ? b.timestamp : undefined,
      trace: typeof b.trace === 'string' ? b.trace : undefined,
      raw: body,
    }
  }

  // Fallback
  return {
    status: response.status,
    title: response.statusText || fallbackTitle,
    raw: body,
  }
}
