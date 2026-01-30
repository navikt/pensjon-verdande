import { apiPost } from '~/services/api.server'

export type StartKontrollereSaerskiltSatsRequest = {
  /** yyyy-MM */
  kjoereMaaned: string
  /** yyyy */
  kontrollAar: string
  /** yyyy-MM */
  oensketVirkMaaned?: string | null
  /** datetime: yyyy-MM-dd'T'HH:mm:ss */
  kjoeretidspunkt?: string | null
}

type StartBatchResponse = {
  behandlingId: number
}

export async function opprettKontrollereSaerskiltSatsBehandling(
  payload: StartKontrollereSaerskiltSatsRequest,
  request: Request,
) {
  const response = await apiPost<StartBatchResponse>(
    '/api/behandling/kontrollere-saerskilt-sats/opprett',
    payload,
    request,
  )
  return response
}
