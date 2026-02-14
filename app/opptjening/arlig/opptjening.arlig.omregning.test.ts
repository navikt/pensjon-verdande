import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { loader, action } = await import('./opptjening.arlig.omregning')

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
    unstable_pattern: '/opptjening/arlig/omregning',
  }) as Parameters<typeof loader>[0]

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/opptjening/arlig/omregning',
  }) as Parameters<typeof action>[0]

describe('opptjening.arlig.omregning loader', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('henter ekskluderte saker', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ ekskluderteSaker: [{ sakId: '123', kommentar: 'test' }] }))

    const request = new Request('http://localhost/opptjening/arlig/omregning')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/opptjening/eksludertesaker')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result.ekskluderteSaker).toEqual([{ sakId: '123', kommentar: 'test' }])
  })
})

describe('opptjening.arlig.omregning action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('kjoerUttrekk oppretter uttrekk og redirecter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 100 }))

    const formData = new FormData()
    formData.set('action', 'KJOER_UTTREKK')

    const request = new Request('http://localhost/opptjening/arlig/omregning', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/opptjening/arliguttrekk/opprett')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result.status).toBe(302)
  })

  it('kjoerOmregning sender opptjeningsar og bolkstorrelse', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 200, bolkstorrelse: 5000 }))

    const formData = new FormData()
    formData.set('action', 'KJOER_OMREGNING')
    formData.set('opptjeningsar', '2025')
    formData.set('bolkstorrelse', '5000')

    const request = new Request('http://localhost/opptjening/arlig/omregning', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/opptjening/arligendring/opprett')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ opptjeningsar: 2025, bolkstorrelse: 5000 })
    expect(result.status).toBe(302)
  })

  it('ekskluderSaker sender sakIder og kommentar', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))

    const formData = new FormData()
    formData.set('action', 'EKSKLUDER_SAKER')
    formData.set('ekskluderteSakIderText', '100\n200\n300')
    formData.set('kommentar', 'Testkommentar')

    const request = new Request('http://localhost/opptjening/arlig/omregning', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/opptjening/eksludertesaker/leggTil')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ sakIder: ['100', '200', '300'], kommentar: 'Testkommentar' })
    expect(result.status).toBe(302)
  })

  it('oppdaterSisteGyldigeOpptjeningsaar returnerer melding', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))

    const formData = new FormData()
    formData.set('action', 'OPPDATER_SISTE_GYLDIGE_OPPTJENINGSAAR')
    formData.set('oppdaterOpptjeningsaar', '2025')

    const request = new Request('http://localhost/opptjening/arlig/omregning', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/opptjening/opptjeningsaar/oppdater?opptjeningsar=2025')

    const parsed = JSON.parse(result as string)
    expect(parsed.melding).toContain('2025')
    expect(parsed.action).toBe('OPPDATER_SISTE_GYLDIGE_OPPTJENINGSAAR')
  })

  it('oppdaterSisteOmsorgGodskrivingsaar returnerer melding', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))

    const formData = new FormData()
    formData.set('action', 'OPPDATER_GODSKRIVINGSAAR')
    formData.set('oppdaterOmsorgGodskrivingsaar', '2024')

    const request = new Request('http://localhost/opptjening/arlig/omregning', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url] = fetchSpy.mock.calls[0]
    expect(url).toContain('/api/opptjening/omsorggodskrivingsaar/oppdater?godskrivingsaar=2024')

    const parsed = JSON.parse(result as string)
    expect(parsed.melding).toContain('2024')
    expect(parsed.action).toBe('OPPDATER_GODSKRIVINGSAAR')
  })
})
