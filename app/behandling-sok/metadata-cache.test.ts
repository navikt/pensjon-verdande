import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test', aldeBehandlingUrlTemplate: '', psakSakUrlTemplate: '' },
  isAldeLinkEnabled: false,
  isDevelopment: false,
}))

const mockApiGet = vi.fn()
vi.mock('~/services/api.server', () => ({ apiGet: mockApiGet }))

const { hentBehandlingstyper, _resetCache } = await import('./metadata-cache.server')

describe('hentBehandlingstyper', () => {
  beforeEach(() => {
    _resetCache()
    mockApiGet.mockReset()
  })

  test('mapper { behandlingTyper }-shape fra backend', async () => {
    mockApiGet.mockResolvedValue({
      schemaVersion: '1',
      metadataVersion: 'm',
      generatedAt: '2026-01-01T00:00:00',
      behandlingTyper: ['A', 'B', 'C'],
    })
    const res = await hentBehandlingstyper(new Request('http://x'))
    expect(res).toEqual(['A', 'B', 'C'])
  })

  test('returnerer tom liste når behandlingTyper mangler', async () => {
    mockApiGet.mockResolvedValue({})
    const res = await hentBehandlingstyper(new Request('http://x'))
    expect(res).toEqual([])
  })
})
