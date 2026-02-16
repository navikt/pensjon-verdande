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

describe('administrerbehandlinger action-routes', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('endrePrioritetBatch', () => {
    it('PUT endrer prioritet til batch', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.endrePrioritetBatch')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/endrePrioritetBatch',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/endre/prioritet/batch')
      expect(init.method).toBe('PUT')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('endrePrioritetOnline', () => {
    it('PUT endrer prioritet til online', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.endrePrioritetOnline')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/endrePrioritetOnline',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/endre/prioritet/online')
      expect(init.method).toBe('PUT')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsettFaktoromregningsmodus', () => {
    it('POST fortsetter faktoromregningsmodus', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.fortsettFaktoromregningsmodus')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/fortsettFaktoromregningsmodus',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/fortsett/nyeavviksgrenser/faktormodus')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsettFamilieReguleringerTilBehandling', () => {
    it('POST fortsetter familiereguleringer til behandling', async () => {
      const { action } = await import(
        './batch.regulering.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling'
      )
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/fortsettFamilieReguleringerTilBehandling',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/fortsett/familiereguleringertilbehandling')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsettFeilendeFamilieReguleringer', () => {
    it('POST fortsetter feilende familiereguleringer', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.fortsettFeilendeFamilieReguleringer')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/fortsettFeilendeFamilieReguleringer',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/fortsett/familiereguleringer')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsettFeilendeIverksettVedtak', () => {
    it('POST fortsetter feilende iverksett vedtak', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.fortsettFeilendeIverksettVedtak')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/fortsettFeilendeIverksettVedtak',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/fortsett/iverksettvedtak')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsettFeilhandteringmodus', () => {
    it('POST fortsetter feilhåndteringsmodus', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.fortsettFeilhandteringmodus')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/fortsettFeilhandteringmodus',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/fortsett/faktorogfeilmodus')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('fortsettNyAvviksgrenser', () => {
    it('POST fortsetter med nye avviksgrenser', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.fortsettNyAvviksgrenser')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const request = new Request('http://localhost/x', { method: 'POST' })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/fortsettNyAvviksgrenser',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/fortsett/nyeavviksgrenser')
      expect(init.method).toBe('POST')
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })

  describe('hentStatistikk', () => {
    it('loader henter regulering statistikk', async () => {
      const { loader } = await import('./batch.regulering.administrerbehandlinger.hentStatistikk')
      const mockStatistikk = { totalAntall: 100, antallFerdig: 50 }
      fetchSpy.mockResolvedValueOnce(jsonResponse(mockStatistikk))

      const request = new Request('http://localhost/x')
      const result = await loader({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/hentStatistikk',
      } as Parameters<typeof loader>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/arbeidstabell/statistikk')
      expect(result).toEqual(mockStatistikk)
    })
  })

  describe('hentTotaloversiktBehandlinger.$behandlingId', () => {
    it('loader henter orkestreringsstatistikk med behandlingId', async () => {
      const { loader } = await import(
        './batch.regulering.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId'
      )
      const mockDetaljer = { fremdrift: 75, status: 'AKTIV' }
      fetchSpy.mockResolvedValueOnce(jsonResponse(mockDetaljer))

      const request = new Request('http://localhost/x')
      const result = await loader({
        request,
        params: { behandlingId: '123' },
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/hentTotaloversiktBehandlinger/:behandlingId',
      } as Parameters<typeof loader>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/orkestrering/123/detaljer')
      expect(result).toEqual(mockDetaljer)
    })
  })

  describe('oppdaterAvviksgrenser', () => {
    it('PUT oppdaterer avviksgrenser', async () => {
      const { action } = await import('./batch.regulering.administrerbehandlinger.oppdaterAvviksgrenser')
      fetchSpy.mockResolvedValueOnce(okResponse())

      const newAvviksgrenser = [{ type: 'GRUNNPENSJON', grense: 100 }]
      const request = new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ newAvviksgrenser }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await action({
        request,
        params: {},
        context: {},
        unstable_pattern: '/batch/regulering/administrerbehandlinger/oppdaterAvviksgrenser',
      } as Parameters<typeof action>[0])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, init] = fetchSpy.mock.calls[0]
      expect(url).toBe('http://pen-test/api/vedtak/regulering/avviksgrenser')
      expect(init.method).toBe('PUT')
      const sentBody = JSON.parse(init.body)
      expect(sentBody.avviksgrenser).toEqual(newAvviksgrenser)
      expect(init.signal).toBeInstanceOf(AbortSignal)
      expect(result).toEqual({ success: true })
    })
  })
})
