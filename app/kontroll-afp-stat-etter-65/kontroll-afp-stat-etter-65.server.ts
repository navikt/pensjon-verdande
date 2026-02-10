import { apiPost } from '~/services/api.server'

export type StartKontrollereAfpStatEtter65Request = {
  // yyyy-MM
  fomMaaned: string
  // Antall måneder å opprette behandlinger for
  antallMaaneder: number
}

type StartBatchResponse = {
  behandlingIds: number[]
}

export async function opprettKontrollereAfpStatEtter65Behandling(
  payload: StartKontrollereAfpStatEtter65Request,
  request: Request,
) {
  const response = await apiPost<StartBatchResponse>(
    '/api/behandling/kontrollere-afp-etter-65/opprett',
    payload,
    request,
  )
  return response
}
