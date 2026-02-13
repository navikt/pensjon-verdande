import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { action } = await import('./bestem-etteroppgjor-resultat._index')

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
    unstable_pattern: '/bestem-etteroppgjor-resultat',
  }) as Parameters<typeof action>[0]

describe('bestem-etteroppgjor-resultat action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST sender riktig body og returnerer redirect', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 321 }))

    const formData = new FormData()
    formData.set('etteroppgjorAr', '2024')
    formData.set('sakIds', '100,200,300')
    formData.set('oppdaterSisteGyldigeEtteroppgjørsÅr', 'checked')

    const request = new Request('http://localhost/bestem-etteroppgjor-resultat', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/uforetrygd/bestemetteroppgjor/start')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
    expect(init.signal).toBeInstanceOf(AbortSignal)

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      sakIds: [100, 200, 300],
      ar: 2024,
      oppdaterSisteGyldigeEtteroppgjørsÅr: true,
    })

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/321')
  })

  it('backend 500 returnerer feilmelding via try/catch', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 500, error: 'Internal Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const formData = new FormData()
    formData.set('etteroppgjorAr', '2024')
    formData.set('sakIds', '100')

    const request = new Request('http://localhost/bestem-etteroppgjor-resultat', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(result).toMatchObject({ success: false, error: expect.any(String) })
  })
})
