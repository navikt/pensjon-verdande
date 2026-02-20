import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

const { action } = await import('./opptjening.manedlig.omregning.opprett')

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
    unstable_pattern: '/opptjening/manedlig/omregning/opprett',
  }) as Parameters<typeof action>[0]

describe('opptjening.manedlig.omregning.opprett action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST oppretter månedlig omregning og redirecter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 500 }))

    const formData = new FormData()
    formData.set('behandlingsmaned', '202506')
    formData.set('kjoeretidspunkt', '2025-06-15T08:00:00')
    formData.set('avsjekkForKjoring', 'true')

    const request = new Request('http://localhost/opptjening/manedlig/omregning/opprett', {
      method: 'POST',
      body: formData,
    })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/opptjening/mandeliguttrekk/opprett')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
    expect(init.signal).toBeInstanceOf(AbortSignal)

    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      behandlingsmaned: 202506,
      kjoeretidspunkt: '2025-06-15T08:00:00',
      avsjekkForKjoring: true,
    })

    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/500')
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response('Noe gikk galt', {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    const formData = new FormData()
    formData.set('behandlingsmaned', '202506')
    formData.set('kjoeretidspunkt', '2025-06-15T08:00:00')
    formData.set('avsjekkForKjoring', 'false')

    const request = new Request('http://localhost/opptjening/manedlig/omregning/opprett', {
      method: 'POST',
      body: formData,
    })

    try {
      await action(actionArgs(request))
      expect.unreachable('Skulle ha kastet feil')
    } catch {
      // Forventet feil
    }
  })
})
