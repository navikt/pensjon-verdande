import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
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

// I React Router 8 er `request.url` den rå, inngående URL-en (kan ha et internt `.data`-suffiks for
// client-side data-requests), mens loader-argumentenes `url` alltid er normalisert av rammeverket.
// Vi simulerer den normaliseringen her slik at testene faktisk reflekterer runtime-oppførselen.
const loaderArgs = (request: Request) => {
  const url = new URL(request.url)
  url.pathname = url.pathname.replace(/\.data$/, '')

  return {
    request,
    params: {},
    context: {},
    pattern: '/batch/regulering',
    url,
  } as Parameters<typeof loader>[0]
}

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

  it('redirecter til riktig steg når normalisert url peker til rot-ruten, selv om request.url har .data-suffiks', async () => {
    const mockDetaljer = { steg: 3, orkestreringsStatistikk: [] }
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockDetaljer))

    // Simulerer en client-side data-request, der React Router legger til .data på request.url.
    const request = new Request('http://localhost/batch/regulering.data')
    const result = await loader(loaderArgs(request))

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(302)
    expect((result as Response).headers.get('Location')).toBe('/batch/regulering/orkestrering')
  })
})
