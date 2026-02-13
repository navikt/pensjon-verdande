import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
}))

const { action } = await import('./omregning.omregning')

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
    unstable_pattern: '/omregning/omregning',
  }) as Parameters<typeof action>[0]

describe('omregning.omregning action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POST oppretter omregning og redirecter', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse({ behandlingId: 42 }))

    const formData = new FormData()
    formData.set('behandlingsnokkel', 'TEST-2025')
    formData.set('omregningstidspunkt', '2025-07-01')
    formData.set('omregneAFP', 'true')
    formData.set('behandleApneKrav', 'false')
    formData.set('brukFaktoromregning', 'false')
    formData.set('opprettAlleOppgaver', 'false')
    formData.set('sjekkYtelseFraAvtaleland', 'false')
    formData.set('kravGjelder', 'FORSTEG')
    formData.set('kravArsak', 'NYE_REGLER')
    formData.set('toleransegrenseSett', 'DEFAULT')
    formData.set('oppgaveSett', 'DEFAULT')
    formData.set('oppgavePrefiks', 'OMR')
    formData.set('skalSletteIverksettingsoppgaver', 'false')
    formData.set('skalBestilleBrev', 'JA')
    formData.set('skalSamordne', 'true')
    formData.set('skalDistribuereUforevedtak', 'false')
    formData.set('sendBrevBerorteSaker', 'false')
    formData.set('prioritet', 'NORMAL')

    const request = new Request('http://localhost/omregning/omregning', { method: 'POST', body: formData })
    const result = (await action(actionArgs(request))) as Response

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/omregning/opprett')
    expect(init.method).toBe('POST')
    const sentBody = JSON.parse(init.body)
    expect(sentBody.behandlingsnokkel).toBe('TEST-2025')
    expect(sentBody.omregneAFP).toBe(true)
    expect(sentBody.skalSamordne).toBe(true)
    expect(sentBody.brukFaktoromregning).toBe(false)
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/42')
  })

  it('backend 500 kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

    const formData = new FormData()
    formData.set('behandlingsnokkel', 'TEST')
    formData.set('omregningstidspunkt', '2025-07-01')

    const request = new Request('http://localhost/omregning/omregning', { method: 'POST', body: formData })
    await expect(action(actionArgs(request))).rejects.toBeDefined()
  })

  it('backend 204 uten body kaster feil', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }))

    const formData = new FormData()
    formData.set('behandlingsnokkel', 'TEST')
    formData.set('omregningstidspunkt', '2025-07-01')

    const request = new Request('http://localhost/omregning/omregning', { method: 'POST', body: formData })
    await expect(action(actionArgs(request))).rejects.toThrow(
      'Opprettelse av omregningsbehandling returnerte ingen respons',
    )
  })
})
