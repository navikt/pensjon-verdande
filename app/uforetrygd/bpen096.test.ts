import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { action } = await import('./bpen096')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const actionArgs = (request: Request) =>
  ({ request, params: {}, context: {}, unstable_pattern: '/bpen096' }) as Parameters<typeof action>[0]

describe('bpen096 action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('HentSkattehendelser sender riktig body og returnerer redirect', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 789 }))

    const formData = new FormData()
    formData.set('action', 'HENT_SKATTEHENDELSER')
    formData.set('maksAntallSekvensnummer', '10000')
    formData.set('sekvensnummerPerBehandling', '100')
    formData.set('debug', 'false')

    const request = new Request('http://localhost/bpen096', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/uforetrygd/etteroppgjor/skattehendelser')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      maksAntallSekvensnummer: 10000,
      sekvensnummerPerBehandling: 100,
      debug: false,
    })

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/789')
  })

  it('HentSkattehendelserManuelt sender sekvensnr og returnerer behandlingIder', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingIder: [101, 102] }))

    const formData = new FormData()
    formData.set('action', 'HENT_SKATTEHENDELSER_MANUELT')
    formData.set('sekvensnr', '1,2,3')

    const request = new Request('http://localhost/bpen096', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/uforetrygd/etteroppgjor/skattehendelser/kjor-hendelser-manuelt')
    expect(init.method).toBe('POST')

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ sekvensnummer: [1, 2, 3] })

    expect(result).toEqual({ behandlingIder: [101, 102] })
  })

  it('HentSkattehendelserManuelt returnerer feil ved ugyldig sekvensnr', async () => {
    const formData = new FormData()
    formData.set('action', 'HENT_SKATTEHENDELSER_MANUELT')
    formData.set('sekvensnr', '1,abc,3')

    const request = new Request('http://localhost/bpen096', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result).toMatchObject({ action: 'HENT_SKATTEHENDELSER_MANUELT', error: 'Ugyldig sekvensnr' })
  })

  it('HentAntallSkattehendelser returnerer antall', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ antall: 42 }))

    const formData = new FormData()
    formData.set('action', 'HENT_ANTALL_SKATTEHENDELSER')

    const request = new Request('http://localhost/bpen096', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/uforetrygd/etteroppgjor/skattehendelser/antall')
    expect(init.method).toBe('GET')

    expect(result).toEqual({ antall: 42 })
  })
})
