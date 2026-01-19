import { env } from '~/services/env.server'
import { data } from 'react-router'

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
  accessToken: string,
  payload: StartKontrollereSaerskiltSatsRequest,
): Promise<StartBatchResponse> {
  const response = await fetch(`${env.penUrl}/api/behandling/kontrollere-saerskilt-sats/opprett`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    return (await response.json()) as StartBatchResponse
  }

  const text = await response.text()
  throw data(`Feil ved opprettelse av kontrollere særskilt sats-behandling. Feil var\n${text}`, {
    status: response.status,
  })
}
