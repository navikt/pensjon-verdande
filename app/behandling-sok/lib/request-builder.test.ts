import { describe, expect, it } from 'vitest'
import type { Kriterium } from './kriterier'
import { buildAntallOverTidRequest, buildTreffRequest, rensKriterier, SCHEMA_VERSION } from './request-builder'

describe('rensKriterier', () => {
  it('filtrerer bort tomme multi-select', () => {
    const k: Kriterium[] = [
      { type: 'HAR_STATUS', statuser: [] },
      { type: 'HAR_STATUS', statuser: ['MAN'] },
    ]
    expect(rensKriterier(k)).toHaveLength(1)
  })
  it('beholder kriterier uten verdier (CheckboxEditor)', () => {
    const k: Kriterium[] = [{ type: 'HAR_AAPEN_MANUELL_BEHANDLING' }, { type: 'KONTROLLPUNKT_ER_KRITISK' }]
    expect(rensKriterier(k)).toHaveLength(2)
  })
  it('filtrerer bort tomme perioder', () => {
    const k: Kriterium[] = [
      { type: 'OPPRETTET_I_PERIODE', fom: '', tom: '' },
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
    ]
    expect(rensKriterier(k)).toHaveLength(1)
  })
})

describe('buildTreffRequest matcher spec-eksempel', () => {
  it('reproduserer del-aut-utland-manuell-eksempelet', () => {
    const r = buildTreffRequest(
      'FleksibelApSak',
      [
        { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
        {
          type: 'HAR_AKTIVITET_AV_TYPE',
          aktivitetTyper: [
            'FleksibelApSak_A412_VentPaaKompletteringAvGrunnlag',
            'FleksibelApSak_A406_VurderSamboerAktivitet',
          ],
          operator: 'OR',
        },
        {
          type: 'KRAVHODE_HAR_KONTROLLPUNKT',
          kontrollpunktTyper: ['UTLAND', 'UTLAND_F_BH_MED_UTL'],
          operator: 'OR',
        },
        { type: 'KRAVHODE_HAR_STATUS', statuser: ['MAN'] },
      ],
      null,
      100,
    )
    expect(r.schemaVersion).toBe(SCHEMA_VERSION)
    expect(r.behandlingType).toBe('FleksibelApSak')
    expect(r.kriterier).toHaveLength(4)
    expect(r.cursor).toBeNull()
    expect(r.limit).toBe(100)
  })
})

describe('buildAntallOverTidRequest', () => {
  it('inkluderer aggregering og tidsdimensjon', () => {
    const r = buildAntallOverTidRequest(
      'FleksibelApSak',
      [{ type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' }],
      'MAANED',
      'OPPRETTET',
    )
    expect(r.aggregering).toBe('MAANED')
    expect(r.tidsdimensjon).toBe('OPPRETTET')
  })
})
