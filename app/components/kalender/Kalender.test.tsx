// @vitest-environment jsdom
import { addDays } from 'date-fns'
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

  it.each([
    [new Date(2026, 11, 7), '2026-11-30', '2027-01-10'],
    [new Date(2027, 0, 7), '2026-12-28', '2027-02-07'],
    [new Date(2027, 1, 7), '2027-02-01', '2027-03-14'],
  ])('viser og henter seks uker for %s', (dato, forventetForsteDato, forventetSisteDato) => {
    const opprinneligTidspunkt = dato.getTime()
    const { forsteDato, sisteDato } = forsteOgSisteDatoForKalender(dato)

    expect(asLocalDateString(forsteDato)).toBe(forventetForsteDato)
    expect(asLocalDateString(sisteDato)).toBe(forventetSisteDato)
    expect(dato.getTime()).toBe(opprinneligTidspunkt)

    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <Kalender
          startDato={dato}
          serverIDag="2026-10-07"
          maksAntallPerDag={6}
          visKlokkeSlett
          kalenderHendelser={{ offentligeFridager: [], kalenderBehandlinger: [] }}
        />
      </MemoryRouter>,
    )
    const container = document.createElement('div')
    container.innerHTML = markup
    const table = container.querySelector('table')
    const rows = Array.from(table?.tBodies[0].rows ?? [])
    const cells = rows.flatMap((row) => Array.from(row.cells))

    expect(rows).toHaveLength(6)
    expect(cells).toHaveLength(42)
    cells.forEach((cell, indeks) => {
      const vistDato = addDays(forsteDato, indeks)
      const forventetDagLabel =
        vistDato.getDate() === 1
          ? `1. ${vistDato.toLocaleDateString('no-NO', { month: 'short' })}`
          : `${vistDato.getDate()}.`
      const labels = cell.querySelector('thead')?.querySelectorAll('span')
      const dagLabel = labels?.length ? labels[labels.length - 1].textContent : cell.querySelector('thead')?.textContent

      expect(dagLabel).toBe(forventetDagLabel)
    })
  })
})
