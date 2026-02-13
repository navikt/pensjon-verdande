import { apiPost } from '~/services/api.server'

export async function opprettOpptjeningsendringArligOmregning(
  request: Request,
  opptjeningsar: number,
  bolkstorrelse: number,
): Promise<StartBatchResponse> {
  const result = await apiPost<StartBatchResponse>('/api/opptjening/arligendring/opprett', {
    opptjeningsar,
    bolkstorrelse,
  }, request)
  return result as StartBatchResponse
}

type StartBatchResponse = {
  behandlingId: number
  bolkstorrelse: number
}
