import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

const { action } = await import('./afp-etteroppgjor')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/afp-etteroppgjor',
  }) as Parameters<typeof action>[0]

describe('afp-etteroppgjor action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST starter AFP etteroppgjør og redirecter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 99 }))

    const formData = new FormData()
    formData.set('kjorear', '2025')

    const request = new Request('http://localhost/afp-etteroppgjor', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/afpoffentlig/etteroppgjor/behandling/start')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ kjorear: 2025 })
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/99')
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

    const formData = new FormData()
    formData.set('kjorear', '2025')

    const request = new Request('http://localhost/afp-etteroppgjor', { method: 'POST', body: formData })

    await expect(action(actionArgs(request))).rejects.toBeDefined()
  })
})
