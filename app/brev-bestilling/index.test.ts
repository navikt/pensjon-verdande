import { describe, expect, it } from 'vitest'
import type { AutoBrevOppsummering } from './index'
import { brevRowKey, mergeRows } from './mergeRows'

const row = (
  behandlingstype: string,
  brevkode: string,
  brevnavn: string | null,
  sprakKode: string | null,
  antall: number,
  brevType: 'BREVBAKER' | 'LEGACY' = 'BREVBAKER',
): AutoBrevOppsummering => ({
  behandlingstype,
  brevkode,
  originalBrevkode: brevkode,
  brevnavn,
  sprakKode,
  antall,
  brevType,
})

describe('mergeRows', () => {
  it('slår sammen rader med ulik sprakKode', () => {
    const rows = [
      row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak - innvilgelse', 'NB', 100),
      row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak - innvilgelse', 'NN', 30),
    ]

    const result = mergeRows(rows)

    expect(result).toHaveLength(1)
    expect(result[0].antall).toBe(130)
    expect(result[0].brevkode).toBe('PE_AP_04_001')
  })

  it('slår sammen rader med ulik originalBrevkode men lik normalisert brevkode', () => {
    const rows: AutoBrevOppsummering[] = [
      {
        ...row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak - innvilgelse', 'NB', 50),
        originalBrevkode: 'AP_INNVILGELSE_AUTO',
      },
      {
        ...row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak - innvilgelse', 'NB', 20),
        originalBrevkode: 'AP_INNVILGELSE_V2',
      },
    ]

    const result = mergeRows(rows)

    expect(result).toHaveLength(1)
    expect(result[0].antall).toBe(70)
  })

  it('beholder rader med ulik behandlingstype som separate', () => {
    const rows = [
      row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak - innvilgelse', 'NB', 100),
      row('DodsmeldingBehandling', 'PE_AP_04_001', 'Vedtak - innvilgelse', 'NB', 40),
    ]

    const result = mergeRows(rows)

    expect(result).toHaveLength(2)
  })

  it('beholder rader med ulik brevType som separate', () => {
    const rows = [
      row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak', 'NB', 100, 'BREVBAKER'),
      row('FleksibelApSakBehandling', 'PE_AP_04_001', 'Vedtak', 'NB', 25, 'LEGACY'),
    ]

    const result = mergeRows(rows)

    expect(result).toHaveLength(2)
  })

  it('håndterer null brevnavn uten kollisjoner', () => {
    const rows = [
      row('FleksibelApSakBehandling', 'PE_AP_04_001', null, 'NB', 60),
      row('FleksibelApSakBehandling', 'PE_AP_04_001', null, 'NN', 40),
    ]

    const result = mergeRows(rows)

    expect(result).toHaveLength(1)
    expect(result[0].antall).toBe(100)
    expect(result[0].brevnavn).toBeNull()
  })

  it('skiller rader der brevnavn er null fra rader med brevnavn "null"', () => {
    const rows = [
      row('FleksibelApSakBehandling', 'PE_AP_04_001', null, 'NB', 10),
      row('FleksibelApSakBehandling', 'PE_AP_04_001', 'null', 'NB', 5),
    ]

    const result = mergeRows(rows)

    expect(result).toHaveLength(2)
    expect(result.find((r) => r.brevnavn === null)?.antall).toBe(10)
    expect(result.find((r) => r.brevnavn === 'null')?.antall).toBe(5)
  })

  it('returnerer tom liste for tom input', () => {
    expect(mergeRows([])).toEqual([])
  })
})

describe('brevRowKey', () => {
  it('gir lik nøkkel for rader som bare skiller seg på sprakKode', () => {
    const a = row('Behandling', 'KODE', 'Navn', 'NB', 1)
    const b = row('Behandling', 'KODE', 'Navn', 'NN', 2)

    expect(brevRowKey(a)).toBe(brevRowKey(b))
  })

  it('gir ulik nøkkel for rader med ulik brevType', () => {
    const a = row('Behandling', 'KODE', 'Navn', 'NB', 1, 'BREVBAKER')
    const b = row('Behandling', 'KODE', 'Navn', 'NB', 1, 'LEGACY')

    expect(brevRowKey(a)).not.toBe(brevRowKey(b))
  })
})
