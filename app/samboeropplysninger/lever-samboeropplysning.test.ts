import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

vi.mock('~/services/behandling.server', () => ({
  getBehandlinger: vi.fn().mockResolvedValue({ content: [] }),
}))

const { action } = await import('./lever-samboeropplysning._index')

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
    unstable_pattern: '/lever-samboeropplysning',
  }) as Parameters<typeof action>[0]

describe('lever-samboeropplysning action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST starter vurder samboere batch', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 77 }))

    const formData = new FormData()
    formData.set('behandlingsAr', '2024')

    const request = new Request('http://localhost/lever-samboeropplysning', { method: 'POST', body: formData })
    await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/samboer/vurder-samboere/batch')
    expect(init.method).toBe('POST')
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({ beregningsAr: 2024 })
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

    const formData = new FormData()
    formData.set('behandlingsAr', '2024')

    const request = new Request('http://localhost/lever-samboeropplysning', { method: 'POST', body: formData })

    try {
      await action(actionArgs(request))
      expect.unreachable('Skulle ha kastet feil')
    } catch {
      // Forventet feil
    }
  })
})
