import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { action } = await import('./bpen090')

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const actionArgs = (request: Request) =>
  ({ request, params: {}, context: {}, unstable_pattern: '/bpen090' }) as Parameters<typeof action>[0]

describe('bpen090 action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST opprettBpen090 sender riktig body og returnerer redirect', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 123 }))

    const formData = new FormData()
    formData.set('kjoremaaned', '202506')
    formData.set('begrensUtplukk', 'false')
    formData.set('dryRun', 'true')
    formData.set('prioritet', '2')

    const request = new Request('http://localhost/bpen090', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/uforetrygd/lopendeinntektsavkorting/batch')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
    expect(init.signal).toBeInstanceOf(AbortSignal)

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      kjoremaaned: 202506,
      begrensUtplukk: false,
      dryRun: true,
      prioritet: 2,
    })

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/123')
  })

  it('validering feiler med ugyldig kjøremåned', async () => {
    const formData = new FormData()
    formData.set('kjoremaaned', '202513')
    formData.set('prioritet', '2')

    const request = new Request('http://localhost/bpen090', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result).toMatchObject({ kjoremaaned: expect.any(String) })
  })

  it('backend 500 kaster NormalizedError', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 500, error: 'Internal Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const formData = new FormData()
    formData.set('kjoremaaned', '202506')
    formData.set('begrensUtplukk', 'false')
    formData.set('dryRun', 'true')
    formData.set('prioritet', '2')

    const request = new Request('http://localhost/bpen090', { method: 'POST', body: formData })

    try {
      await action(actionArgs(request))
      expect.unreachable('Skulle ha kastet feil')
    } catch (err: unknown) {
      const e = err as { data: { status: number; title: string }; init: { status: number } }
      expect(e.data.status).toBe(500)
      expect(e.init.status).toBe(500)
    }
  })
})
