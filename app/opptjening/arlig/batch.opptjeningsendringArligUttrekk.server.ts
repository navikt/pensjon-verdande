import { apiPost } from '~/services/api.server'

export async function opprettOpptjeningsendringArligUttrekk(request: Request): Promise<StartBatchResponse> {
  const result = await apiPost<StartBatchResponse>('/api/opptjening/arliguttrekk/opprett', {}, request)
  return result as StartBatchResponse
}

type StartBatchResponse = {
  behandlingId: number
}
