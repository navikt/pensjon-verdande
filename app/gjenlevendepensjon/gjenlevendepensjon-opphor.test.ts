import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test' },
  isDevelopment: false,
}))

const { action } = await import('./gjenlevendepensjon-opphor')

function actionArgs(values: Record<string, string> = {}) {
  const formData = new FormData()
  for (const [key, value] of Object.entries({ dryRun: 'true', sakIdListe: '', ...values })) {
    formData.set(key, value)
  }
  const request = new Request('http://localhost/gjenlevendepensjon-opphor', { method: 'POST', body: formData })
  return { request, params: {}, context: {}, pattern: '/gjenlevendepensjon-opphor' } as Parameters<typeof action>[0]
}

describe('gjenlevendepensjon-opphor action', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each(['true', 'false'])('sender riktig request med dryRun=%s og videresender til behandlingen', async (dryRun) => {
    fetchSpy.mockResolvedValueOnce(Response.json({ behandlingId: 456 }))

    const result = await action(actionArgs({ dryRun, sakIdListe: '123, 456, ' }))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('http://pen-test/api/gjenlevendepensjon/utvidetrett/behandling/opphor/batch')
    expect(init.method).toBe('POST')
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(init.body)).toEqual({ sakIdListe: [123, 456], dryRun: dryRun === 'true' })
    expect(result).toBeInstanceOf(Response)
    expect(result.status).toBe(302)
    expect(result.headers.get('Location')).toBe('/behandling/456')
  })

  it('sender en tom saksliste når alle saker skal behandles', async () => {
    fetchSpy.mockResolvedValueOnce(Response.json({ behandlingId: 123 }))

    await action(actionArgs())

    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).sakIdListe).toEqual([])
  })

  it.each(['', 'invalid'])('avviser ugyldig dryRun: %s', async (dryRun) => {
    await expect(action(actionArgs({ dryRun }))).rejects.toMatchObject({ status: 400 })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it.each(['1.5', '9007199254740993'])('avviser sak-ID som ikke er et sikkert heltall: %s', async (sakIdListe) => {
    await expect(action(actionArgs({ sakIdListe }))).rejects.toMatchObject({ status: 400 })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('lar backend-feil gå videre uten å videresende', async () => {
    fetchSpy.mockResolvedValueOnce(Response.json({ status: 500, error: 'Internal Server Error' }, { status: 500 }))

    await expect(action(actionArgs())).rejects.toMatchObject({ init: { status: 500 } })
  })

  it('avviser svar uten behandlingId', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(action(actionArgs())).rejects.toThrow('mangler behandlingId')
  })
})
