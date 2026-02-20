import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

vi.mock('~/services/behandling.server', () => ({
  getBehandlinger: vi.fn().mockResolvedValue({ content: [] }),
}))

const { action } = await import('./adhoc-brev')

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
    unstable_pattern: '/adhoc-brev',
  }) as Parameters<typeof action>[0]

describe('adhoc-brev action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST oppretter adhoc-brev og redirecter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 42 }))

    const formData = new FormData()
    formData.set('brevmal', 'PE_BA_TESTBREV')
    formData.set('ekskluderAvdoed', 'true')

    const request = new Request('http://localhost/adhoc-brev', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/brev/adhoc/start')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ brevmal: 'PE_BA_TESTBREV', ekskluderAvdoed: true })
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/42')
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

    const formData = new FormData()
    formData.set('brevmal', 'PE_BA_TESTBREV')
    formData.set('ekskluderAvdoed', 'false')

    const request = new Request('http://localhost/adhoc-brev', { method: 'POST', body: formData })

    await expect(action(actionArgs(request))).rejects.toBeDefined()
  })
})
