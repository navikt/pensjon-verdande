import type {
  AggregerteFeilmeldinger,
  AvviksGrense,
  Ekskluderinger,
  ReguleringDetaljer,
  ReguleringStatistikk,
} from '~/regulering/regulering.types'
import { env } from '~/services/env.server'
import { logger } from '~/services/logger.server'
import type { DetaljertFremdriftDTO } from '~/types'

export async function avbrytBehandlinger(
  action: 'avbrytBehandlingerFeiletMotPOPP' | 'avbrytBehandlingerFeiletIBeregnYtelse' | null,
  accessToken: string,
) {
  let urlPostfix: string

  switch (action) {
    case 'avbrytBehandlingerFeiletMotPOPP':
      urlPostfix = '/avbryt/oppdaterpopp'
      break
    case 'avbrytBehandlingerFeiletIBeregnYtelse':
      urlPostfix = '/avbryt/beregnytelser'
      break
    default:
      urlPostfix = ''
      break
  }

  return await fetch(`${env.penUrl}/api/vedtak/regulering${urlPostfix}`, {
    method: 'POST',
    body: JSON.stringify({}),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })
}

export const fortsettFaktoromregningModus = async (accessToken: string) => {
  await fetch(`${env.penUrl}/api/vedtak/regulering/fortsett/nyeavviksgrenser/faktormodus`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return true
}

export const fortsettFamilieReguleringerTilBehandling = async (accessToken: string) => {
  await fetch(`${env.penUrl}/api/vedtak/regulering/fortsett/familiereguleringertilbehandling`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return true
}

export const fortsettFeilendeIverksettVedtak = async (accessToken: string) => {
  await fetch(`${env.penUrl}/api/vedtak/regulering/fortsett/iverksettvedtak`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return true
}

export const fortsettFeilendeFamilieReguleringer = async (accessToken: string) => {
  await fetch(`${env.penUrl}/api/vedtak/regulering/fortsett/familiereguleringer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return true
}

export const fortsettFeilhandteringmodus = async (accessToken: string) => {
  await fetch(`${env.penUrl}/api/vedtak/regulering/fortsett/faktorogfeilmodus`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return true
}

export const fortsettOrkestrering = async (accessToken: string, behandlingId: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/orkestrering/${behandlingId}/fortsett`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return { success: true }
  } else {
    const error = await response.text()
    throw new Error(error)
  }
}

export const fortsettNyeavviksgrenser = async (accessToken: string) => {
  await fetch(`${env.penUrl}/api/vedtak/regulering/fortsett/nyeavviksgrenser`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return true
}

export const endrePrioritetTilBatch = async (accessToken: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/endre/prioritet/batch`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return {
    success: response.ok,
  }
}

export const endrePrioritetTilOnline = async (accessToken: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/endre/prioritet/online`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return {
    success: response.ok,
  }
}

export const getReguleringDetaljer = async (accessToken: string): Promise<ReguleringDetaljer> => {
  const url = new URL(`${env.penUrl}/api/vedtak/regulering/detaljer`)
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as ReguleringDetaljer
  } else {
    const body = await response.json()
    logger.error(`Feil ved kall til pen ${response.status}`, { body })
    throw new Error()
  }
}

export const hentAggregerteFeilmeldinger = async (accessToken: string): Promise<AggregerteFeilmeldinger> => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/aggregerteFeilmeldinger`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
    priority: 'low',
  })

  if (response.ok) {
    return (await response.json()) as AggregerteFeilmeldinger
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

export const hentEksluderteSaker = async (accessToken: string): Promise<Ekskluderinger> => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/eksludertesaker`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as Ekskluderinger
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

export const hentOrkestreringsStatistikk = async (
  accessToken: string,
  behandlingId: string,
): Promise<DetaljertFremdriftDTO> => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/orkestrering/${behandlingId}/detaljer`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as DetaljertFremdriftDTO
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

export const hentReguleringStatistikk = async (accessToken: string): Promise<ReguleringStatistikk> => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/arbeidstabell/statistikk`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return (await response.json()) as ReguleringStatistikk
  } else {
    const body = await response.text()
    throw new Error(`Feil ved kall til pen ${response.status} ${body}`)
  }
}

export const oppdaterAvviksgrenser = async (accessToken: string, newAvviksgrenser: AvviksGrense[]) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/avviksgrenser`, {
    method: 'PUT',
    body: JSON.stringify({
      avviksgrenser: newAvviksgrenser,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return {
    success: response.ok,
  }
}

export const leggTilEkskluderteSaker = async (accessToken: string, sakIder: number[], kommentar: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/eksludertesaker/leggTil`, {
    method: 'POST',
    body: JSON.stringify({
      sakIder: sakIder,
      kommentar: kommentar,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return { erOppdatert: true }
}

export const fjernEkskluderteSaker = async (accessToken: string, sakIder: number[]) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/eksludertesaker/fjern`, {
    method: 'POST',
    body: JSON.stringify({
      sakIder: sakIder,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return { erOppdatert: true }
}

export const pauseOrkestrering = async (accessToken: string, behandlingId: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/orkestrering/${behandlingId}/pause`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  if (response.ok) {
    return { success: true }
  } else {
    const error = await response.text()
    throw new Error(error)
  }
}

export const startOrkestrering = async (
  accessToken: string,
  antallFamilier: string | undefined,
  kjorOnline: boolean,
  brukKjoreplan: boolean,
  skalSamordne: boolean,
) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/orkestrering/start`, {
    method: 'POST',
    body: JSON.stringify({
      antallFamilier,
      kjorOnline,
      brukKjoreplan,
      skalSamordne,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return {
    success: response.ok,
  }
}

export const startUttrekk = async (accessToken: string, satsDato: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/uttrekk/start`, {
    method: 'POST',
    body: JSON.stringify({
      satsDato,
      reguleringsDato: satsDato,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return {
    success: response.ok,
  }
}

export const oppdaterUttrekk = async (accessToken: string) => {
  const response = await fetch(`${env.penUrl}/api/vedtak/regulering/uttrekk/oppdater`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
  })

  return {
    success: response.ok,
  }
}
