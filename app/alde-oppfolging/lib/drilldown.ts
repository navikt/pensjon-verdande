import type { Kriterium } from '~/behandling-sok/lib/kriterier'
import { serializeStateToSearchParams } from '~/behandling-sok/lib/url-state'

export const BEHANDLING_SOK_STI = '/behandling-sok'

export const AVBRUTT_BOETTE = 'AVBRUTT'

function byggUrl(behandlingType: string, kriterier: Kriterium[]): string {
  const sp = serializeStateToSearchParams({
    behandlingType,
    kriterier,
    visning: 'treff',
    aggregering: 'MAANED',
    tidsdimensjon: 'OPPRETTET',
  })
  return `${BEHANDLING_SOK_STI}?${sp.toString()}`
}

export type AktivitetStatusSok = {
  behandlingType: string
  aktivitetCode: string
  aktivitetStatus: string
  fomDato: string
  tomDato: string
}

export function byggAktivitetStatusSokUrl({
  behandlingType,
  aktivitetCode,
  aktivitetStatus,
  fomDato,
  tomDato,
}: AktivitetStatusSok): string {
  return byggUrl(behandlingType, [
    {
      type: 'HAR_AKTIVITET_I_STATUS',
      aktivitetTyper: [aktivitetCode],
      statuser: [aktivitetStatus],
      fom: fomDato,
      tom: tomDato,
    },
  ])
}

export type BehandlingStatusSok = {
  behandlingType: string
  behandlingStatus: string
  aktivitetCode?: string | null
  fomDato: string
  tomDato: string
  avbruddAktivitetCode: string
}

export function byggBehandlingStatusSokUrl({
  behandlingType,
  behandlingStatus,
  aktivitetCode,
  fomDato,
  tomDato,
  avbruddAktivitetCode,
}: BehandlingStatusSok): string {
  const erAvbrutt = behandlingStatus === AVBRUTT_BOETTE
  const kriterier: Kriterium[] = [
    { type: 'OPPRETTET_I_PERIODE', fom: fomDato, tom: tomDato },
    { type: 'HAR_ALDE_AKTIVITET' },
  ]

  if (erAvbrutt) {
    kriterier.push({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [avbruddAktivitetCode], operator: 'OR' })
  } else {
    kriterier.push({ type: 'HAR_STATUS', statuser: [behandlingStatus] })
    kriterier.push({ type: 'IKKE_HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [avbruddAktivitetCode] })
  }

  if (aktivitetCode && aktivitetCode !== avbruddAktivitetCode) {
    kriterier.push({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [aktivitetCode], operator: 'OR' })
  }

  return byggUrl(behandlingType, kriterier)
}
