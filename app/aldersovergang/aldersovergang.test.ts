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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('aldersovergang._index loader', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('henter mulige aldersoverganger', { timeout: 15_000 }, async () => {
    const { loader } = await import('./aldersovergang._index')

    fetchSpy.mockResolvedValueOnce(
      jsonResponse({
        maneder: ['2025-06', '2025-07'],
        erBegrensUtplukkLovlig: true,
        kanOverstyreBehandlingsmaned: false,
      }),
    )

    const request = new Request('http://localhost/aldersovergang')
    const loaderArgs = {
      request,
      params: {},
      context: {},
      unstable_pattern: '/aldersovergang',
    } as Parameters<typeof loader>[0]

    const result = await loader(loaderArgs)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/aldersovergang/muligeAldersoverganger')
    expect(init.method).toBe('GET')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result.maneder).toEqual(['2025-06', '2025-07'])
    expect(result.erBegrensUtplukkLovlig).toBe(true)
  })
})

describe('aldersovergang.opprett action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST oppretter aldersovergang og redirecter', async () => {
    const { action } = await import('./aldersovergang.opprett')

    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 300 }))

    const formData = new FormData()
    formData.set('behandlingsmaned', '202507')
    formData.set('kjoeretidspunkt', '2025-07-01T08:00:00')
    formData.set('begrensetUtplukk', 'true')

    const request = new Request('http://localhost/aldersovergang/opprett', { method: 'POST', body: formData })
    const actionArgs = {
      request,
      params: {},
      context: {},
      unstable_pattern: '/aldersovergang/opprett',
    } as Parameters<typeof action>[0]

    const result = (await action(actionArgs)) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/aldersovergang/utplukk')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    const sentBody = JSON.parse(init.body)
    expect(sentBody).toEqual({
      behandlingsmaned: 202507,
      kjoeretidspunkt: '2025-07-01T08:00:00',
      begrensetUtplukk: true,
    })
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/300')
  })
})
