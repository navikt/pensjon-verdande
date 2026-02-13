import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { loader } = await import('./omregning._index')

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
    unstable_pattern: '/omregning',
  }) as Parameters<typeof loader>[0]

describe('omregning._index loader', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('henter omregning init og input', async () => {
    const mockInit = { behandlingsnokler: ['A', 'B'] }
    const mockInput = { content: [{ sakId: 1 }], totalElements: 1 }

    // Fetch 1: hentOmregningInit, Fetch 2: hentOmregningInput
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockInit))
    fetchSpy.mockResolvedValueOnce(jsonResponse(mockInput))

    const request = new Request('http://localhost/omregning?page=2&size=20')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).toHaveBeenCalledTimes(2)

    const [initUrl, initInit] = fetchSpy.mock.calls[0]
    expect(initUrl).toBe('http://pen-test/api/behandling/omregning/init')
    expect(initInit.method).toBe('GET')
    expect(initInit.signal).toBeInstanceOf(AbortSignal)
    const [inputUrl, inputInit] = fetchSpy.mock.calls[1]
    expect(inputUrl).toBe('http://pen-test/api/behandling/omregning/input?page=2&size=20')
    expect(inputInit.method).toBe('GET')
    expect(inputInit.signal).toBeInstanceOf(AbortSignal)
    expect(result.omregningInit).toEqual(mockInit)
    expect(result.omregningSakerPage).toEqual(mockInput)
  })
})
