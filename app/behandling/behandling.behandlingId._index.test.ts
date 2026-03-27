import { describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test', aldeBehandlingUrlTemplate: '', psakSakUrlTemplate: '' },
  isAldeLinkEnabled: false,
  isDevelopment: false,
}))

const mockGetBehandling = vi.fn()
const mockGetBehandlingKjoringer = vi.fn()

vi.mock('~/services/behandling.server', () => ({
  getBehandling: mockGetBehandling,
  getBehandlingKjoringer: mockGetBehandlingKjoringer,
}))

const { loader } = await import('./behandling.$behandlingId._index')

const loaderArgs = (url: string) =>
  ({
    request: new Request(url),
    params: { behandlingId: '123' },
    context: {},
    unstable_pattern: '/behandling/:behandlingId',
  }) as Parameters<typeof loader>[0]

describe('behandling kjøringer loader', () => {
  it('laster kjøringer med default paginering', async () => {
    mockGetBehandling.mockResolvedValueOnce({ behandlingId: 123, erAldeBehandling: false })
    mockGetBehandlingKjoringer.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/123'))

    expect(mockGetBehandlingKjoringer).toHaveBeenCalledWith(expect.any(Request), '123', 0, 100, 'startet,desc')
  })

  it('videresender page og size fra URL', async () => {
    mockGetBehandling.mockResolvedValueOnce({ behandlingId: 123, erAldeBehandling: false })
    mockGetBehandlingKjoringer.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/123?page=2&size=50'))

    expect(mockGetBehandlingKjoringer).toHaveBeenCalledWith(expect.any(Request), '123', 2, 50, 'startet,desc')
  })

  it('videresender sort fra URL', async () => {
    mockGetBehandling.mockResolvedValueOnce({ behandlingId: 123, erAldeBehandling: false })
    mockGetBehandlingKjoringer.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/123?sortKey=startet&sortDir=descending'))

    expect(mockGetBehandlingKjoringer).toHaveBeenCalledWith(expect.any(Request), '123', 0, 100, 'startet,desc')
  })
})
