import { describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test', aldeBehandlingUrlTemplate: '', psakSakUrlTemplate: '' },
  isAldeLinkEnabled: false,
  isDevelopment: false,
}))

const mockApiGet = vi.fn()

vi.mock('~/services/api.server', () => ({
  apiGet: mockApiGet,
}))

const { loader } = await import('./behandling.$behandlingId.aktiviteter')

const loaderArgs = (url: string) =>
  ({
    request: new Request(url),
    params: { behandlingId: '456' },
    context: {},
    unstable_pattern: '/behandling/:behandlingId/aktiviteter',
  }) as Parameters<typeof loader>[0]

describe('behandling aktiviteter loader', () => {
  it('laster aktiviteter med default paginering', async () => {
    mockApiGet.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/456/aktiviteter'))

    expect(mockApiGet).toHaveBeenCalledWith(
      '/api/behandling/456/aktiviteter?page=0&size=100&sort=aktivitetId%2Cdesc',
      expect.any(Request),
    )
  })

  it('videresender page og size fra URL', async () => {
    mockApiGet.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/456/aktiviteter?page=3&size=25'))

    expect(mockApiGet).toHaveBeenCalledWith(
      '/api/behandling/456/aktiviteter?page=3&size=25&sort=aktivitetId%2Cdesc',
      expect.any(Request),
    )
  })

  it('videresender sort fra URL', async () => {
    mockApiGet.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/456/aktiviteter?sortKey=aktivitetId&sortDir=ascending'))

    expect(mockApiGet).toHaveBeenCalledWith(
      '/api/behandling/456/aktiviteter?page=0&size=100&sort=aktivitetId%2Casc',
      expect.any(Request),
    )
  })
})
