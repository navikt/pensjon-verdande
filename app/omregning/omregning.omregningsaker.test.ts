import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

const { action } = await import('./omregning.omregningsaker')

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
    unstable_pattern: '/omregning/omregningsaker',
  }) as Parameters<typeof action>[0]

describe('omregning.omregningsaker action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('POST oppdaterer omregning input med saksnumre', async () => {
    const mockResponse = { saker: [100, 200, 300] }
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockResponse))

    const formData = new FormData()
    formData.set('saksnummerListe', '100\n200\n300\n')

    const request = new Request('http://localhost/omregning/omregningsaker', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/omregning/input')
    expect(init.method).toBe('POST')
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ saker: [100, 200, 300] })
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result).toEqual(mockResponse)
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

    const formData = new FormData()
    formData.set('saksnummerListe', '100')

    const request = new Request('http://localhost/omregning/omregningsaker', { method: 'POST', body: formData })
    await expect(action(actionArgs(request))).rejects.toBeDefined()
  })
})
