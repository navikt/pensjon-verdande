import { apiPost } from '~/services/api.server'

type StartBatchResponse = {
  behandlingId: number
}

export async function opprettBpen014(
  request: Request,
  aar: number,
  eps2g: boolean,
  gjenlevende: boolean,
  opprettOppgave: boolean,
): Promise<StartBatchResponse> {
  const response = await apiPost<StartBatchResponse>('/pen/api/inntektskontroll/opprett', {
    aar,
    eps2g,
    gjenlevende,
    opprettOppgave,
  }, request)
  return response!
}
