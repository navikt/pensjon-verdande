import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hentKalenderHendelser } from '~/services/behandling.server'
import { loader } from './route'

vi.mock('~/services/behandling.server', () => ({
  hentKalenderHendelser: vi.fn(),
}))

const kalenderHendelser = { offentligeFridager: [], kalenderBehandlinger: [] }

describe('kalender loader', () => {
  beforeEach(() => {
    vi.mocked(hentKalenderHendelser).mockReset()
    vi.mocked(hentKalenderHendelser).mockResolvedValue(kalenderHendelser)
  })

  it.each([
    ['2027-01-07', '2026-12-28', '2027-02-07'],
    ['2026-01-07', '2025-12-29', '2026-02-08'],
    ['2026-12-07', '2026-11-30', '2027-01-10'],
    ['2027-02-07', '2027-02-01', '2027-03-14'],
  ])('henter riktig periode for %s', async (dato, fom, tom) => {
    const request = new Request(`http://localhost/kalender?dato=${dato}`)
    await loader({ request } as Parameters<typeof loader>[0])

    expect(hentKalenderHendelser).toHaveBeenCalledOnce()
    const [sentRequest, periode] = vi.mocked(hentKalenderHendelser).mock.calls[0]
    expect(sentRequest).toBe(request)
    expect(periode.fom.toLocaleDateString('en-CA')).toBe(fom)
    expect(periode.tom.toLocaleDateString('en-CA')).toBe(tom)
  })
})
