import { describe, expect, it } from 'vitest'
import type { AktivitetStatusFordelingDto } from '../types'
import { byggNotatSerie } from './utils'

describe('byggNotatSerie', () => {
  it('returnerer null når det ikke finnes fullførte notater', () => {
    expect(byggNotatSerie([])).toBeNull()

    const kunPagaende: AktivitetStatusFordelingDto[] = [
      { dato: '2026-08-10', status: 'UNDER_BEHANDLING', antall: 3 },
      { dato: '2026-08-11', status: 'FEILET', antall: 1 },
    ]
    expect(byggNotatSerie(kunPagaende)).toBeNull()
  })

  it('teller kun FULLFORT og ignorerer andre aktivitetsstatuser', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2026-08-10', status: 'FULLFORT', antall: 4 },
      { dato: '2026-08-10', status: 'UNDER_BEHANDLING', antall: 99 },
      { dato: '2026-08-10', status: 'FEILET', antall: 99 },
    ]

    expect(byggNotatSerie(data)).toEqual({ datoer: ['2026-08-10'], antall: [4] })
  })

  it('fyller ut dager uten notater med 0 slik at x-aksen blir sammenhengende', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2026-08-10', status: 'FULLFORT', antall: 2 },
      { dato: '2026-08-13', status: 'FULLFORT', antall: 5 },
    ]

    expect(byggNotatSerie(data)).toEqual({
      datoer: ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13'],
      antall: [2, 0, 0, 5],
    })
  })

  it('sorterer datoene stigende uavhengig av rekkefølgen fra backend', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2026-08-12', status: 'FULLFORT', antall: 3 },
      { dato: '2026-08-10', status: 'FULLFORT', antall: 1 },
      { dato: '2026-08-11', status: 'FULLFORT', antall: 2 },
    ]

    expect(byggNotatSerie(data)).toEqual({
      datoer: ['2026-08-10', '2026-08-11', '2026-08-12'],
      antall: [1, 2, 3],
    })
  })

  it('summerer flere rader for samme dato i stedet for å overskrive', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2026-08-10', status: 'FULLFORT', antall: 2 },
      { dato: '2026-08-10', status: 'FULLFORT', antall: 3 },
    ]

    expect(byggNotatSerie(data)).toEqual({ datoer: ['2026-08-10'], antall: [5] })
  })

  it('ignorerer rader uten dato (totalrader fra perDag=false)', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: null, status: 'FULLFORT', antall: 7 },
      { dato: '2026-08-10', status: 'FULLFORT', antall: 2 },
    ]

    expect(byggNotatSerie(data)).toEqual({ datoer: ['2026-08-10'], antall: [2] })
  })
})
