import { data } from 'react-router'
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

export async function apiGet<T>(path: string, ctx: RequestCtx): Promise<T> {
    const url = `${env.penUrl}${path}`
    const { signal, cancel } = withTimeout(15_000)
    try {
        const res = await fetch(url, { headers: buildHeaders(ctx), signal })
        if (!res.ok) {
            await normalizeAndThrow(res, `Feil ved GET ${path}`)
        }
        return (await res.json()) as T
    } finally {
        cancel()
    }
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

export async function normalizeAndThrow(
    response: Response,
    fallbackTitle = 'En uventet feil oppstod',
): Promise<never> {
    const ct = response.headers.get('content-type') || ''

    let body: unknown = undefined
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

function normalizeErrorBody(
    response: Response,
    body: unknown,
    fallbackTitle: string,
): NormalizedError {
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
        const status =
            (typeof b.status === 'number' ? b.status : undefined) ??
            response.status
        const title =
            (typeof b.error === 'string' ? b.error : undefined) ||
            response.statusText ||
            fallbackTitle

        return {
            status,
            title,
            message: typeof b.message === 'string' ? b.message : undefined,
            detail: typeof b.detail === 'string' ? b.detail : undefined,
            path: typeof b.path === 'string' ? b.path : undefined,
            timestamp:
                typeof b.timestamp === 'string' ? b.timestamp : undefined,
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
