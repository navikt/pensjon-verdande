import { apiPost } from '~/services/api.server'

export async function opprettAdhocBrevBehandling(
  request: Request,
  brevmal: string,
  ekskluderAvdoed: boolean,
): Promise<StartBatchResponse> {
  const response = await apiPost<StartBatchResponse>('/api/brev/adhoc/start', {
    brevmal,
    ekskluderAvdoed,
  }, request)
  return response!
}

type StartBatchResponse = {
  behandlingId: number
}
