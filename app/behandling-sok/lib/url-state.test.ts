import { describe, expect, it } from 'vitest'
import type { Kriterium } from './kriterier'
import {
  deserializeStateFromSearchParams,
  fjernSensitive,
  hashCommittedState,
  plukkSensitive,
  serializeStateToSearchParams,
} from './url-state'

const baseSpec: Kriterium[] = [
  { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
  { type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: ['FleksibelApSak_A412_X'], operator: 'OR' },
  { type: 'KRAVHODE_HAR_KONTROLLPUNKT', kontrollpunktTyper: ['UTLAND'], operator: 'OR' },
  { type: 'KRAVHODE_HAR_STATUS', statuser: ['MAN'] },
]

describe('serialize/deserialize roundtrip', () => {
  it('beholder ikke-sensitive kriterier', () => {
    const sp = serializeStateToSearchParams({
      behandlingType: 'FleksibelApSak',
      kriterier: baseSpec,
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    const r = deserializeStateFromSearchParams(sp)
    expect(r.feil).toBeNull()
    expect(r.state.behandlingType).toBe('FleksibelApSak')
    expect(r.state.ikkeSensitiveKriterier).toEqual(baseSpec)
    expect(r.state.visning).toBe('treff')
  })
  it('strippe sensitive kriterier fra URL', () => {
    const k: Kriterium[] = [
      ...baseSpec,
      { type: 'OPPRETTET_AV', identer: ['Z990123'] },
      { type: 'TILHORER_BEHANDLINGSSERIE', uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
    ]
    const sp = serializeStateToSearchParams({
      behandlingType: 'FleksibelApSak',
      kriterier: k,
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    const dekoded = sp.toString()
    expect(dekoded).not.toContain('Z990123')
    expect(dekoded).not.toContain('a1b2c3d4')
    const r = deserializeStateFromSearchParams(sp)
    expect(r.state.ikkeSensitiveKriterier.find((x) => x.type === 'OPPRETTET_AV')).toBeUndefined()
  })
  it('utelater default-verdier fra URL for kompakthet', () => {
    const sp = serializeStateToSearchParams({
      behandlingType: 'FleksibelApSak',
      kriterier: [],
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    expect(sp.has('visning')).toBe(false)
    expect(sp.has('aggregering')).toBe(false)
    expect(sp.has('tidsdimensjon')).toBe(false)
  })
  it('tar med graf-parametre når visning=antall-over-tid', () => {
    const sp = serializeStateToSearchParams({
      behandlingType: 'FleksibelApSak',
      kriterier: [],
      visning: 'antall-over-tid',
      aggregering: 'UKE',
      tidsdimensjon: 'FULLFORT',
    })
    expect(sp.get('visning')).toBe('antall-over-tid')
    expect(sp.get('aggregering')).toBe('UKE')
    expect(sp.get('tidsdimensjon')).toBe('FULLFORT')
  })
})

describe('deserializeStateFromSearchParams — feilrobust', () => {
  it('returnerer feilmelding for ugyldig base64', () => {
    const sp = new URLSearchParams({ q: '!!!ikke-base64@@@' })
    const r = deserializeStateFromSearchParams(sp)
    expect(r.feil).not.toBeNull()
  })
  it('returnerer feilmelding for ikke-array JSON', () => {
    const sp = new URLSearchParams({ q: Buffer.from('{"foo":"bar"}').toString('base64url') })
    const r = deserializeStateFromSearchParams(sp)
    expect(r.feil).not.toBeNull()
  })
  it('rapporterer ukjente kriterietyper i stedet for å filtrere stille', () => {
    const data = [
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'NY_FREMTIDIG_KRITERIE', foo: 'bar' },
    ]
    const sp = new URLSearchParams({ q: Buffer.from(JSON.stringify(data)).toString('base64url') })
    const r = deserializeStateFromSearchParams(sp)
    expect(r.ukjenteKriterier).toHaveLength(1)
    expect(r.ukjenteKriterier[0].type).toBe('NY_FREMTIDIG_KRITERIE')
    expect(r.state.ikkeSensitiveKriterier).toHaveLength(1)
  })
  it('faller tilbake til defaults for ugyldig visning/aggregering', () => {
    const sp = new URLSearchParams({ visning: 'foo', aggregering: 'bar' })
    const r = deserializeStateFromSearchParams(sp)
    expect(r.state.visning).toBe('treff')
    expect(r.state.aggregering).toBe('MAANED')
  })
})

describe('plukkSensitive / fjernSensitive', () => {
  it('partisjonerer korrekt', () => {
    const k: Kriterium[] = [
      { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-12-31' },
      { type: 'OPPRETTET_AV', identer: ['Z990123'] },
    ]
    expect(fjernSensitive(k)).toHaveLength(1)
    expect(plukkSensitive(k)).toHaveLength(1)
    expect(plukkSensitive(k)[0].type).toBe('OPPRETTET_AV')
  })
})

describe('hashCommittedState', () => {
  it('gir samme hash for samme state', () => {
    const a = hashCommittedState({
      behandlingType: 'FleksibelApSak',
      ikkeSensitiveKriterier: baseSpec,
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    const b = hashCommittedState({
      behandlingType: 'FleksibelApSak',
      ikkeSensitiveKriterier: baseSpec,
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    expect(a).toBe(b)
  })
  it('endrer seg når kriterium endres', () => {
    const a = hashCommittedState({
      behandlingType: 'FleksibelApSak',
      ikkeSensitiveKriterier: baseSpec,
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    const b = hashCommittedState({
      behandlingType: 'FleksibelApSak',
      ikkeSensitiveKriterier: baseSpec.slice(0, 2),
      visning: 'treff',
      aggregering: 'MAANED',
      tidsdimensjon: 'OPPRETTET',
    })
    expect(a).not.toBe(b)
  })
})
