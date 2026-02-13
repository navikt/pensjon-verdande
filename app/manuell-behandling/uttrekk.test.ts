import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { loader } = await import('./uttrekk')

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
    unstable_pattern: '/manuell-behandling/uttrekk',
  }) as Parameters<typeof loader>[0]

describe('uttrekk loader', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('henter behandlinger med søkeparametere', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ content: [{ id: 1 }] }))

    const request = new Request('http://localhost/manuell-behandling/uttrekk?page=0&size=10')
    const result = await loader(loaderArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/manuell-behandling/behandlinger?page=0&size=10')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
  })
})
