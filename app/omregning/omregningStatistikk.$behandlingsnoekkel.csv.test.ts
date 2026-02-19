import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { loader } = await import('./omregningStatistikk.$behandlingsnoekkel.csv')

function textResponse(text: string, status = 200) {
  return new Response(text, { status })
}

const loaderArgs = (request: Request, behandlingsnoekkel: string) =>
  ({
    request,
    params: { behandlingsnoekkel },
    context: {},
    unstable_pattern: '/omregningStatistikk/:behandlingsnoekkel.csv',
  }) as Parameters<typeof loader>[0]

describe('omregningStatistikk.csv', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loader returnerer CSV med riktige headers', async () => {
    const mockCsv = 'id;status\n1;OK'
    fetchSpy.mockResolvedValueOnce(textResponse(mockCsv))

    const request = new Request('http://localhost/omregningStatistikk/KEY-1.csv')
    const result = await loader(loaderArgs(request, 'KEY-1'))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/omregning/statistikk/csv?behandlingsnoekkel=KEY-1')
    expect(init.method).toBe('GET')

    expect(result).toBeInstanceOf(Response)
    expect(result.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(result.headers.get('Content-Disposition')).toBe('attachment; filename="omregningStatistikk-KEY-1.csv"')

    const body = await result.text()
    expect(body).toBe(mockCsv)
  })

  it('loader kaster 404 når CSV ikke finnes', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Not found', { status: 404 }))

    const request = new Request('http://localhost/omregningStatistikk/KEY-1.csv')

    await expect(loader(loaderArgs(request, 'KEY-1'))).rejects.toMatchObject({
      data: { status: 404 },
      init: { status: 404 },
    })
  })
})
