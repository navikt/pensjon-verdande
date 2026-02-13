import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { loader, action } = await import('./omregningStatistikk._index')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function textResponse(text: string, status = 200) {
  return new Response(text, { status })
}

const loaderArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/omregningStatistikk',
  }) as Parameters<typeof loader>[0]

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/omregningStatistikk',
  }) as Parameters<typeof action>[0]

describe('omregningStatistikk._index', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loader henter statistikk, csv og behandlingsnøkler', async () => {
    const mockStatistikk = { content: [{ id: 1 }], totalElements: 1 }
    const mockCsv = 'id;status\n1;OK'
    const mockNoekler = { behandlingsnoekler: ['KEY-1', 'KEY-2'] }

    // Fetch 1: hentOmregningStatistikk (POST)
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockStatistikk))
    // Fetch 2: hentOmregningStatistikkCsv (GET, text)
    fetchSpy.mockResolvedValueOnce(textResponse(mockCsv))
    // Fetch 3: hentOmregningbehandlingsnokler (GET)
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockNoekler))

    const request = new Request('http://localhost/omregningStatistikk?behandlingsnoekler=KEY-1&page=0&size=10')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).toHaveBeenCalledTimes(3)

    // hentOmregningStatistikk
    const [statUrl, statInit] = fetchSpy.mock.calls[0]
    expect(statUrl).toBe('http://pen-test/api/behandling/omregning/statistikk?behandlingsnoekkel=KEY-1&page=0&size=10')
    expect(statInit.method).toBe('POST')
    expect(statInit.signal).toBeInstanceOf(AbortSignal)
    // hentOmregningStatistikkCsv
    const [csvUrl, csvInit] = fetchSpy.mock.calls[1]
    expect(csvUrl).toBe('http://pen-test/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=KEY-1')
    expect(csvInit.method).toBe('GET')
    expect(csvInit.signal).toBeInstanceOf(AbortSignal)
    // hentOmregningbehandlingsnokler
    const [noeklerUrl, noeklerInit] = fetchSpy.mock.calls[2]
    expect(noeklerUrl).toBe('http://pen-test/api/behandling/omregning/statistikk/behandlingsnoekler')
    expect(noeklerInit.method).toBe('GET')
    expect(noeklerInit.signal).toBeInstanceOf(AbortSignal)
    expect(result.omregningStatistikkPage).toEqual(mockStatistikk)
    expect(result.omregningStatistikkCsv).toBe(mockCsv)
    expect(result.omregningStatistikkInit).toEqual(mockNoekler)
  })

  it('action henter statistikk med behandlingsnøkkel fra formdata', async () => {
    const mockStatistikk = { content: [{ id: 2 }], totalElements: 1 }
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockStatistikk))

    const formData = new FormData()
    formData.set('behandlingsnoekler', 'KEY-2')

    const request = new Request('http://localhost/omregningStatistikk?page=1&size=5', {
      method: 'POST',
      body: formData,
    })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/omregning/statistikk?behandlingsnoekkel=KEY-2&page=1&size=5')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result).toEqual({ omregningStatistikkPage: mockStatistikk })
  })
})
