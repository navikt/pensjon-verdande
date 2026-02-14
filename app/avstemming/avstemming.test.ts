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

const { action } = await import('./avstemming')

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
    unstable_pattern: '/avstemming',
  }) as Parameters<typeof action>[0]

describe('avstemming action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST oppretter avstemming med alle felter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingIder: [1, 2] }))

    const formData = new FormData()
    formData.set('PENAFP', 'true')
    formData.set('PENAFPP', 'false')
    formData.set('PENAP', 'true')
    formData.set('PENBP', 'false')
    formData.set('PENGJ', 'true')
    formData.set('PENGY', 'false')
    formData.set('PENKP', 'true')
    formData.set('PENUP', 'false')
    formData.set('UFOREUT', 'true')
    formData.set('fom', '2025-01-01')
    formData.set('tom', '2025-06-30')

    const request = new Request('http://localhost/avstemming', { method: 'POST', body: formData })
    await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/vedtak/avstemming/grensesnitt/start')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      penAfp: true,
      penAfpp: false,
      penPenap: true,
      penPenbp: false,
      penPengj: true,
      penPengy: false,
      penPenkp: true,
      penPenup: false,
      penUforeut: true,
      avstemmingsperiodeStart: '2025-01-01',
      avstemmingsperiodeEnd: '2025-06-30',
    })
  })
})
