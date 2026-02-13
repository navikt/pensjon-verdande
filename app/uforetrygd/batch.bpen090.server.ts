import { apiPost } from '~/services/api.server'

export async function opprettBpen090(
  request: Request,
  kjoremaaned: number,
  begrensUtplukk: boolean,
  dryRun: boolean,
  prioritet: number,
): Promise<StartBatchResponse> {
  const result = await apiPost<StartBatchResponse>('/api/uforetrygd/lopendeinntektsavkorting/batch', {
    kjoremaaned,
    begrensUtplukk,
    dryRun,
    prioritet,
  }, request)
  return result as StartBatchResponse
}

type StartBatchResponse = {
  behandlingId: number
}
