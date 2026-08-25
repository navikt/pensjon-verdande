import { describe, expect, it } from 'vitest'
import { deserializeStateFromSearchParams } from '~/behandling-sok/lib/url-state'
import { byggAktivitetStatusSokUrl, byggBehandlingStatusSokUrl } from './drilldown'

const AVBRUDD = 'FleksibelApSak_AvbrytAldeBehandling'

/** Deep-linken er verdiløs hvis søkeflaten ikke kan lese den tilbake — derfor round-trip. */
function kriterierFra(url: string) {
  const sp = new URLSearchParams(url.split('?')[1])
  const resultat = deserializeStateFromSearchParams(sp)
  expect(resultat.feil).toBeNull()
  expect(resultat.ukjenteKriterier).toEqual([])
  return { state: resultat.state, kriterier: resultat.state.ikkeSensitiveKriterier }
}

describe('byggAktivitetStatusSokUrl', () => {
  it('lager ett kriterium med type, aktivitetstatus og periode samlet', () => {
    const url = byggAktivitetStatusSokUrl({
      behandlingType: 'FleksibelApSak',
      aktivitetCode: 'FleksibelApSak_AldeAttester',
      aktivitetStatus: 'FULLFORT',
      fomDato: '2026-08-18',
      tomDato: '2026-08-25',
    })

    const { state, kriterier } = kriterierFra(url)
    expect(state.behandlingType).toBe('FleksibelApSak')
    expect(kriterier).toEqual([
      {
        type: 'HAR_AKTIVITET_I_STATUS',
        aktivitetTyper: ['FleksibelApSak_AldeAttester'],
        statuser: ['FULLFORT'],
        fom: '2026-08-18',
        tom: '2026-08-25',
      },
    ])
  })

  it('bruker samme dato som fom og tom for en enkelt søyle', () => {
    const url = byggAktivitetStatusSokUrl({
      behandlingType: 'FleksibelApSak',
      aktivitetCode: 'A',
      aktivitetStatus: 'FEILET',
      fomDato: '2026-08-20',
      tomDato: '2026-08-20',
    })
    const { kriterier } = kriterierFra(url)
    expect(kriterier[0]).toMatchObject({ fom: '2026-08-20', tom: '2026-08-20' })
  })

  it('bruker ikke behandlingens status — aktivitetstatus er et eget verdisett', () => {
    const url = byggAktivitetStatusSokUrl({
      behandlingType: 'FleksibelApSak',
      aktivitetCode: 'A',
      aktivitetStatus: 'FULLFORT',
      fomDato: '2026-08-18',
      tomDato: '2026-08-25',
    })
    const { kriterier } = kriterierFra(url)
    expect(kriterier.some((k) => k.type === 'HAR_STATUS')).toBe(false)
  })
})

describe('byggBehandlingStatusSokUrl', () => {
  const basis = {
    behandlingType: 'FleksibelApSak',
    fomDato: '2026-08-18',
    tomDato: '2026-08-25',
    avbruddAktivitetCode: AVBRUDD,
  }

  it('avgrenser alltid til behandlinger med Alde-aktivitet', () => {
    const { kriterier } = kriterierFra(byggBehandlingStatusSokUrl({ ...basis, behandlingStatus: 'FULLFORT' }))
    expect(kriterier).toContainEqual({ type: 'HAR_ALDE_AKTIVITET' })
  })

  it('ekskluderer avbrutte behandlinger fra ikke-AVBRUTT-bøtter', () => {
    const { kriterier } = kriterierFra(byggBehandlingStatusSokUrl({ ...basis, behandlingStatus: 'FULLFORT' }))
    expect(kriterier).toContainEqual({ type: 'HAR_STATUS', statuser: ['FULLFORT'] })
    expect(kriterier).toContainEqual({ type: 'IKKE_HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [AVBRUDD] })
  })

  it('definerer AVBRUTT-bøtta av avbrudds-aktiviteten, ikke av behandlingsstatus', () => {
    const { kriterier } = kriterierFra(byggBehandlingStatusSokUrl({ ...basis, behandlingStatus: 'AVBRUTT' }))
    expect(kriterier.some((k) => k.type === 'HAR_STATUS')).toBe(false)
    expect(kriterier.some((k) => k.type === 'IKKE_HAR_AKTIVITET_AV_TYPE')).toBe(false)
    expect(kriterier).toContainEqual({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [AVBRUDD], operator: 'OR' })
  })

  it('legger på aktivitetsfilter når en aktivitetskode er oppgitt', () => {
    const { kriterier } = kriterierFra(
      byggBehandlingStatusSokUrl({ ...basis, behandlingStatus: 'FULLFORT', aktivitetCode: 'Steg_A' }),
    )
    expect(kriterier).toContainEqual({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: ['Steg_A'], operator: 'OR' })
  })

  it('dupliserer ikke avbrudds-aktiviteten når den også er valgt aktivitetskode', () => {
    const { kriterier } = kriterierFra(
      byggBehandlingStatusSokUrl({ ...basis, behandlingStatus: 'AVBRUTT', aktivitetCode: AVBRUDD }),
    )
    expect(kriterier.filter((k) => k.type === 'HAR_AKTIVITET_AV_TYPE')).toHaveLength(1)
  })

  it('setter alltid periode på behandlingens opprettet-dato', () => {
    const { kriterier } = kriterierFra(byggBehandlingStatusSokUrl({ ...basis, behandlingStatus: 'STOPPET' }))
    expect(kriterier).toContainEqual({ type: 'OPPRETTET_I_PERIODE', fom: '2026-08-18', tom: '2026-08-25' })
  })
})
