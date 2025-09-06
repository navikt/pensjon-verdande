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

function makeDecoder<M extends Record<string, string>>(map: M) {
  return (key: string) => map[key as keyof M] ?? key
}

export const decodeBehandlingStatus = makeDecoder(BEHANDLING_STATUS_MAP)
export const decodeAktivitetStatus = makeDecoder(AKTIVITET_STATUS_MAP)

export const decodeBehandlingStatusToVariant = makeDecoder(BEHANDLING_STATUS_VARIANT_MAP)
