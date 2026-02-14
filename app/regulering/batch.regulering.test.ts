import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

vi.mock('~/services/logger.server', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

const { loader } = await import('./batch.regulering')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const loaderArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/batch/regulering',
  }) as Parameters<typeof loader>[0]

describe('batch.regulering loader', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('henter regulering detaljer og returnerer data', async () => {
    const mockDetaljer = { steg: 'UTTREKK', orkestreringsStatistikk: [] }
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockDetaljer))

    const request = new Request('http://localhost/batch/regulering/uttrekk')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toContain('/api/vedtak/regulering/detaljer')
    expect(init.headers.Authorization).toBe('Bearer test-token')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result).toEqual({ regulering: mockDetaljer })
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ message: 'error' }, 500))

    const request = new Request('http://localhost/batch/regulering/uttrekk')
    await expect(loader(loaderArgs(request))).rejects.toBeDefined()
  })
})
