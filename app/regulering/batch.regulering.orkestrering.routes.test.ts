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

function okResponse(status = 200) {
  return new Response('', { status })
}

describe('orkestrering routes', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('batch.regulering.orkestrering action (startOrkestrering)', () => {
    it('POST starter orkestrering med formdata-parametre', async () => {
      const { action } = await import('./batch.regulering.orkestrering')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const formData = new FormData()
      formData.set('antallFamilier', '50000')
      formData.set('kjorOnline', 'true')
      formData.set('brukKjoreplan', 'false')
      formData.set('skalSamordne', 'true')

      const request = new Request('http://localhost/x', { method: 'POST', body: formData })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/orkestrering',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/orkestrering/start')
      expect(init.method).toBe('POST')
      const sentBody = JSON.parse(init.body)
      expect(sentBody.antallFamilier).toBe('50000')
      expect(sentBody.kjorOnline).toBe(true)
      expect(sentBody.brukKjoreplan).toBe(false)
      expect(sentBody.skalSamordne).toBe(true)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsett.$behandlingId', () => {
    it('POST fortsetter orkestrering for behandlingId', async () => {
      const { action } = await import('./batch.regulering.orkestrering.fortsett.$behandlingId')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: { behandlingId: '456' },
        context: {},
        unstable_pattern: '/batch/regulering/orkestrering/fortsett/:behandlingId',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/orkestrering/456/fortsett')
      expect(init.method).toBe('POST')
      expect(result).toEqual({ success: true })
    })

    it('backend 500 kaster feil', async () => {
      const { action } = await import('./batch.regulering.orkestrering.fortsett.$behandlingId')
      fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

      const request = new Request('http://localhost/x', { method: 'POST' })
      await expect(
        action({
          request,
          params: { behandlingId: '456' },
          context: {},
          unstable_pattern: '/batch/regulering/orkestrering/fortsett/:behandlingId',
        } as Parameters<typeof action>[0]),
      ).rejects.toBeDefined()
    })
  })

  describe('pause.$behandlingId', () => {
    it('POST pauser orkestrering for behandlingId', async () => {
      const { action } = await import('./batch.regulering.orkestrering.pause.$behandlingId')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: { behandlingId: '789' },
        context: {},
        unstable_pattern: '/batch/regulering/orkestrering/pause/:behandlingId',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/orkestrering/789/pause')
      expect(init.method).toBe('POST')
      expect(result).toEqual({ success: true })
    })

    it('backend 500 kaster feil', async () => {
      const { action } = await import('./batch.regulering.orkestrering.pause.$behandlingId')
      fetchSpy.mockResolvedValueOnce(new Response('Feil', { status: 500 }))

      const request = new Request('http://localhost/x', { method: 'POST' })
      await expect(
        action({
          request,
          params: { behandlingId: '789' },
          context: {},
          unstable_pattern: '/batch/regulering/orkestrering/pause/:behandlingId',
        } as Parameters<typeof action>[0]),
      ).rejects.toBeDefined()
    })
  })

  describe('hentAggregerteFeilmeldinger', () => {
    it('loader henter aggregerte feilmeldinger', async () => {
      const { loader } = await import('./batch.regulering.orkestrering.hentAggregerteFeilmeldinger')
      const mockData = { feilmeldinger: [{ melding: 'Feil', antall: 5 }] }
      fetchSpy.mockResolvedValueOnce(jsonResponse(mockData))

      const request = new Request('http://localhost/x')
      const result = await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/orkestrering/hentAggregerteFeilmeldinger',
      } as Parameters<typeof loader>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/aggregerteFeilmeldinger')
      expect(result).toEqual(mockData)
    })
  })

  describe('hentOrkestreringStatistikk.$behandlingId', () => {
    it('loader henter orkestreringsstatistikk', async () => {
      const { loader } = await import('./batch.regulering.orkestrering.hentOrkestreringStatistikk.$behandlingId')
      const mockData = { fremdrift: 50, status: 'AKTIV' }
      fetchSpy.mockResolvedValueOnce(jsonResponse(mockData))

      const request = new Request('http://localhost/x')
      const result = await loader({
        request,
        params: { behandlingId: '111' },
        context: {},
        unstable_pattern: '/batch/regulering/orkestrering/hentOrkestreringStatistikk/:behandlingId',
      } as Parameters<typeof loader>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/orkestrering/111/detaljer')
      expect(result).toEqual(mockData)
    })
  })
})
