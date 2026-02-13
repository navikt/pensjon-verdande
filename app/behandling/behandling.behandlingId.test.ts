import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test', aldeBehandlingUrlTemplate: '', psakSakUrlTemplate: '' },
  isAldeLinkEnabled: false,
}))

vi.mock('~/services/behandling.server', () => ({
  getBehandling: vi.fn().mockResolvedValue({ behandlingId: 123 }),
  getDetaljertFremdrift: vi.fn(),
  fjernFraDebug: vi.fn(),
  fortsettBehandling: vi.fn(),
  fortsettAvhengigeBehandlinger: vi.fn(),
  godkjennOpprettelse: vi.fn(),
  bekreftStoppBehandling: vi.fn(),
  patchBehandling: vi.fn(),
  runBehandling: vi.fn(),
  sendTilManuellMedKontrollpunkt: vi.fn(),
  stopp: vi.fn(),
  endrePlanlagtStartet: vi.fn(),
  taTilDebug: vi.fn(),
}))

const { action } = await import('./behandling.$behandlingId')

const actionArgs = (request: Request) =>
  ({
    request,
    params: { behandlingId: '123' },
    context: {},
    unstable_pattern: '/behandling/:behandlingId',
  }) as Parameters<typeof action>[0]

describe('behandling.$behandlingId action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sendTilOppdragPaNytt kaller riktig endepunkt', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))

    const formData = new FormData()
    formData.set('operation', 'sendTilOppdragPaNytt')

    const request = new Request('http://localhost/behandling/123', { method: 'POST', body: formData })
    await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/vedtak/iverksett/123/sendtiloppdragpanytt')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('ukjent operasjon returnerer feil', async () => {
    const formData = new FormData()
    formData.set('operation', 'ugyldig')

    const request = new Request('http://localhost/behandling/123', { method: 'POST', body: formData })
    const result = await action(actionArgs(request))

    expect(result).toEqual({ errors: { operation: expect.stringContaining('ugyldig') } })
  })
})
