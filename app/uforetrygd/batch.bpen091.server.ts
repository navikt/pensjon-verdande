import { apiPost } from '~/services/api.server'

export async function opprettBpen091(
  request: Request,
  beregningsAr: number,
  begrensUtplukk: boolean,
  dryRun: boolean,
): Promise<StartBatchResponse> {
  const result = await apiPost<StartBatchResponse>('/api/uforetrygd/fastsettforventetinntekt/batch', {
    beregningsAr,
    begrensUtplukk,
    dryRun,
  }, request)
  return result as StartBatchResponse
}

type StartBatchResponse = {
  behandlingId: number
}
