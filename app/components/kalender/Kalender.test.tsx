import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { asLocalDateString } from '~/common/date'
import Kalender, { forsteOgSisteDatoForKalender } from './Kalender'

describe('kalender ved årsskiftet', () => {
  it('viser januar 2027 og en planlagt kjøring på riktig dato', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/kalender?dato=2027-01-07']}>
        <Kalender
          startDato={new Date(2027, 0, 7)}
          serverIDag="2026-10-07"
          kalenderHendelser={{
            offentligeFridager: [],
            kalenderBehandlinger: [{ behandlingId: 1, type: 'Regulering', kjoreDato: '2027-01-07T08:00:00' }],
          }}
          maksAntallPerDag={6}
          visKlokkeSlett={true}
        />
      </MemoryRouter>,
    )

    expect(html).toContain('januar')
    expect(html).toContain('1. jan')
    expect(html).toContain('Regulering')
    expect(html).toContain('/behandling/1')
  })

  it('henter seks uker som dekker januar 2027', () => {
    const { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(new Date(2027, 0, 7))

    expect(asLocalDateString(forsteDato)).toBe('2026-12-28')
    expect(asLocalDateString(sisteDato)).toBe('2027-02-07')
  })
})
