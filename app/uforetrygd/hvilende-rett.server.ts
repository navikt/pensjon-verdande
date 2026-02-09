import { apiPost } from '~/services/api.server'
import type { HvilendeRettBehandlingResponse } from '~/uforetrygd/hvilende-rett'

export async function opprettHvilendeRettVarselbrevBehandlinger(
  senesteHvilendeAr: number,
  sakIdListe: number[],
  dryRun: boolean,
  request: Request,
) {
  return await apiPost<HvilendeRettBehandlingResponse>(
    '/api/uforetrygd/hvilenderett/behandling/varsel/batch',
    {
      senesteHvilendeAr,
      sakIdListe,
      dryRun,
    },
    request,
  )
}

export async function opprettHvilendeRettOpphorBehandlinger(
  senesteHvilendeAr: number,
  sakIdListe: number[],
  dryRun: boolean,
  request: Request,
) {
  return await apiPost<HvilendeRettBehandlingResponse>(
    '/api/uforetrygd/hvilenderett/behandling/opphor/batch',
    {
      senesteHvilendeAr,
      sakIdListe,
      dryRun,
    },
    request,
  )
}
