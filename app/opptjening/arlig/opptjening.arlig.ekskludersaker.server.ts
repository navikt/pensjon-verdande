import { apiGet, apiPost } from '~/services/api.server'
import type { EkskluderteSakerResponse, EkskludertSak } from '~/opptjening/arlig/opptjening.types'

export async function hentEkskluderSakerFraArligOmregning(request: Request): Promise<EkskludertSak[]> {
  const result = await apiGet<EkskluderteSakerResponse>('/api/opptjening/eksludertesaker', request)
  return result.ekskluderteSaker
}

export async function ekskluderSakerFraArligOmregning(
  request: Request,
  sakIder: string[],
  kommentar: string | undefined,
): Promise<void> {
  await apiPost('/api/opptjening/eksludertesaker/leggTil', { sakIder, kommentar }, request)
}

export async function fjernEkskluderteSakerFraArligOmregning(request: Request, sakIder: string[]): Promise<void> {
  await apiPost('/api/opptjening/eksludertesaker/fjern', { sakIder }, request)
}

export async function fjernAlleEkskluderteSakerFraArligOmregning(request: Request): Promise<void> {
  await apiPost('/api/opptjening/eksludertesaker/fjernAlle', {}, request)
}
