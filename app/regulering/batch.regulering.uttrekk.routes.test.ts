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

function okResponse(status = 200) {
  return new Response('', { status })
}

describe('uttrekk routes', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('startUttrekk', () => {
    it('POST starter uttrekk med satsDato', async () => {
      const { action } = await import('./batch.regulering.uttrekk.startUttrekk')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ satsDato: '2025-05-01' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/uttrekk/startUttrekk',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/uttrekk/start')
      expect(init.method).toBe('POST')
      const sentBody = JSON.parse(init.body)
      expect(sentBody.satsDato).toBe('2025-05-01')
      expect(sentBody.reguleringsDato).toBe('2025-05-01')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })

    it('backend 500 kaster feil', async () => {
      const { action } = await import('./batch.regulering.uttrekk.startUttrekk')
      fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ satsDato: '2025-05-01' }),
        headers: { 'Content-Type': 'application/json' },
      })
      await expect(
        action({
          request,
          params: {},
          context: {},
          unstable_pattern: '/batch/regulering/uttrekk/startUttrekk',
        } as Parameters<typeof action>[0]),
      ).rejects.toBeDefined()
    })
  })

  describe('oppdaterUttrekk', () => {
    it('POST oppdaterer uttrekk', async () => {
      const { action } = await import('./batch.regulering.uttrekk.oppdaterUttrekk')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/uttrekk/oppdaterUttrekk',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/uttrekk/oppdater')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })

    it('backend 500 kaster feil', async () => {
      const { action } = await import('./batch.regulering.uttrekk.oppdaterUttrekk')
      fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

      const request = new Request('http://localhost/x', { method: 'POST' })
      await expect(
        action({
          request,
          params: {},
          context: {},
          unstable_pattern: '/batch/regulering/uttrekk/oppdaterUttrekk',
        } as Parameters<typeof action>[0]),
      ).rejects.toBeDefined()
    })
  })
})
