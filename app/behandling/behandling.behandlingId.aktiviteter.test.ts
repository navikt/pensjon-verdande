import { describe, expect, it, vi } from 'vitest'

vi.mock('~/services/auth.server', () => ({
  requireAccessToken: vi.fn().mockResolvedValue('test-token'),
}))

vi.mock('~/services/env.server', () => ({
  env: { penUrl: 'http://pen-test', aldeBehandlingUrlTemplate: '', psakSakUrlTemplate: '' },
  isAldeLinkEnabled: false,
  isDevelopment: false,
}))

const mockGetBehandlingAktiviteter = vi.fn()

vi.mock('~/services/behandling.server', () => ({
  getBehandlingAktiviteter: mockGetBehandlingAktiviteter,
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
    mockGetBehandlingAktiviteter.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/456/aktiviteter'))

    expect(mockGetBehandlingAktiviteter).toHaveBeenCalledWith(expect.any(Request), '456', 0, 100, null)
  })

  it('videresender page og size fra URL', async () => {
    mockGetBehandlingAktiviteter.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/456/aktiviteter?page=3&size=25'))

    expect(mockGetBehandlingAktiviteter).toHaveBeenCalledWith(expect.any(Request), '456', 3, 25, null)
  })

  it('videresender sort fra URL', async () => {
    mockGetBehandlingAktiviteter.mockResolvedValueOnce({ content: [], totalPages: 0, number: 0 })

    await loader(loaderArgs('http://localhost/behandling/456/aktiviteter?sort=aktivitetId,asc'))

    expect(mockGetBehandlingAktiviteter).toHaveBeenCalledWith(expect.any(Request), '456', 0, 100, 'aktivitetId,asc')
  })
})
