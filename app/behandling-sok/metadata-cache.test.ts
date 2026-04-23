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

  test('aksepterer { typer: string[] }-shape', async () => {
    mockApiGet.mockResolvedValue({ typer: ['A', 'B', 'C'] })
    const res = await hentBehandlingstyper(new Request('http://x'))
    expect(res).toEqual(['A', 'B', 'C'])
  })

  test('aksepterer string[]-shape direkte', async () => {
    mockApiGet.mockResolvedValue(['A', 'B'])
    const res = await hentBehandlingstyper(new Request('http://x'))
    expect(res).toEqual(['A', 'B'])
  })

  test('returnerer tom liste hvis verken array eller { typer }', async () => {
    mockApiGet.mockResolvedValue({})
    const res = await hentBehandlingstyper(new Request('http://x'))
    expect(res).toEqual([])
  })
})
