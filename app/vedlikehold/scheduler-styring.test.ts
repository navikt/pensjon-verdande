import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

const { action } = await import('./scheduler-styring')

const actionArgs = (request: Request) =>
  ({
    request,
    params: {},
    context: {},
    unstable_pattern: '/scheduler-styring',
  }) as Parameters<typeof action>[0]

function jsonRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/scheduler-styring', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('scheduler-styring action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('setGlobal kaller riktig endepunkt med PUT', async () => {
    // PUT for setGlobal
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))
    // GET for reload: global, typeStyringer, audit
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ erAktiv: true, endretAv: null, endretDato: null })))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))

    const request = jsonRequest({ operation: 'setGlobal', enabled: false })
    await action(actionArgs(request))

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/styring/global')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ enabled: false })
  })

  it('setType kaller riktig endepunkt med behandlingCode', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ erAktiv: true, endretAv: null, endretDato: null })))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))

    const request = jsonRequest({ operation: 'setType', behandlingCode: 'PersonAjourholdBehandling', enabled: false })
    await action(actionArgs(request))

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/styring/PersonAjourholdBehandling/enabled')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ enabled: false })
  })

  it('setMaksSamtidige kaller riktig endepunkt', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ erAktiv: true, endretAv: null, endretDato: null })))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))

    const request = jsonRequest({
      operation: 'setMaksSamtidige',
      behandlingCode: 'DagligAvstemmingBehandling',
      maksSamtidige: 5,
    })
    await action(actionArgs(request))

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/styring/DagligAvstemmingBehandling/maks-samtidige')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ maksSamtidige: 5 })
  })

  it('resetAlleTyper kaller DELETE /api/behandling/styring/typer', async () => {
    // DELETE for reset
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }))
    // GET for reload: global, typeStyringer, audit
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ erAktiv: true, endretAv: null, endretDato: null })))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify([])))

    const request = jsonRequest({ operation: 'resetAlleTyper' })
    await action(actionArgs(request))

    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/behandling/styring/typer')
    expect(init.method).toBe('DELETE')
  })

  it('ukjent operasjon returnerer feilmelding', async () => {
    const request = jsonRequest({ operation: 'ukjent' })
    const result = await action(actionArgs(request))

    expect(result).toEqual({ error: 'Ukjent operasjon: ukjent' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returnerer feilmelding ved API-feil', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 500, title: 'Intern feil', message: 'Noe gikk galt i backend' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const request = jsonRequest({ operation: 'setGlobal', enabled: true })
    const result = await action(actionArgs(request))

    expect(result).toHaveProperty('error')
    expect(typeof (result as { error: string }).error).toBe('string')
  })
})
