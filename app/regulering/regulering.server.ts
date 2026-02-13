import type {
  AggregerteFeilmeldinger,
  AvviksGrense,
  Ekskluderinger,
  ReguleringDetaljer,
  ReguleringStatistikk,
} from '~/regulering/regulering.types'
import { apiGet, apiPost, apiPut } from '~/services/api.server'
import type { DetaljertFremdriftDTO } from '~/types'

export async function avbrytBehandlinger(
  action: 'avbrytBehandlingerFeiletMotPOPP' | 'avbrytBehandlingerFeiletIBeregnYtelse' | null,
  request: Request,
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

  return await apiPost(`/api/vedtak/regulering${urlPostfix}`, {}, request)
}

export const fortsettFaktoromregningModus = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/fortsett/nyeavviksgrenser/faktormodus', undefined, request)
  return true
}

export const fortsettFamilieReguleringerTilBehandling = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/fortsett/familiereguleringertilbehandling', undefined, request)
  return true
}

export const fortsettFeilendeIverksettVedtak = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/fortsett/iverksettvedtak', undefined, request)
  return true
}

export const fortsettFeilendeFamilieReguleringer = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/fortsett/familiereguleringer', undefined, request)
  return true
}

export const fortsettFeilhandteringmodus = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/fortsett/faktorogfeilmodus', undefined, request)
  return true
}

export const fortsettOrkestrering = async (request: Request, behandlingId: string) => {
  await apiPost(`/api/vedtak/regulering/orkestrering/${behandlingId}/fortsett`, undefined, request)
  return { success: true }
}

export const fortsettNyeavviksgrenser = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/fortsett/nyeavviksgrenser', undefined, request)
  return true
}

export const endrePrioritetTilBatch = async (request: Request) => {
  await apiPut('/api/vedtak/regulering/endre/prioritet/batch', undefined, request)
  return { success: true }
}

export const endrePrioritetTilOnline = async (request: Request) => {
  await apiPut('/api/vedtak/regulering/endre/prioritet/online', undefined, request)
  return { success: true }
}

export const getReguleringDetaljer = async (request: Request): Promise<ReguleringDetaljer> => {
  return await apiGet<ReguleringDetaljer>('/api/vedtak/regulering/detaljer', request)
}

export const hentAggregerteFeilmeldinger = async (request: Request): Promise<AggregerteFeilmeldinger> => {
  return await apiGet<AggregerteFeilmeldinger>('/api/vedtak/regulering/aggregerteFeilmeldinger', request)
}

export const hentEksluderteSaker = async (request: Request): Promise<Ekskluderinger> => {
  return await apiGet<Ekskluderinger>('/api/vedtak/regulering/eksludertesaker', request)
}

export const hentOrkestreringsStatistikk = async (
  request: Request,
  behandlingId: string,
): Promise<DetaljertFremdriftDTO> => {
  return await apiGet<DetaljertFremdriftDTO>(`/api/vedtak/regulering/orkestrering/${behandlingId}/detaljer`, request)
}

export const hentReguleringStatistikk = async (request: Request): Promise<ReguleringStatistikk> => {
  return await apiGet<ReguleringStatistikk>('/api/vedtak/regulering/arbeidstabell/statistikk', request)
}

export const oppdaterAvviksgrenser = async (request: Request, newAvviksgrenser: AvviksGrense[]) => {
  await apiPut('/api/vedtak/regulering/avviksgrenser', { avviksgrenser: newAvviksgrenser }, request)
  return { success: true }
}

export const leggTilEkskluderteSaker = async (request: Request, sakIder: number[], kommentar: string) => {
  await apiPost('/api/vedtak/regulering/eksludertesaker/leggTil', { sakIder, kommentar }, request)
  return { erOppdatert: true }
}

export const fjernEkskluderteSaker = async (request: Request, sakIder: number[]) => {
  await apiPost('/api/vedtak/regulering/eksludertesaker/fjern', { sakIder }, request)
  return { erOppdatert: true }
}

export const pauseOrkestrering = async (request: Request, behandlingId: string) => {
  await apiPost(`/api/vedtak/regulering/orkestrering/${behandlingId}/pause`, undefined, request)
  return { success: true }
}

export const startOrkestrering = async (
  request: Request,
  antallFamilier: string | undefined,
  kjorOnline: boolean,
  brukKjoreplan: boolean,
  skalSamordne: boolean,
) => {
  await apiPost(
    '/api/vedtak/regulering/orkestrering/start',
    { antallFamilier, kjorOnline, brukKjoreplan, skalSamordne },
    request,
  )
  return { success: true }
}

export const startUttrekk = async (request: Request, satsDato: string) => {
  await apiPost('/api/vedtak/regulering/uttrekk/start', { satsDato, reguleringsDato: satsDato }, request)
  return { success: true }
}

export const oppdaterUttrekk = async (request: Request) => {
  await apiPost('/api/vedtak/regulering/uttrekk/oppdater', undefined, request)
  return { success: true }
}
