const BEHANDLING_STATUS_MAP = {
  DEBUG: 'Debug',
  FEILENDE: 'Feilende',
  FULLFORT: 'Fullført',
  OPPRETTET: 'Opprettet',
  STOPPET: 'Stoppet',
  UNDER_BEHANDLING: 'Under behandling',
} as const

const BEHANDLING_STATUS_VARIANT_MAP = {
  DEBUG: 'neutral',
  FEILENDE: 'error',
  FULLFORT: 'success',
  OPPRETTET: 'info',
  STOPPET: 'warning',
  UNDER_BEHANDLING: 'info',
} as const

const AKTIVITET_STATUS_MAP = {
  OPPRETTET: 'Opprettet',
  FEILET: 'Feilet',
  FULLFORT: 'Fullfort',
  UNDER_BEHANDLING: 'Under behandling',
}

const BEHANDLING_TYPES_MAP = {
  MAN: 'Manuell',
  DEL_AUTO: 'Del-automatisk',
  AUTO: 'Automatisk',
}

const ALDE_BEHANDLING_STATUS_MAP = {
  VENTER_SAKSBEHANDLER: 'Venter saksbehandler',
  VENTER_MASKINELL: 'Venter maskinell',
  VENTER_ATTESTERING: 'Venter attestering',
  AVBRUTT_TIl_MANUELL: 'Avbrutt manuelt',
  AUTOMATISK_TIl_MANUELL: 'Avbrutt maskinelt',
  FULLFORT: 'Fullført',
}

const FAGOMRADE_MAP = {
  PEN: 'Pensjon',
  OKO: 'Økonomi',
}

const ALDE_BEHANDLING_STATE_MAP = {
  HENT_GRUNNLAG: 'Hent grunnlag',
  PROSESSER_GRUNNLAG: 'Prosesser grunnlag',
  MANUELL_BEHANDLING: 'Manuell behandling',
  PROSESSER_VURDERING: 'Prosesser vurdering',
  SKIPPED: 'Skipped',
}

export function makeDecoder<M extends Record<string, string>>(map: M) {
  return (key: string) => map[key as keyof M] ?? key
}

export const decodeBehandlingStatus = makeDecoder(BEHANDLING_STATUS_MAP)
export const decodeAktivitetStatus = makeDecoder(AKTIVITET_STATUS_MAP)

export const decodeBehandlingStatusToVariant = makeDecoder(BEHANDLING_STATUS_VARIANT_MAP)

export const decodeBehandlingstype = makeDecoder(BEHANDLING_TYPES_MAP)
export const decodeFagomrade = makeDecoder(FAGOMRADE_MAP)

export const decodeAldeBehandlingStatus = makeDecoder(ALDE_BEHANDLING_STATUS_MAP)

export const decodeAldeBehandlingState = makeDecoder(ALDE_BEHANDLING_STATE_MAP)
