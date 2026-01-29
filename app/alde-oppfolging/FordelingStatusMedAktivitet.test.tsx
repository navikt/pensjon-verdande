import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import FordelingStatusMedAktivitet from './FordelingStatusMedAktivitet'
import type { AldeFordelingStatusMedAktivitet } from './types'

const render = (data: AldeFordelingStatusMedAktivitet[]) =>
  renderToStaticMarkup(<FordelingStatusMedAktivitet data={data} />)

describe('FordelingStatusMedAktivitet', () => {
  it('viser empty state når data er tom', () => {
    const html = render([])
    expect(html).toContain('Statusfordeling med aktivitet')
    expect(html).toContain('Ingen data tilgjengelig for valgt periode.')
  })

  it('sorterer statuser iht statusOrder (FULLFORT før UNDER_BEHANDLING) og sorterer aktiviteter på antall (synkende)', () => {
    const data: AldeFordelingStatusMedAktivitet[] = [
      { status: 'UNDER_BEHANDLING', aktivitet: 'A2', antall: 1 },
      { status: 'FULLFORT', aktivitet: 'F1', antall: 2 },
      { status: 'UNDER_BEHANDLING', aktivitet: 'A1', antall: 5 },
      { status: 'FULLFORT', aktivitet: 'F2', antall: 10 },
    ]

    const html = render(data)

    // Statusrekkefølge
    expect(html.indexOf('Fullført')).toBeLessThan(html.indexOf('Under behandling'))

    // Aktiviteter i FULLFORT sortert på antall: F2 (10) før F1 (2)
    expect(html.indexOf('F2')).toBeLessThan(html.indexOf('F1'))

    // Aktiviteter i UNDER_BEHANDLING sortert på antall: A1 (5) før A2 (1)
    expect(html.indexOf('A1')).toBeLessThan(html.indexOf('A2'))
  })

  it('viser subtotal per status og prosentandel av total', () => {
    const data: AldeFordelingStatusMedAktivitet[] = [
      { status: 'FULLFORT', aktivitet: 'F', antall: 3 },
      { status: 'UNDER_BEHANDLING', aktivitet: 'U', antall: 1 },
    ]

    const html = render(data)

    // Subtotal-rader
    expect(html).toContain('Sum Fullført')
    expect(html).toContain('Sum Under behandling')

    // Total = 4 => FULLFORT 3/4=75.0%, UNDER_BEHANDLING 1/4=25.0%
    expect(html).toContain('75.0%')
    expect(html).toContain('25.0%')
  })

  it('bruker fallback label når status ikke finnes i statusLabels', () => {
    const data: AldeFordelingStatusMedAktivitet[] = [{ status: 'UKJENT_STATUS', aktivitet: 'X', antall: 1 }]

    const html = render(data)

    expect(html).toContain('UKJENT_STATUS')
    expect(html).toContain('Sum UKJENT_STATUS')
  })
})
