import { apiPost } from '~/services/api.server'

export async function startBestemEtteroppgjorResultat(
  request: Request,
  ar: number | null,
  sakIds: number[],
  oppdaterSisteGyldigeEtteroppgjørsÅr: boolean,
) {
  const result = await apiPost<StartBestemEtteroppgjorResponse>('/api/uforetrygd/bestemetteroppgjor/start', {
    sakIds,
    ar,
    oppdaterSisteGyldigeEtteroppgjørsÅr,
  }, request)
  return result as StartBestemEtteroppgjorResponse
}

type StartBestemEtteroppgjorResponse = {
  behandlingId: number
}
