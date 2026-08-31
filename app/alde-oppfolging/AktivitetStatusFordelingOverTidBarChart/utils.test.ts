import { describe, expect, it } from 'vitest'
import type { AktivitetStatusFordelingDto } from '../types'
import { byggAktivitetSerie, summerPerStatus } from './utils'

describe('byggAktivitetSerie', () => {
  it('returnerer null når det ikke finnes data', () => {
    expect(byggAktivitetSerie([])).toBeNull()
  })

  it('ignorerer rader uten dato', () => {
    expect(byggAktivitetSerie([{ dato: null, status: 'FULLFORT', antall: 5 }])).toBeNull()
  })

  it('beholder alle statuser, ikke bare FULLFORT', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2025-01-01', status: 'FULLFORT', antall: 3 },
      { dato: '2025-01-01', status: 'FEILET', antall: 1 },
    ]
    const serie = byggAktivitetSerie(data)
    expect(serie?.perStatus.map((s) => s.status)).toEqual(['FULLFORT', 'FEILET'])
  })

  it('sorterer kjente statuser etter livsløp, ukjente sist', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2025-01-01', status: 'FEILET', antall: 1 },
      { dato: '2025-01-01', status: 'OPPRETTET', antall: 1 },
      { dato: '2025-01-01', status: 'NOE_NYTT', antall: 1 },
      { dato: '2025-01-01', status: 'UNDER_BEHANDLING', antall: 1 },
    ]
    const serie = byggAktivitetSerie(data)
    expect(serie?.perStatus.map((s) => s.status)).toEqual(['OPPRETTET', 'UNDER_BEHANDLING', 'FEILET', 'NOE_NYTT'])
  })

  it('fyller ut dager uten data med 0 så x-aksen blir sammenhengende', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2025-01-01', status: 'FULLFORT', antall: 2 },
      { dato: '2025-01-04', status: 'FULLFORT', antall: 5 },
    ]
    const serie = byggAktivitetSerie(data)
    expect(serie?.datoer).toEqual(['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'])
    expect(serie?.perStatus[0].antall).toEqual([2, 0, 0, 5])
  })

  it('summerer flere rader for samme dato og status', () => {
    const data: AktivitetStatusFordelingDto[] = [
      { dato: '2025-01-01', status: 'FULLFORT', antall: 2 },
      { dato: '2025-01-01', status: 'FULLFORT', antall: 3 },
    ]
    expect(byggAktivitetSerie(data)?.perStatus[0].antall).toEqual([5])
  })
})

describe('summerPerStatus', () => {
  it('summerer hele perioden per status', () => {
    const serie = byggAktivitetSerie([
      { dato: '2025-01-01', status: 'FULLFORT', antall: 2 },
      { dato: '2025-01-02', status: 'FULLFORT', antall: 3 },
      { dato: '2025-01-02', status: 'FEILET', antall: 1 },
    ])
    expect(serie).not.toBeNull()
    expect(summerPerStatus(serie as NonNullable<typeof serie>)).toEqual([
      { status: 'FULLFORT', antall: 5 },
      { status: 'FEILET', antall: 1 },
    ])
  })
})
