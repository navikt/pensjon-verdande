import { describe, expect, it } from 'vitest'
import {
  ALLE_KRITERIE_TYPER,
  erKjentKriterieType,
  harTidsfilter,
  isSensitiv,
  KRITERIE_DEFINISJONER,
  type Kriterium,
  maanederMellom,
  parseStrictIsoDate,
  validerKriterier,
} from './kriterier'

describe('parseStrictIsoDate', () => {
  it('aksepterer gyldige datoer', () => {
    expect(parseStrictIsoDate('2025-01-15')).not.toBeNull()
    expect(parseStrictIsoDate('2024-02-29')).not.toBeNull() // skuddår
  })
  it('avviser ugyldig format', () => {
    expect(parseStrictIsoDate('2025-1-15')).toBeNull()
    expect(parseStrictIsoDate('2025/01/15')).toBeNull()
    expect(parseStrictIsoDate('')).toBeNull()
  })
  it('avviser ikke-eksisterende datoer (ingen silent normalisering)', () => {
    expect(parseStrictIsoDate('2026-02-31')).toBeNull()
    expect(parseStrictIsoDate('2025-13-01')).toBeNull()
    expect(parseStrictIsoDate('2025-02-29')).toBeNull() // ikke skuddår
  })
})

describe('maanederMellom', () => {
  it('regner riktig for fulle måneder', () => {
    expect(maanederMellom(new Date(2025, 0, 1), new Date(2025, 11, 31))).toBe(11)
    expect(maanederMellom(new Date(2024, 0, 1), new Date(2025, 11, 31))).toBe(23)
  })
  it('respekterer dag-i-måned', () => {
    // 1. jan til 15. feb = 1 mnd og 14 dager → 1 mnd komplett
    expect(maanederMellom(new Date(2025, 0, 15), new Date(2025, 1, 14))).toBe(0)
    expect(maanederMellom(new Date(2025, 0, 15), new Date(2025, 1, 15))).toBe(1)
  })
})

describe('KRITERIE_DEFINISJONER', () => {
  it('har en entry per KriterieType', () => {
    expect(ALLE_KRITERIE_TYPER.length).toBe(22)
    for (const type of ALLE_KRITERIE_TYPER) {
      expect(KRITERIE_DEFINISJONER[type]).toBeDefined()
      expect(KRITERIE_DEFINISJONER[type].type).toBe(type)
    }
  })
  it('default-verdi matcher type', () => {
    for (const type of ALLE_KRITERIE_TYPER) {
      const k = KRITERIE_DEFINISJONER[type].defaultVerdi()
      expect(k.type).toBe(type)
    }
  })
  it('har minst ett tidsfilter', () => {
    const tidsfiltre = ALLE_KRITERIE_TYPER.filter((t) => KRITERIE_DEFINISJONER[t].tidsfilter)
    expect(tidsfiltre.length).toBe(4)
  })
  it('OPPRETTET_AV og TILHORER_BEHANDLINGSSERIE er sensitive', () => {
    expect(isSensitiv({ type: 'OPPRETTET_AV', identer: ['Z990123'] })).toBe(true)
    expect(isSensitiv({ type: 'TILHORER_BEHANDLINGSSERIE', uuid: '00000000-0000-0000-0000-000000000000' })).toBe(true)
    expect(isSensitiv({ type: 'HAR_STATUS', statuser: ['MAN'] })).toBe(false)
  })
})

describe('erKjentKriterieType', () => {
  it('aksepterer alle kjente typer', () => {
    for (const t of ALLE_KRITERIE_TYPER) {
      expect(erKjentKriterieType(t)).toBe(true)
    }
  })
  it('avviser ukjent', () => {
    expect(erKjentKriterieType('FOO_BAR')).toBe(false)
    expect(erKjentKriterieType('')).toBe(false)
  })
})

describe('harTidsfilter', () => {
  it('false når ingen periode-kriterier', () => {
    expect(harTidsfilter([{ type: 'HAR_STATUS', statuser: ['MAN'] }])).toBe(false)
  })
  it('true når et tidsfilter er med', () => {
    expect(harTidsfilter([{ type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' }])).toBe(true)
  })
})

describe('validerKriterier', () => {
  it('manglerTidsfilter når ingen tidskriterium', () => {
    const r = validerKriterier([{ type: 'HAR_STATUS', statuser: ['MAN'] }])
    expect(r.manglerTidsfilter).toBe(true)
    expect(r.feil).toEqual([])
  })
  it('aksepterer fullstendig periode', () => {
    const r = validerKriterier([{ type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' }])
    expect(r.manglerTidsfilter).toBe(false)
    expect(r.feil).toEqual([])
  })
  it('aksepterer single-day periode', () => {
    const r = validerKriterier([{ type: 'OPPRETTET_I_PERIODE', fom: '2025-06-15', tom: '2025-06-15' }])
    expect(r.feil).toEqual([])
  })
  it('avviser tom > 24 mnd', () => {
    const r = validerKriterier([{ type: 'OPPRETTET_I_PERIODE', fom: '2023-01-01', tom: '2025-06-01' }])
    expect(r.feil.some((f) => f.melding.includes('24 måneder'))).toBe(true)
  })
  it('avviser fom > tom', () => {
    const r = validerKriterier([{ type: 'OPPRETTET_I_PERIODE', fom: '2025-12-01', tom: '2025-01-01' }])
    expect(r.feil.some((f) => f.melding.includes('etter fra-dato'))).toBe(true)
  })
  it('avviser ugyldig dato', () => {
    const r = validerKriterier([{ type: 'OPPRETTET_I_PERIODE', fom: '2026-02-31', tom: '2026-12-31' }])
    expect(r.feil.some((f) => f.felt === 'fom')).toBe(true)
  })
  it('avviser tom OPPRETTET_AV', () => {
    const r = validerKriterier([
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'OPPRETTET_AV', identer: [] },
    ])
    expect(r.feil.some((f) => f.melding.includes('Minst én ident'))).toBe(true)
  })
  it('avviser ugyldig NAV-ident', () => {
    const r = validerKriterier([
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'OPPRETTET_AV', identer: ['ugyldig ident med mellomrom'] },
    ])
    expect(r.feil.some((f) => f.melding.includes('Ugyldig ident'))).toBe(true)
  })
  it('avviser ugyldig UUID', () => {
    const r = validerKriterier([
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'TILHORER_BEHANDLINGSSERIE', uuid: 'ikke-en-uuid' },
    ])
    expect(r.feil.some((f) => f.felt === 'uuid')).toBe(true)
  })
  it('aksepterer gyldig UUID', () => {
    const r = validerKriterier([
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'TILHORER_BEHANDLINGSSERIE', uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    ])
    expect(r.feil).toEqual([])
  })
  it('avviser tom HAR_AKTIVITET_AV_TYPE', () => {
    const r = validerKriterier([
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [], operator: 'OR' },
    ])
    expect(r.feil.some((f) => f.felt === 'aktivitetTyper')).toBe(true)
  })
  it('avviser negativ terskel', () => {
    const r = validerKriterier([
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'AKTIVITET_KJORT_FLERE_GANGER_ENN', terskel: -1 },
    ])
    expect(r.feil.some((f) => f.felt === 'terskel')).toBe(true)
  })
  it('valider hver periode for seg (rubber-duck-funn)', () => {
    const k: Kriterium[] = [
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-06-30' },
      { type: 'FULLFORT_I_PERIODE', fom: '2023-01-01', tom: '2025-06-01' }, // > 24 mnd
    ]
    const r = validerKriterier(k)
    // Bare den ene perioden er for lang
    expect(r.feil.filter((f) => f.melding.includes('24 måneder')).length).toBe(1)
    expect(r.feil[0].kriterieIndeks).toBe(1)
  })
})
