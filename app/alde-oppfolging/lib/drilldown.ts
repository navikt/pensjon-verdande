/**
 * Deep-link fra Alde-statistikkens aggregerte tall til `/behandling-sok`.
 *
 * Oversetter Alde-metrikkenes SQL-semantikk til søkekriterier som gir *samme* mengde
 * behandlinger. Tre ting må stemme, ellers viser drilldown-en noe annet enn tallet:
 *
 * 1. Metrikkene joiner alltid mot `T_BEHANDLING_AKTIVITET_ALDE` → `HAR_ALDE_AKTIVITET` alltid på.
 * 2. AVBRUTT er en overstyring, ikke en behandlingsstatus → AVBRUTT-lenken har ingen
 *    `HAR_STATUS`, og alle andre statuser får `IKKE_HAR_AKTIVITET_AV_TYPE[avbrudd]`.
 * 3. Aktivitet-taben teller aktivitetens EGEN status og opprettet-dato → type, status og
 *    periode i ett kriterium, så de gjelder samme aktivitetsrad.
 */

import type { Kriterium } from '~/behandling-sok/lib/kriterier'
import { serializeStateToSearchParams } from '~/behandling-sok/lib/url-state'

export const BEHANDLING_SOK_STI = '/behandling-sok'

/** Statusen Alde-statistikken bruker for avbrutte behandlinger — ikke en ekte BehandlingStatus. */
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
  /** Aktivitetstatus: OPPRETTET | UNDER_BEHANDLING | FULLFORT | FEILET. */
  aktivitetStatus: string
  /** Aktivitetens opprettet-dato, ISO. Sett fom = tom for én dags søyle. */
  fomDato: string
  tomDato: string
}

/**
 * Drilldown fra Aktivitet-taben: aktivitetens egen status.
 *
 * Søket returnerer *behandlinger*, taben teller *aktiviteter* — én behandling kan ha flere
 * aktiviteter i samme status. Derfor sier lenketeksten «Vis behandlinger», ikke antallet.
 */
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
  /** Behandlingsstatus, eller AVBRUTT for den overstyrte bøtta. */
  behandlingStatus: string
  /** Avgrens i tillegg til behandlinger som har vært innom denne aktiviteten. */
  aktivitetCode?: string | null
  /** Behandlingens opprettet-dato, ISO. Sett fom = tom for én dags søyle. */
  fomDato: string
  tomDato: string
  avbruddAktivitetCode: string
}

/** Drilldown fra status-kort, statusfordeling over tid og «Status med aktivitet»-tabellen. */
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
    // AVBRUTT er definert av avbrudds-aktiviteten, ikke av behandlingens status.
    kriterier.push({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [avbruddAktivitetCode], operator: 'OR' })
  } else {
    kriterier.push({ type: 'HAR_STATUS', statuser: [behandlingStatus] })
    // ...og behandlinger som er avbrutt er allerede talt i AVBRUTT-bøtta.
    kriterier.push({ type: 'IKKE_HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [avbruddAktivitetCode] })
  }

  if (aktivitetCode && aktivitetCode !== avbruddAktivitetCode) {
    kriterier.push({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [aktivitetCode], operator: 'OR' })
  }

  return byggUrl(behandlingType, kriterier)
}
