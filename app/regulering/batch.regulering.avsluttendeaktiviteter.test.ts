import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

vi.mock('~/services/logger.server', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

const { action } = await import('./batch.regulering.avsluttendeaktiviteter')

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/batch/regulering/avsluttendeaktiviteter',
  }) as Parameters<typeof action>[0]

describe('batch.regulering.avsluttendeaktiviteter action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST avbryter behandlinger feilet mot POPP', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('', { status: 200 }))

    const request = new Request('http://localhost/batch/regulering/avsluttendeaktiviteter', {
      method: 'POST',
      body: JSON.stringify({ action: 'avbrytBehandlingerFeiletMotPOPP' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await action(actionArgs(request))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/vedtak/regulering/avbryt/oppdaterpopp')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer test-token')
    expect(result).toEqual({ success: true, action: 'avbrytBehandlingerFeiletMotPOPP' })
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

    const request = new Request('http://localhost/batch/regulering/avsluttendeaktiviteter', {
      method: 'POST',
      body: JSON.stringify({ action: 'avbrytBehandlingerFeiletMotPOPP' }),
      headers: { 'Content-Type': 'application/json' },
    })
    await expect(action(actionArgs(request))).rejects.toBeDefined()
  })
})
