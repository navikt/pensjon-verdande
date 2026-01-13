import { apiPost } from '~/services/api.server'
import type { HvilendeRettBehandlingResponse } from '~/uforetrygd/hvilende-rett'

export async function opprettHvilendeRettVarselbrevBehandlinger(senesteHvilendeAr: number, request: Request) {
  return await apiPost<HvilendeRettBehandlingResponse>(
    '/api/uforetrygd/hvilenderett/behandling/varsel/batch',
    {
      senesteHvilendeAr,
    },
    request,
  )
}

export async function opprettHvilendeRettOpphorBehandlinger(
  senesteHvilendeAr: number,
  sakIdListe: number[],
  request: Request,
) {
  return await apiPost<HvilendeRettBehandlingResponse>(
    '/api/uforetrygd/hvilenderett/behandling/opphor/batch',
    {
      senesteHvilendeAr,
      sakIdListe,
    },
    request,
  )
}
