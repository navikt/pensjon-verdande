import { apiPost } from '~/services/api.server'

type StartBatchResponse = {
  behandlingId: number
}

export async function opprettGradertAPBehandling(request: Request) {
  const response = await apiPost<StartBatchResponse>('/api/behandling/gradertap/opprett', {}, request)
  return response
}
