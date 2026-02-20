import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

const { action } = await import('./bpen091')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const actionArgs = (request: Request) =>
  ({ request, params: {}, context: {}, unstable_pattern: '/bpen091' }) as Parameters<typeof action>[0]

describe('bpen091 action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('POST opprettBpen091 sender riktig body og returnerer redirect', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 456 }))

    const formData = new FormData()
    formData.set('behandlingsAr', '2025')
    formData.set('begrensUtplukk', 'false')
    formData.set('dryRun', 'true')

    const request = new Request('http://localhost/bpen091', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/uforetrygd/fastsettforventetinntekt/batch')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
    expect(init.signal).toBeInstanceOf(AbortSignal)

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      beregningsAr: 2025,
      begrensUtplukk: false,
      dryRun: true,
    })

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/456')
  })

  it('backend 500 kaster NormalizedError', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 500, error: 'Internal Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const formData = new FormData()
    formData.set('behandlingsAr', '2025')
    formData.set('begrensUtplukk', 'false')
    formData.set('dryRun', 'true')

    const request = new Request('http://localhost/bpen091', { method: 'POST', body: formData })

    try {
      await action(actionArgs(request))
      expect.unreachable('Skulle ha kastet feil')
    } catch (err: unknown) {
      const e = err as { data: { status: number; title: string }; init: { status: number } }
      expect(e.data.status).toBe(500)
      expect(e.init.status).toBe(500)
    }
  })

  it('kaster feil ved tomt svar fra backend (manglende behandlingId)', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }))

    const formData = new FormData()
    formData.set('behandlingsAr', '2025')
    formData.set('begrensUtplukk', 'false')
    formData.set('dryRun', 'true')

    const request = new Request('http://localhost/bpen091', { method: 'POST', body: formData })

    await expect(action(actionArgs(request))).rejects.toThrow('Missing behandlingId')
  })
})
