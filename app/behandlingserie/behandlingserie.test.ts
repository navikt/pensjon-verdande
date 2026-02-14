import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { loader, action } = await import('./behandlingserie')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const loaderArgs = (request: Request) =>
  ({ request, params: {}, context: {}, unstable_pattern: '/behandlingserie' }) as Parameters<typeof loader>[0]
const actionArgs = (request: Request) =>
  ({ request, params: {}, context: {}, unstable_pattern: '/behandlingserie' }) as Parameters<typeof action>[0]

describe('behandlingserie loader', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('GET med behandlingType returnerer BehandlingSerieDTO[]', async () => {
    const serier = [{ behandlingSerieId: '1', behandlingCode: 'AvsluttSaker', behandlinger: [] }]
    fetchSpy.mockResolvedValueOnce(jsonResponse(serier))

    const request = new Request('http://localhost/behandlingserie?behandlingType=AvsluttSaker')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/serier?behandlingCode=AvsluttSaker')
    expect(init.method).toBe('GET')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result).toEqual({ behandlingSerier: serier })
  })

  it('GET med tom behandlingType returnerer tom liste uten fetch', async () => {
    const request = new Request('http://localhost/behandlingserie')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result).toEqual({ behandlingSerier: [] })
  })
})

describe('behandlingserie action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('POST opprettBehandlingSerie sender riktig body og returnerer redirect', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse('serie-123'))

    const formData = new FormData()
    formData.set('behandlingCode', 'AvsluttSaker')
    formData.set('regelmessighet', 'range')
    formData.set('valgteDatoer', JSON.stringify(['2026-03-01', '2026-03-15']))
    formData.set('startTid', '10:00')
    formData.set('opprettetAv', 'VERDANDE')

    const request = new Request('http://localhost/behandlingserie', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/serier')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      behandlingCode: 'AvsluttSaker',
      planlagteKjoringer: ['2026-03-01T10:00:00', '2026-03-15T10:00:00'],
      regelmessighet: 'RANGE',
      opprettetAv: 'VERDANDE',
    })

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandlingserie?behandlingType=AvsluttSaker')
  })

  it('PUT updatePlanlagtStartet sender riktig URL og returnerer redirect', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }))

    const formData = new FormData()
    formData.set('_intent', 'updatePlanlagtStartet')
    formData.set('behandlingId', '42')
    formData.set('behandlingCode', 'DagligAvstemming')
    formData.set('ymd', '2026-04-01')
    formData.set('time', '14:30')

    const request = new Request('http://localhost/behandlingserie', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toContain('/api/behandling/serier/42/endrePlanlagtStartet')
    expect(url).toContain('planlagtStartet=2026-04-01T14%3A30%3A00')
    expect(url).toContain('fjernFraSerie=false')
    expect(init.method).toBe('PUT')
    expect(init.signal).toBeInstanceOf(AbortSignal)

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandlingserie?behandlingType=DagligAvstemming')
  })

  it('backend 500 kaster feil med NormalizedError', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 500, error: 'Internal Server Error', message: 'Noe gikk galt' }), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const request = new Request('http://localhost/behandlingserie?behandlingType=AvsluttSaker')

    try {
      await loader(loaderArgs(request))
      expect.unreachable('Skulle ha kastet feil')
    } catch (err: unknown) {
      const e = err as { data: { status: number; title: string }; init: { status: number } }
      expect(e.data.status).toBe(500)
      expect(e.init.status).toBe(500)
    }
  })
})
