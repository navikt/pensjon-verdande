import { apiPost } from '~/services/api.server'

export async function startVurderSamboereBatch(request: Request, beregningsAr: number): Promise<StartBatchResponse> {
  const response = await apiPost<StartBatchResponse>('/api/samboer/vurder-samboere/batch', {
    beregningsAr,
  }, request)
  return response!
}

type StartBatchResponse = {
  behandlingId: number
}
