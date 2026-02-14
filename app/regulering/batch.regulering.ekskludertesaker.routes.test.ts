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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('ekskludertesaker routes', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('hent', () => {
    it('loader henter ekskluderte saker', async () => {
      const { loader } = await import('./batch.regulering.ekskludertesaker.hent')
      const mockData = { ekskluderinger: [{ sakId: 100, kommentar: 'test' }] }
      fetchSpy.mockResolvedValueOnce(jsonResponse(mockData))

      const request = new Request('http://localhost/x')
      const result = await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/ekskludertesaker/hent',
      } as Parameters<typeof loader>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/eksludertesaker')
      expect(result).toEqual(mockData)
    })
  })

  describe('leggTil', () => {
    it('POST legger til ekskluderte saker', async () => {
      const { action } = await import('./batch.regulering.ekskludertesaker.leggTil')
      fetchSpy.mockResolvedValueOnce(new Response('', { status: 200 }))

      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ sakIder: [100, 200], kommentar: 'Testkommentar' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/ekskludertesaker/leggTil',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/eksludertesaker/leggTil')
      expect(init.method).toBe('POST')
      const sentBody = JSON.parse(init.body)
      expect(sentBody.sakIder).toEqual([100, 200])
      expect(sentBody.kommentar).toBe('Testkommentar')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ erOppdatert: true })
    })

    it('backend 500 kaster feil', async () => {
      const { action } = await import('./batch.regulering.ekskludertesaker.leggTil')
      fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500, statusText: 'Internal Server Error' }))

      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ sakIder: [100], kommentar: 'test' }),
        headers: { 'Content-Type': 'application/json' },
      })
      await expect(
        action({
          request,
          params: {},
          context: {},
          unstable_pattern: '/batch/regulering/ekskludertesaker/leggTil',
        } as Parameters<typeof action>[0]),
      ).rejects.toBeDefined()
    })
  })

  describe('fjern', () => {
    it('POST fjerner ekskluderte saker', async () => {
      const { action } = await import('./batch.regulering.ekskludertesaker.fjern')
      fetchSpy.mockResolvedValueOnce(new Response('', { status: 200 }))

      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ sakIder: [300, 400] }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/ekskludertesaker/fjern',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/eksludertesaker/fjern')
      expect(init.method).toBe('POST')
      const sentBody = JSON.parse(init.body)
      expect(sentBody.sakIder).toEqual([300, 400])
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ erOppdatert: true })
    })

    it('backend 500 kaster feil', async () => {
      const { action } = await import('./batch.regulering.ekskludertesaker.fjern')
      fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500, statusText: 'Internal Server Error' }))

      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ sakIder: [300] }),
        headers: { 'Content-Type': 'application/json' },
      })
      await expect(
        action({
          request,
          params: {},
          context: {},
          unstable_pattern: '/batch/regulering/ekskludertesaker/fjern',
        } as Parameters<typeof action>[0]),
      ).rejects.toBeDefined()
    })
  })
})
