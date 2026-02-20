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

const { action } = await import('./konsistensavstemming')

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
    unstable_pattern: '/konsistensavstemming',
  }) as Parameters<typeof action>[0]

describe('konsistensavstemming action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST oppretter konsistensavstemming med alle felter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingIder: [10] }))

    const formData = new FormData()
    formData.set('PENAFP', 'true')
    formData.set('PENAFPP', 'true')
    formData.set('PENAP', 'false')
    formData.set('PENBP', 'true')
    formData.set('PENFP', 'false')
    formData.set('PENGJ', 'true')
    formData.set('PENGY', 'false')
    formData.set('PENKP', 'true')
    formData.set('UFOREUT', 'false')
    formData.set('avstemmingsdato', '2025-06')

    const request = new Request('http://localhost/konsistensavstemming', { method: 'POST', body: formData })
    await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/vedtak/avstemming/konsistens/start')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      penAfp: true,
      penAfpp: true,
      penPenap: false,
      penPenbp: true,
      penPenfp: false,
      penPengj: true,
      penPengy: false,
      penPenkp: true,
      penUforeut: false,
      avstemmingsdato: '2025-06',
    })
  })
})
